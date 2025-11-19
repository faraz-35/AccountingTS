"use client";

import { Button } from "@/(common)/components/ui/button";
import { Download, Calendar } from "lucide-react";

interface Props {
  onPrint?: () => void;
  onExport?: () => void;
  children?: React.ReactNode;
}

export function ReportActions({ onPrint, onExport, children }: Props) {
  return (
    <div className="flex gap-2 items-center print:hidden">
      {children}
      <Button variant="outline" onClick={onPrint}>
        <Calendar className="w-4 h-4 mr-2" />
        Print / PDF
      </Button>
      <Button variant="outline" onClick={onExport}>
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>
    </div>
  );
}
