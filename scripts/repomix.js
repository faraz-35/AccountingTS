#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

/**
 * Intelligent Repomix Script for Next.js Production Starter Template
 *
 * This script automatically detects feature files and their dependencies
 * based on the architectural principles defined in CLAUDE.md
 *
 * Usage: node scripts/repomix.js <feature-name>
 * Example: node scripts/repomix.js settings
 * Example: node scripts/repomix.js auth
 */

const APP_DIR = "app";

// Internal configuration - no external repomix.json dependency
const DEFAULT_CONFIG = {
  exclude: [
    "**/node_modules/**",
    "**/.next/**",
    "**/.vercel/**",
    "**/.git/**",
    "**/dist/**",
    "**/build/**",
    ".env*",
    "package-lock.json",
    "pnpm-lock.yaml",
    "**/*.map",
    "**/*.min.js",
  ],
  intelligentRepomix: {
    enabled: true,
    description:
      "Use the intelligent repomix script that auto-detects feature files based on the Next.js Production Starter Template architecture",
    features: {
      autoDetect: true,
      includeParentCommon: true,
      includeFeatureCommon: true,
      includeApiRoutes: true,
      includeConfigFiles: true,
    },
    output: {
      style: "xml",
      removeComments: false,
      removeEmptyLines: true,
      topFilesLength: 10,
    },
  },
};

// Load the base configuration (now using internal config)
function loadConfig() {
  return DEFAULT_CONFIG;
}

/**
 * Find the feature directory in app/ folder
 * Handles nested features like "dashboard/settings"
 */
function findFeatureDirectory(featureName) {
  // Handle nested features like "dashboard/settings"
  const pathParts = featureName.split("/");
  const mainFeature = pathParts[0];
  const subFeature = pathParts[1];

  const possiblePaths = [
    path.join(APP_DIR, featureName),
    path.join(APP_DIR, `(${featureName})`),
  ];

  // First try exact matches
  for (const featurePath of possiblePaths) {
    if (fs.existsSync(featurePath)) {
      return featurePath;
    }
  }

  // For nested features, look for main feature directory first
  if (subFeature) {
    const mainFeaturePaths = [
      path.join(APP_DIR, mainFeature),
      path.join(APP_DIR, `(${mainFeature})`),
    ];

    for (const mainPath of mainFeaturePaths) {
      if (fs.existsSync(mainPath)) {
        const subPath = path.join(mainPath, subFeature);
        if (fs.existsSync(subPath)) {
          return subPath;
        }
      }
    }
  }

  // Search for any directory containing the feature name
  const allDirs = fs
    .readdirSync(APP_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const dirName of allDirs) {
    if (dirName.toLowerCase().includes(mainFeature.toLowerCase())) {
      const fullPath = path.join(APP_DIR, dirName);
      if (fs.existsSync(fullPath)) {
        // If we have a subFeature, look for it within this directory
        if (subFeature) {
          const subPath = path.join(fullPath, subFeature);
          if (fs.existsSync(subPath)) {
            return subPath;
          }
        } else {
          return fullPath;
        }
      }
    }
  }

  throw new Error(`Feature directory not found for "${featureName}"`);
}

/**
 * Get all parent (common) directories that need to be included
 * Based on the architecture, we need to include all parent common directories
 */
function getParentCommonDirectories() {
  const parentCommonPath = path.join(APP_DIR, "(common)");
  return fs.existsSync(parentCommonPath) ? [parentCommonPath] : [];
}

/**
 * Recursively find all (common) directories within a feature
 */
function findFeatureCommonDirectories(featurePath) {
  const commonDirs = [];

  function findCommonDirs(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      if (item.isDirectory()) {
        const fullPath = path.join(dir, item.name);

        // If it's a (common) directory, add it
        if (item.name === "(common)") {
          commonDirs.push(fullPath);
        } else {
          // Recursively search subdirectories
          findCommonDirs(fullPath);
        }
      }
    }
  }

  findCommonDirs(featurePath);
  return commonDirs;
}

/**
 * Find all API routes that belong to this feature
 */
function findFeatureApiRoutes(featurePath, featureName) {
  const apiRoutes = [];

  // Check for API route in app/api/ that proxies to feature
  const globalApiPath = path.join(APP_DIR, "api", featureName);
  if (fs.existsSync(globalApiPath)) {
    apiRoutes.push(`${globalApiPath}/**`);
  }

  // Check for API routes within the feature directory
  const featureApiPath = path.join(featurePath, "api");
  if (fs.existsSync(featureApiPath)) {
    apiRoutes.push(`${featureApiPath}/**`);
  }

  return apiRoutes;
}

/**
 * Find all files and directories for a given feature
 */
