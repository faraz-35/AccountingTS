export const paths = {
  home: "/dashboard",
  auth: {
    login: "/auth/login",
    register: "/auth/register",
  },
  accounting: {
    root: "/accounting",
    accounts: "/accounting/accounts",
    journal: "/accounting/journal",
    reports: {
      trialBalance: "/reports/financial/trial-balance",
      profitLoss: "/reports/financial/profit-loss",
      balanceSheet: "/reports/financial/balance-sheet",
    },
  },
  sales: {
    customers: "/sales/customers",
    invoices: "/sales/invoices",
  },
  expenses: {
    vendors: "/expenses/vendors",
    bills: "/expenses/bills",
  },
  banking: {
    reconciliation: {
      root: "/banking/reconciliation",
      account: (accountId: string) => `/banking/reconciliation/${accountId}`,
    },
  },
  reports: {
    root: "/reports",
    financial: {
      trialBalance: "/reports/financial/trial-balance",
      profitLoss: "/reports/financial/profit-loss",
      balanceSheet: "/reports/financial/balance-sheet",
    },
  },
  settings: {
    users: "/settings/users",
  },
  api: {
    auth: "/api/auth",
    dashboard: "/api/dashboard",
  },
} as const;
