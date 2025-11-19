export const paths = {
  home: "/",
  auth: {
    login: "/auth/login",
    register: "/auth/register",
  },
  dashboard: {
    root: "/dashboard",
    settings: "/dashboard/settings",
  },
  // ADD THIS SECTION
  accounting: {
    root: "/accounting",
    accounts: "/accounting/accounts",
    journal: "/accounting/journal",
    reports: "/accounting/reports",
  },
  sales: {
    invoices: "/sales/invoices",
    customers: "/sales/customers",
  },
  api: {
    auth: "/api/auth",
    dashboard: "/api/dashboard",
    accounting: "/api/accounting", // Proxy if needed
  },
} as const;