function getFeatureFiles(featureName, options = {}) {
  const featurePath = findFeatureDirectory(featureName);
  console.log(`🔍 Found feature directory: ${featurePath}`);

  const files = [];

  // 1. Include all files in the feature directory
  files.push(`${featurePath}/**`);

  // 2. Include all feature (common) directories
  const featureCommonDirs = findFeatureCommonDirectories(featurePath);
  files.push(...featureCommonDirs.map((dir) => `${dir}/**`));

  // 3. Include parent (common) directory based on parentDepth option
  if (options.parentDepth !== -1) {
    const parentCommonDirs = getParentCommonDirectories();
    if (options.parentDepth === 1) {
      // Only include app/(common)/components/ui
      files.push("app/(common)/components/ui/**");
      console.log("📁 Including only UI components from parent common");
    } else {
      // Include all parent common directories (default)
      files.push(...parentCommonDirs.map((dir) => `${dir}/**`));
    }
  } else {
    console.log("🚫 Excluding top-level app/(common) folder");
  }

  // 4. Include API routes
  const apiRoutes = findFeatureApiRoutes(featurePath, featureName);
  files.push(...apiRoutes);

  // 5. Include related files in root app/ directory
  const rootFiles = ["app/layout.tsx", "app/(home)/page.tsx"];
  files.push(...rootFiles.filter((file) => fs.existsSync(file)));

  // 6. Include configuration files
  if (!options.excludeConfig) {
    const configFiles = [
      "tailwind.config.*",
      "next.config.*",
      "tsconfig.json",
      "package.json",
    ];
    files.push(...configFiles);
  } else {
    console.log("🚫 Excluding configuration files");
    // Always include package.json as it contains dependencies info
    files.push("package.json");
  }

  // 7. Include environment example
  if (fs.existsSync(".env.local.example")) {
    files.push(".env.local.example");
  }

  // 8. Apply UI exclusion if specified
  if (options.excludeUI) {
    console.log("🚫 Excluding UI components");
    // Add exclusion patterns for the runRepomix function to use
    options.excludePatterns = ["app/(common)/components/ui/**", "**/ui/**"];
  }

  return files;
}

/**
 * Generate a descriptive output filename
 */
function generateOutputFilename(featureName, options = {}) {
  const timestamp = new Date().toISOString().split("T")[0];
  const suffixes = [];

  if (options.excludeUI) suffixes.push("no-ui");
  if (options.parentDepth === 1) suffixes.push("p1");
  if (options.parentDepth === -1) suffixes.push("p-1");
  if (options.excludeConfig) suffixes.push("no-config");

  const suffix = suffixes.length > 0 ? `-${suffixes.join("-")}` : "";
  return `repomix-${featureName}${suffix}-${timestamp}.xml`;
}

/**
 * Create temporary repomix configuration and run it
 */
function runRepomix(featureName, files, config, options = {}) {
  // Combine base exclusions with user exclusion patterns
  const allExclusions = [
    ...(config.exclude || []),
    ...(options.excludePatterns || []),
  ];

  const tempConfig = {
    $schema: "https://repomix.dev/schema.json",
    exclude: allExclusions,
    include: files,
    output: {
      filePath: generateOutputFilename(featureName, options),
      style: "xml",
      removeComments: false, // Keep comments for context
      removeEmptyLines: true,
      topFilesLength: 10, // Show important files first
      headerText: `# Repomix for Feature: ${featureName}

Generated: ${new Date().toISOString()}
Options: UI ${options.excludeUI ? "excluded" : "included"} | Config ${options.excludeConfig ? "excluded" : "included"}`,
    },
  };

  const tempConfigPath = "repomix.temp.json";
  fs.writeFileSync(tempConfigPath, JSON.stringify(tempConfig, null, 2));

  console.log(`📦 Running repomix for ${featureName}`);
  console.log(`📄 Output: ${tempConfig.output.filePath}`);
  console.log(`📁 Including ${files.length} file/directory patterns\n`);

  try {
    execSync(`repomix --config ${tempConfigPath}`, { stdio: "inherit" });
    console.log(`\n✅ Successfully generated repomix for ${featureName}`);
    console.log(`📁 Output file: ${tempConfig.output.filePath}`);
  } catch (error) {
    console.error(`\n❌ Error running repomix: ${error.message}`);
    process.exit(1);
  } finally {
    if (fs.existsSync(tempConfigPath)) {
      fs.unlinkSync(tempConfigPath);
    }
  }
}

/**
 * List all available features
 */
