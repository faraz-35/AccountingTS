"use client";

import { formatCurrency } from "@/(common)/utils/helpers";
import { ReportRow } from "../types";

interface Props {
  title: string;
  rows: ReportRow[];
  totalLabel: string;
  showAccountTypeTotals?: boolean;
}

export function ReportTable({ title, rows, totalLabel, showAccountTypeTotals = true }: Props) {
  // Group by Type
  const grouped = rows.reduce((acc, row) => {
    const type = row.account_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(row);
    return acc;
  }, {} as Record<string, ReportRow[]>);

  const total = rows.reduce((sum, row) => sum + Number(row.amount), 0);

  return (
    <div className="bg-white shadow rounded-lg p-6 print:shadow-none">
      <h2 className="text-xl font-bold mb-4 pb-2 border-b">{title}</h2>

      {Object.entries(grouped).map(([type, typeRows]) => (
        <div key={type} className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{type}</h3>
          <table className="w-full text-sm">
            <tbody>
              {typeRows.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 text-gray-600">{row.account_code} - {row.account_name}</td>
                  <td className="py-2 text-right font-medium">
                    {formatCurrency(row.amount)}
                  </td>
                </tr>
              ))}
              {showAccountTypeTotals && (
                <tr className="font-bold bg-gray-50">
                  <td className="py-2 pl-2">Total {type}</td>
                  <td className="py-2 text-right">
                     {formatCurrency(typeRows.reduce((s, r) => s + Number(r.amount), 0))}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ))}

      <div className="flex justify-between items-center border-t-2 border-gray-200 pt-4 mt-4">
        <span className="text-lg font-bold">{totalLabel}</span>
        <span className="text-lg font-bold">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
