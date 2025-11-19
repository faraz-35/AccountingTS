"use client";

import { useFieldArray } from "react-hook-form";
import { useZodForm } from "@/(common)/hooks/use-zod-form";
import {
  journalEntrySchema,
  type JournalEntryFormValues,
} from "../../(common)/schemas";
import { Button, Input } from "@/(common)/components/ui";
import { Card, CardContent } from "@/(common)/components/ui";
import { useAction } from "next-safe-action/hooks";
import { postJournalEntry } from "../actions";
import { Account } from "../../(common)/types";
import { JournalStatus } from "../../(common)/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { paths } from "@/(common)/lib/paths";

interface Props {
  accounts: Account[];
}

export function JournalEntryForm({ accounts }: Props) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useZodForm(journalEntrySchema, {
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      description: "",
      status: JournalStatus.POSTED,
      lines: [
        { account_id: "", debit: 0, credit: 0, description: "" },
        { account_id: "", debit: 0, credit: 0, description: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  const { execute, status } = useAction(postJournalEntry, {
    onSuccess: () => {
      router.push(paths.accounting.journal);
    },
    onError: ({ error }) => {
      setSubmitError(error.serverError || "An unexpected error occurred");
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setSubmitError(null);
    execute(data);
  });

  // Calculate live totals
  const lines = form.watch("lines") || [];
  const totalDebit = lines.reduce(
    (sum, line) => sum + (Number(line.debit) || 0),
    0,
  );
  const totalCredit = lines.reduce(
    (sum, line) => sum + (Number(line.credit) || 0),
    0,
  );
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  // Filter accounts by type for better UX
  const assetAccounts = accounts.filter((acc) => acc.type === "ASSET");
  const liabilityAccounts = accounts.filter((acc) => acc.type === "LIABILITY");
  const equityAccounts = accounts.filter((acc) => acc.type === "EQUITY");
  const revenueAccounts = accounts.filter((acc) => acc.type === "REVENUE");
  const expenseAccounts = accounts.filter((acc) => acc.type === "EXPENSE");

  const AccountSelect = ({ field, label }: { field: any; label: string }) => (
    <select
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      {...field}
    >
      <option value="">{label}</option>
      {assetAccounts.length > 0 && (
        <optgroup label="Assets">
          {assetAccounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.code} - {acc.name}
            </option>
          ))}
        </optgroup>
      )}
      {liabilityAccounts.length > 0 && (
        <optgroup label="Liabilities">
          {liabilityAccounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.code} - {acc.name}
            </option>
          ))}
        </optgroup>
      )}
      {equityAccounts.length > 0 && (
        <optgroup label="Equity">
          {equityAccounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.code} - {acc.name}
            </option>
          ))}
        </optgroup>
      )}
      {revenueAccounts.length > 0 && (
        <optgroup label="Revenue">
          {revenueAccounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.code} - {acc.name}
            </option>
          ))}
        </optgroup>
      )}
      {expenseAccounts.length > 0 && (
        <optgroup label="Expenses">
          {expenseAccounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.code} - {acc.name}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input type="date" {...form.register("date")} />
              {form.formState.errors.date && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...form.register("status")}
              >
                <option value={JournalStatus.POSTED}>Posted</option>
                <option value={JournalStatus.DRAFT}>Draft</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <Input
              placeholder="e.g. Monthly Rent Payment"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <div className="flex-1 min-w-48">
                  <AccountSelect
                    field={form.register(`lines.${index}.account_id`)}
                    label="Select Account..."
                  />
                  {form.formState.errors.lines?.[index]?.account_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.lines[index]?.account_id?.message}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Line Description"
                    {...form.register(`lines.${index}.description`)}
                  />
                </div>
                <div className="w-32">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Debit"
                    {...form.register(`lines.${index}.debit`)}
                  />
                </div>
                <div className="w-32">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Credit"
                    {...form.register(`lines.${index}.credit`)}
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 2}
                >
                  X
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between items-center border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({ account_id: "", debit: 0, credit: 0, description: "" })
              }
            >
              + Add Line
            </Button>

            <div className="text-right space-y-1">
              <div className="text-sm">
                Total Debit:{" "}
                <span className="font-mono font-bold">
                  ${totalDebit.toFixed(2)}
                </span>
              </div>
              <div className="text-sm">
                Total Credit:{" "}
                <span className="font-mono font-bold">
                  ${totalCredit.toFixed(2)}
                </span>
              </div>
              {!isBalanced && (
                <div className="text-red-500 text-sm font-bold">
                  Out of Balance: $
                  {Math.abs(totalDebit - totalCredit).toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {form.formState.errors.lines && (
            <p className="text-red-500 text-sm mt-2">
              {form.formState.errors.lines.message}
            </p>
          )}

          {submitError && (
            <p className="text-red-500 text-sm mt-2">{submitError}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isBalanced || status === "executing"}>
          {status === "executing" ? "Posting..." : "Post Journal Entry"}
        </Button>
      </div>
    </form>
  );
}
