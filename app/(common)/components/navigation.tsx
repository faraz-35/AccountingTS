"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/common/lib/utils";
import { Button } from "@/common/components/ui/button";
import {
  Building2,
  FileText,
  Users,
  ShoppingCart,
  Receipt,
  TrendingUp,
  Settings,
  Home,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { paths } from "@/common/lib/paths";

const navigationItems = [
  {
    title: "Dashboard",
    href: paths.dashboard.root,
    icon: Home,
  },
  {
    title: "Accounting",
    items: [
      {
        title: "Chart of Accounts",
        href: paths.accounting.accounts,
        icon: Building2,
      },
      {
        title: "Journal Entries",
        href: paths.accounting.journal,
        icon: FileText,
      },
    ],
    icon: Building2,
  },
  {
    title: "Sales",
    items: [
      {
        title: "Customers",
        href: paths.sales.customers,
        icon: Users,
      },
      {
        title: "Invoices",
        href: paths.sales.invoices,
        icon: FileText,
      },
    ],
    icon: ShoppingCart,
  },
  {
    title: "Expenses",
    items: [
      {
        title: "Vendors",
        href: paths.expenses.vendors,
        icon: Users,
      },
      {
        title: "Bills",
        href: paths.expenses.bills,
        icon: Receipt,
      },
    ],
    icon: Receipt,
  },
  {
    title: "Reports",
    items: [
      {
        title: "Trial Balance",
        href: paths.accounting.reports.trialBalance,
        icon: TrendingUp,
      },
      {
        title: "Profit & Loss",
        href: paths.accounting.reports.profitLoss,
        icon: TrendingUp,
      },
      {
        title: "Balance Sheet",
        href: paths.accounting.reports.balanceSheet,
        icon: TrendingUp,
      },
    ],
    icon: TrendingUp,
  },
  {
    title: "Settings",
    items: [
      {
        title: "Users",
        href: paths.settings.users,
        icon: Users,
      },
    ],
    icon: Settings,
  },
];

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  const isActive = (href: string) => {
    return pathname === href;
  };

  const isSectionActive = (items: Array<{ href: string }>) => {
    return items.some((item) => isActive(item.href));
  };

  return (
    <nav className={cn("space-y-2", className)}>
      {navigationItems.map((item) => {
        const isExpanded = expandedSections.has(item.title);
        const Icon = item.icon;

        if (!item.items) {
          // Single item without sub-items
          return (
            <Link key={item.title} href={item.href}>
              <Button
                variant={isActive(item.href) ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive(item.href) && "bg-primary text-primary-foreground",
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          );
        }

        // Section with sub-items
        const sectionActive = isSectionActive(item.items);

        return (
          <div key={item.title}>
            <Button
              variant={sectionActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                sectionActive && "bg-primary text-primary-foreground",
              )}
              onClick={() => toggleSection(item.title)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.title}
            </Button>
            {isExpanded && (
              <div className="ml-6 space-y-1 mt-1">
                {item.items.map((subItem) => {
                  const SubIcon = subItem.icon;
                  return (
                    <Link key={subItem.href} href={subItem.href}>
                      <Button
                        variant={isActive(subItem.href) ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                          "w-full justify-start",
                          isActive(subItem.href) &&
                            "bg-primary text-primary-foreground",
                        )}
                      >
                        <SubIcon className="mr-2 h-3 w-3" />
                        {subItem.title}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div
      className={cn("flex flex-col h-full bg-background border-r", className)}
    >
      {/* Mobile menu button */}
      <div className="lg:hidden p-4 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Logo/Header */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold">Accounting</h1>
        <p className="text-sm text-muted-foreground">Financial Management</p>
      </div>

      {/* Navigation */}
      <div
        className={cn(
          "flex-1 overflow-auto p-4",
          "lg:block",
          isMobileMenuOpen ? "block" : "hidden",
        )}
      >
        <Navigation />
      </div>
    </div>
  );
}
