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
  accounting: {
    root: "/accounting",
    accounts: "/accounting/accounts",
    journal: "/accounting/journal",
    reports: {
      root: "/reports",
      trialBalance: "/reports/financial/trial-balance",
      profitLoss: "/reports/financial/profit-loss",
      balanceSheet: "/reports/financial/balance-sheet",
    },
  },
  sales: {
    invoices: "/sales/invoices",
    customers: "/sales/customers",
  },
  expenses: {
    bills: "/expenses/bills",
    vendors: "/expenses/vendors",
  },
  settings: {
    users: "/settings/users",
  },
  api: {
    auth: "/api/auth",
    dashboard: "/api/dashboard",
    accounting: "/api/accounting",
  },
} as const;
