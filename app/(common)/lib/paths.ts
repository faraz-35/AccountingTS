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
  api: {
    auth: "/api/auth",
    dashboard: "/api/dashboard",
  },
} as const;
