"use client";

import { useState } from "react";
import { useZodForm } from "@/(common)/hooks/use-zod-form";
import { payBillSchema } from "../../(common)/schemas";
import { Button, Input } from "@/(common)/components/ui";
import { Card, CardContent } from "@/(common)/components/ui";
import { useAction } from "next-safe-action/hooks";
import { recordBillPayment } from "../actions";

interface Props {
  bill: any;
  bankAccounts: any[];
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentModal({ bill, bankAccounts, isOpen, onClose }: Props) {
  const form = useZodForm(payBillSchema, {
    defaultValues: {
      billId: bill.id,
      amount: bill.total_amount, // Default to full amount
      date: new Date().toISOString().split('T')[0],
      reference: "",
      paymentAccountId: "",
    }
  });

  const { execute, status } = useAction(recordBillPayment, {
    onSuccess: () => {
      onClose();
      window.location.reload(); // Simple refresh to show updated status
    }
  });

  const onSubmit = (data: any) => {
    execute(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Pay Bill #{bill.bill_number}</h2>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bank Account</label>
            <select
              {...form.register("paymentAccountId")}
              className="w-full border rounded-md p-2 h-10"
            >
              <option value="">Select Account...</option>
              {bankAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({formatCurrency(acc.current_balance || 0)})
                </option>
              ))}
            </select>
            {form.formState.errors.paymentAccountId && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.paymentAccountId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <Input
              type="number"
              step="0.01"
              {...form.register("amount")}
            />
            {form.formState.errors.amount && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <Input
              type="date"
              {...form.register("date")}
            />
            {form.formState.errors.date && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.date.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reference / Check #</label>
            <Input
              placeholder="Check number or reference"
              {...form.register("reference")}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={status === 'executing'}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={status === 'executing'}
            >
              {status === 'executing' ? 'Processing...' : 'Pay Bill'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Simple currency formatter
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
