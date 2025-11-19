"use client";

import { Input } from "@/(common)/components/ui/input";
import { Label } from "@/(common)/components/ui/label";

interface Props {
  startDate?: string;
  endDate?: string;
  endDateMin?: string;
}

export function DateRangeFilter({ startDate, endDate, endDateMin }: Props) {
  return (
    <>
      <div>
        <Label htmlFor="start" className="text-xs font-bold">Start Date</Label>
        <Input
          type="date"
          id="start"
          name="start"
          defaultValue={startDate}
          required
        />
      </div>
      <div>
        <Label htmlFor="end" className="text-xs font-bold">End Date</Label>
        <Input
          type="date"
          id="end"
          name="end"
          defaultValue={endDate}
          min={endDateMin}
          required
        />
      </div>
    </>
  );
}
