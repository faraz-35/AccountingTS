"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { UserPlus } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/(common)/components/ui/select";

import { inviteUser } from "../actions";

const inviteUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member"]).default("member"),
});

type InviteUserFormValues = z.infer<typeof inviteUserSchema>;

export function UserInviteDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const form = useForm<InviteUserFormValues>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const inviteUserAction = useAction(inviteUser, {
    onSuccess: (data) => {
      console.log("User invited:", data);
      form.reset();
      setOpen(false);
    },
    onError: (error) => {
      console.error("Failed to invite user:", error);
    },
  });

  const onSubmit = (data: InviteUserFormValues) => {
    inviteUserAction.execute(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="team-member@company.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={form.watch("role")}
              onValueChange={(value) =>
                form.setValue("role", value as "admin" | "member")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">
                  Member - Can view and create records
                </SelectItem>
                <SelectItem value="admin">
                  Admin - Can manage users and settings
                </SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm text-red-600">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>

          <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600">
            <p className="font-medium mb-1">What happens next?</p>
            <ul className="text-xs space-y-1">
              <li>• An invitation email will be sent to the user</li>
              <li>• They'll be able to join your organization</li>
              <li>• You can change their role later if needed</li>
            </ul>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={inviteUserAction.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={inviteUserAction.isPending}>
              {inviteUserAction.isPending ? "Inviting..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
