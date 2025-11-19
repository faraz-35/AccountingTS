"use client";

import React, { useState } from "react";
import { Input } from "@/common/components/ui/input";
import { Button } from "@/common/components/ui/button";
import { Label } from "@/common/components/ui/label";

interface DateRangeFilterProps {
  onFilterChange?: (startDate: string, endDate: string) => void;
  className?: string;
}

export function DateRangeFilter({
  onFilterChange,
  className = "",
}: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const handleFilter = () => {
    onFilterChange?.(startDate, endDate);
  };

  return (
    <div className={`flex items-end space-x-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="start-date">Start Date</Label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="end-date">End Date</Label>
        <Input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <Button onClick={handleFilter}>Apply Filter</Button>
    </div>
  );
}
