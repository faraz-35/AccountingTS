"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import {
  passwordResetSchema,
  type PasswordResetInput,
} from "@/common/lib/schemas";
import { createSupabaseClient } from "@/common/lib/supabase-client";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";

interface PasswordResetFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PasswordResetForm({
  onSuccess,
  onCancel,
}: PasswordResetFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<PasswordResetInput>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: PasswordResetInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseClient();

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }

      setIsSuccess(true);
      onSuccess?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Mail className="h-5 w-5" />
            Password Reset Email Sent
          </CardTitle>
          <CardDescription>
            Check your email for reset instructions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We've sent a password reset link to {form.getValues("email")}.
            Please check your email and follow the instructions to reset your
            password.
          </p>
          <div className="mt-4">
            <Button variant="outline" className="w-full" onClick={onCancel}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a link to reset your
          password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              {...form.register("email")}
              disabled={isLoading}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
