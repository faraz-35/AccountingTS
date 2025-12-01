"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "../components/login-form";
import { PasswordResetForm } from "../components/password-reset-form";
import { paths } from "@/common/lib/paths";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const handleLoginSuccess = () => {
    if (redirectTo) {
      router.push(redirectTo);
    } else {
      router.push(paths.home);
    }
  };

  const handlePasswordResetSuccess = () => {
    // Password reset email sent, show login form again after 3 seconds
    setTimeout(() => {
      setShowPasswordReset(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to your account to continue
          </p>
        </div>

        {showPasswordReset ? (
          <PasswordResetForm
            onSuccess={handlePasswordResetSuccess}
            onCancel={() => setShowPasswordReset(false)}
          />
        ) : (
          <>
            <LoginForm
              onSuccess={handleLoginSuccess}
              redirectTo={redirectTo || undefined}
            />

            <div className="text-center space-y-2 text-sm">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href={paths.auth.register}
                  className="text-primary hover:underline"
                >
                  Sign up
                </Link>
              </p>
              <p>
                <button
                  type="button"
                  onClick={() => setShowPasswordReset(true)}
                  className="text-primary hover:underline"
                >
                  Forgot your password?
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
