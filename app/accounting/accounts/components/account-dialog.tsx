"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";

import { createAccount } from "../actions";
import { accountSchema } from "../../(common)/schemas";
import { AccountType } from "../../(common)/types";

const formSchema = accountSchema.pick({
  name: true,
  type: true,
  parent_account_id: true,
});

type FormValues = z.infer<typeof formSchema>;

export function AccountDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: AccountType.ASSET,
      parent_account_id: null,
    },
  });

  const createAccountAction = useAction(createAccount, {
    onSuccess: (data) => {
      console.log("Account created:", data);
      form.reset();
      setOpen(false);
    },
    onError: (error) => {
      console.error("Failed to create account:", error);
      // Show more detailed error info
      console.error("Error details:", {
        message: error.message,
        validationErrors: error.validationErrors,
        serverError: error.serverError,
        fetchError: error.fetchError,
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("Submitting account data:", data);

    // Basic client validation
    if (!data.name.trim()) {
      console.error("Account name is required");
      return;
    }

    if (!data.type) {
      console.error("Account type is required");
      return;
    }

    createAccountAction.execute(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Account
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              placeholder="e.g., Cash Operating Account"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Account Type</Label>
            <Select
              value={form.watch("type")}
              onValueChange={(value) =>
                form.setValue("type", value as AccountType)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AccountType.ASSET}>Asset</SelectItem>
                <SelectItem value={AccountType.LIABILITY}>Liability</SelectItem>
                <SelectItem value={AccountType.EQUITY}>Equity</SelectItem>
                <SelectItem value={AccountType.REVENUE}>Revenue</SelectItem>
                <SelectItem value={AccountType.EXPENSE}>Expense</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.type && (
              <p className="text-sm text-red-600">
                {form.formState.errors.type.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent_account_id">Parent Account (Optional)</Label>
            <Select
              value={form.watch("parent_account_id") || ""}
              onValueChange={(value) =>
                form.setValue("parent_account_id", value || null)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent account (optional)" />
              </SelectTrigger>
              <SelectContent>
                {/* Empty option for "None" - handled by SelectValue placeholder */}
                {/* TODO: Fetch and display actual accounts here */}
                {/* This would require fetching accounts data */}
              </SelectContent>
            </Select>
            {form.formState.errors.parent_account_id && (
              <p className="text-sm text-red-600">
                {form.formState.errors.parent_account_id.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createAccountAction.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createAccountAction.isPending}>
              {createAccountAction.isPending ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
