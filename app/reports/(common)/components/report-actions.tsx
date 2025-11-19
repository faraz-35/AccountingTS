import React from "react";

interface ReportActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function ReportActions({
  children,
  className = "",
}: ReportActionsProps) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  );
}
