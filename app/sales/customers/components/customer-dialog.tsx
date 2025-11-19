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
} from "@/(common)/components/ui/dialog";
import { Button } from "@/(common)/components/ui/button";
import { Input } from "@/(common)/components/ui/input";
import { Label } from "@/(common)/components/ui/label";

import { upsertCustomer } from "../actions";
import { customerSchema } from "../../(common)/schemas";

const formSchema = customerSchema.pick({
  name: true,
  email: true,
  phone: true,
  address: true,
  currency: true,
});

type FormValues = z.infer<typeof formSchema>;

export function CustomerDialog({
  children
}: {
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      currency: "USD",
    },
  });

  const upsertCustomerAction = useAction(upsertCustomer, {
    onSuccess: (data) => {
      console.log("Customer created:", data);
      form.reset();
      setOpen(false);
    },
    onError: (error) => {
      console.error("Failed to create customer:", error);
    },
  });

  const onSubmit = (data: FormValues) => {
    upsertCustomerAction.execute(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Customer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Customer Name</Label>
            <Input
              id="name"
              placeholder="e.g., Acme Corporation"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="customer@example.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="+1 (555) 123-4567"
              {...form.register("phone")}
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-red-600">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="123 Main St, City, State 12345"
              {...form.register("address")}
            />
            {form.formState.errors.address && (
              <p className="text-sm text-red-600">
                {form.formState.errors.address.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              placeholder="USD"
              maxLength={3}
              {...form.register("currency")}
            />
            {form.formState.errors.currency && (
              <p className="text-sm text-red-600">
                {form.formState.errors.currency.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={upsertCustomerAction.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={upsertCustomerAction.isPending}>
              {upsertCustomerAction.isPending ? "Creating..." : "Create Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
