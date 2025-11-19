"use client";

import { useFieldArray } from "react-hook-form";
import { useZodForm } from "@/(common)/hooks/use-zod-form";
import { invoiceSchema, type InvoiceFormValues } from "../../(common)/schemas";
import { Button, Input } from "@/(common)/components/ui";
import { Card, CardContent } from "@/(common)/components/ui";
import { useAction } from "next-safe-action/hooks";
import {
  saveInvoiceDraft,
  finalizeInvoice,
  generateNextInvoiceNumber,
} from "../actions";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { calculateInvoiceTotals } from "../../(common)/utils";

// Props
interface Props {
  customers: any[];
  revenueAccounts: any[];
  arAccounts: any[];
  initialData?: any;
}

export function InvoiceForm({
  customers,
  revenueAccounts,
  arAccounts,
  initialData,
}: Props) {
  const router = useRouter();
  const [isDraftSaved, setIsDraftSaved] = useState(!!initialData?.id);
  const [currentId, setCurrentId] = useState(initialData?.id);

  const form = useZodForm(invoiceSchema, {
    defaultValues: {
      ...initialData,
      tax_rate: initialData?.tax_rate || 0,
      invoice_number: initialData?.invoice_number || "",
      date: initialData?.date || new Date().toISOString().split("T")[0],
      due_date: initialData?.due_date || new Date().toISOString().split("T")[0],
      lines: initialData?.lines || [
        { description: "", quantity: 1, unit_price: 0, account_id: "" },
      ],
    },
  });

  // Watch tax rate for real-time calculations
  const taxRate = form.watch("tax_rate") || 0;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  // Generate invoice number on mount
  useEffect(() => {
    if (!initialData) {
      generateNextInvoiceNumber({})
        .then(({ data }) => {
          if (data?.invoiceNumber) {
            form.setValue("invoice_number", data.invoiceNumber);
          }
        })
        .catch(console.error);
    }
  }, [initialData, form]);

  // Calculate totals
  const lines = form.watch("lines") || [];
  const totals = calculateInvoiceTotals(lines, taxRate);

  // Actions
  const saveDraft = useAction(saveInvoiceDraft, {
    onSuccess: ({ data }) => {
      if (data?.invoiceId) {
        setCurrentId(data.invoiceId);
        setIsDraftSaved(true);
      }
    },
  });

  const finalize = useAction(finalizeInvoice, {
    onSuccess: () => {
      router.push("/sales/invoices");
    },
  });

  const onSubmit = (data: InvoiceFormValues) => {
    saveDraft.execute({ ...data, id: currentId });
  };

  const handleFinalize = () => {
    if (!arAccounts.length) {
      alert(
        "No Accounts Receivable account found. Please create one in Chart of Accounts.",
      );
      return;
    }

    if (currentId) {
      finalize.execute({
        invoiceId: currentId,
        arAccountId: arAccounts[0].id,
        date: form.getValues("date"),
      });
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Header Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Customer</label>
                <select
                  {...form.register("customer_id")}
                  className="w-full border rounded-md p-2 h-10"
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {form.formState.errors.customer_id && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.customer_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Invoice #</label>
                <Input {...form.register("invoice_number")} />
                {form.formState.errors.invoice_number && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.invoice_number.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Date</label>
                <Input type="date" {...form.register("date")} />
                {form.formState.errors.date && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Due Date</label>
                <Input type="date" {...form.register("due_date")} />
                {form.formState.errors.due_date && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.due_date.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Tax Rate (%)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="0.00"
                  {...form.register("tax_rate", { valueAsNumber: true })}
                />
                {form.formState.errors.tax_rate && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.tax_rate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Notes</label>
                <Input
                  placeholder="Optional notes"
                  {...form.register("notes")}
                />
                {form.formState.errors.notes && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.notes.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Line Items</h3>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Description</label>
                    <Input
                      {...form.register(`lines.${index}.description`)}
                      placeholder="Item description"
                    />
                    {form.formState.errors.lines?.[index]?.description && (
                      <p className="text-red-500 text-xs">
                        {
                          form.formState.errors.lines[index]?.description
                            ?.message
                        }
                      </p>
                    )}
                  </div>

                  <div className="w-48">
                    <label className="text-xs text-gray-500">
                      Revenue Account
                    </label>
                    <select
                      {...form.register(`lines.${index}.account_id`)}
                      className="w-full border rounded-md h-10 text-sm"
                    >
                      <option value="">Select...</option>
                      {revenueAccounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.code} - {a.name}
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.lines?.[index]?.account_id && (
                      <p className="text-red-500 text-xs">
                        {
                          form.formState.errors.lines[index]?.account_id
                            ?.message
                        }
                      </p>
                    )}
                  </div>

                  <div className="w-24">
                    <label className="text-xs text-gray-500">Quantity</label>
                    <Input
                      type="number"
                      step="0.01"
                      {...form.register(`lines.${index}.quantity`)}
                    />
                    {form.formState.errors.lines?.[index]?.quantity && (
                      <p className="text-red-500 text-xs">
                        {form.formState.errors.lines[index]?.quantity?.message}
                      </p>
                    )}
                  </div>

                  <div className="w-32">
                    <label className="text-xs text-gray-500">Unit Price</label>
                    <Input
                      type="number"
                      step="0.01"
                      {...form.register(`lines.${index}.unit_price`)}
                    />
                    {form.formState.errors.lines?.[index]?.unit_price && (
                      <p className="text-red-500 text-xs">
                        {
                          form.formState.errors.lines[index]?.unit_price
                            ?.message
                        }
                      </p>
                    )}
                  </div>

                  <div className="w-24">
                    <label className="text-xs text-gray-500">Total</label>
                    <div className="h-10 flex items-center text-sm font-mono p-2 border rounded bg-gray-50">
                      ${calculateLineTotal(lines[index] || {}).toFixed(2)}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                  >
                    X
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  description: "",
                  quantity: 1,
                  unit_price: 0,
                  account_id: "",
                })
              }
              className="mt-4"
            >
              + Add Line
            </Button>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-mono">${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span className="font-mono">${totals.tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span className="font-mono text-lg">
                    ${totals.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex justify-between items-center">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>

          <div className="flex gap-4">
            <Button
              type="submit"
              variant="outline"
              disabled={saveDraft.status === "executing"}
            >
              {saveDraft.status === "executing" ? "Saving..." : "Save Draft"}
            </Button>

            {isDraftSaved && (
              <Button
                type="button"
                onClick={handleFinalize}
                disabled={finalize.status === "executing"}
              >
                {finalize.status === "executing"
                  ? "Finalizing..."
                  : "Approve & Send"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

// Helper function to calculate line total
function calculateLineTotal(line: {
  quantity?: number;
  unit_price?: number;
}): number {
  return (line.quantity || 0) * (line.unit_price || 0);
}
