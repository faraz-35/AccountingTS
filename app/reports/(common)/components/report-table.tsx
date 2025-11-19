import React from "react";

interface ReportTableProps {
  children: React.ReactNode;
  className?: string;
}

export function ReportTable({ children, className = "" }: ReportTableProps) {
  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function ReportTableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="bg-gray-50">{children}</thead>;
}

export function ReportTableBody({ children }: { children: React.ReactNode }) {
  return (
    <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
  );
}

export function ReportTableRow({ children }: { children: React.ReactNode }) {
  return <tr className="hover:bg-gray-50">{children}</tr>;
}

export function ReportTableCell({
  children,
  className = "",
  align = "left",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}) {
  const alignmentClasses = {
    left: "text-left",
    right: "text-right",
    center: "text-center",
  };

  return (
    <td
      className={`px-6 py-4 whitespace-nowrap text-sm ${alignmentClasses[align]} ${className}`}
    >
      {children}
    </td>
  );
}

ReportTable.Header = ReportTableHeader;
ReportTable.Body = ReportTableBody;
ReportTable.Row = ReportTableRow;
ReportTable.Cell = ReportTableCell;