function listAvailableFeatures() {
  console.log("🔍 Available features:");

  if (!fs.existsSync(APP_DIR)) {
    console.log("❌ app/ directory not found");
    return;
  }

  // Get all directories in app/
  const items = fs
    .readdirSync(APP_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .sort();

  // Filter out infrastructure directories and find actual features
  const features = [];
  const infrastructureDirs = ["(common)", "api"];

  items.forEach((item) => {
    // Skip infrastructure directories (but keep (home) since it's a page)
    if (infrastructureDirs.includes(item)) {
      return;
    }

    const itemPath = path.join(APP_DIR, item);

    // Check if this is a feature directory (has subdirectories or pages)
    const subItems = fs.readdirSync(itemPath, { withFileTypes: true });

    // Check if this directory has a page.tsx directly
    const hasDirectPage = subItems.some((dirent) => dirent.name === "page.tsx");

    // Check if this has sub-features (subdirectories with pages)
    const hasSubFeatures = subItems.some(
      (dirent) =>
        dirent.isDirectory() &&
        (fs.existsSync(path.join(itemPath, dirent.name, "page.tsx")) ||
          fs.existsSync(path.join(itemPath, dirent.name, "layout.tsx"))),
    );

    if (hasSubFeatures && !hasDirectPage) {
      // This is a multi-page feature, add sub-features
      const subFeatures = subItems
        .filter((dirent) => dirent.isDirectory())
        .filter((dirent) => !dirent.name.startsWith("("))
        .map((dirent) => dirent.name)
        .sort();

      features.push(`📁 ${item}`);
      subFeatures.forEach((subFeature) => {
        features.push(`  📄 ${item}/${subFeature}`);
      });
    } else if (hasDirectPage) {
      // This is a single-page feature (including route groups like (home))
      if (item.startsWith("(")) {
        features.push(`📄 ${item}`);
      } else {
        features.push(`📁 ${item}`);
      }
    }
  });

  if (features.length === 0) {
    console.log("No feature directories found");
    return;
  }

  features.forEach((feature) => console.log(`  ${feature}`));

  // Generate usage examples based on actual features
  console.log("\nUsage examples:");

  // Find examples from the features we found
  const featureNames = [];
  features.forEach((feature) => {
    const match = feature.match(/📁\s([^/]+)/);
    if (match && !match[1].startsWith("(")) {
      featureNames.push(match[1]);
    }
  });

  if (featureNames.includes("dashboard")) {
    console.log("  pnpm code dashboard");
    console.log("  pnpm code dashboard/settings");
  }
  if (featureNames.length > 0) {
    featureNames.forEach((name) => {
      if (name !== "dashboard") {
        console.log(`  pnpm code ${name}`);
      }
    });
  }

  // Check if (home) exists and add it as example
  if (items.includes("(home)")) {
    console.log("  pnpm code home");
  }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    featureName: null,
    list: false,
    help: false,
    excludeUI: false,
    parentDepth: 0, // 0 = unlimited, 1 = one level, -1 = exclude top level
    excludeConfig: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--list" || arg === "-l") {
      options.list = true;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "-eui") {
      options.excludeUI = true;
    } else if (arg === "-p1") {
      options.parentDepth = 1;
    } else if (arg === "-p-1") {
      options.parentDepth = -1;
    } else if (arg === "-rc") {
      options.excludeConfig = true;
    } else if (!arg.startsWith("-") && !options.featureName) {
      options.featureName = arg;
    }
  }

  return options;
}

/**
 * Main execution
 */
function main() {
  const options = parseArgs();

  if (options.help) {
    console.log(`
🔧 Intelligent Repomix Script for Next.js Production Starter Template

This script automatically finds all relevant files for a given feature based on
the project's architecture principles with simple filtering options.

Usage:
  pnpm code <feature-name> [options]    Generate repomix for specific feature
  pnpm code --list                      List all available features
  pnpm code --help                      Show this help message

Options:
  -eui                       Exclude app/(common)/components/ui folder
  -p1                        Include only 1 level of parent common directories
  -p-1                       Exclude the topmost app/(common) folder
  -rc                        Remove configuration files (tailwind, next, tsconfig)
  --list, -l                  List all available features
  --help, -h                  Show this help message

Examples:
  pnpm code dashboard                           # Full dashboard feature
  pnpm code dashboard -eui                       # Exclude UI components
  pnpm code dashboard -p1                        # Only 1 level of parent common
  pnpm code dashboard -p-1                       # No top-level app/(common)
  pnpm code dashboard -rc                        # No configuration files
  pnpm code dashboard -eui -p1 -rc               # Multiple flags
`);
    return;
  }

  if (options.list) {
    listAvailableFeatures();
    return;
  }

  if (!options.featureName) {
    console.error("❌ Please provide a feature name");
    console.log("\nUsage:");
    console.log("  pnpm code <feature-name> [options]");
    console.log("  pnpm code --help");
    console.log("\nExamples:");
    console.log("  pnpm code dashboard -eui");
    console.log("  pnpm code dashboard -rc");
    process.exit(1);
  }

  try {
    const config = loadConfig();
    const files = getFeatureFiles(options.featureName, options);
    runRepomix(options.featureName, files, config, options);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, getFeatureFiles, findFeatureDirectory };
