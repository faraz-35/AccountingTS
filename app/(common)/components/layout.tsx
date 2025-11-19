import React from "react";
import { Sidebar } from "./navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:block w-64 h-screen sticky top-0">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Mobile Sidebar */}
          <div className="lg:hidden">
            <Sidebar className="w-full h-auto" />
          </div>

          {/* Page Content */}
          <main className="p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
