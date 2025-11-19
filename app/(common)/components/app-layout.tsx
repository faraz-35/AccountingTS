"use client";

import { ReactNode } from "react";
import { Sidebar } from "./navigation";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar - hidden on mobile, visible on desktop */}
        <aside className="hidden lg:block w-64 h-screen sticky top-0">
          <Sidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1">
          {/* Mobile sidebar - toggleable */}
          <div className="lg:hidden">
            <Sidebar />
          </div>

          {/* Page content */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
