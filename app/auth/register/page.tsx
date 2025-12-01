"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { RegisterForm } from "../components/register-form";
import { paths } from "@/common/lib/paths";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const handleRegisterSuccess = () => {
    setTimeout(() => {
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.push(paths.auth.login);
      }
    }, 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-2">
            Get started with your accounting dashboard
          </p>
        </div>

        <RegisterForm
          onSuccess={handleRegisterSuccess}
          redirectTo={redirectTo || undefined}
        />

        <div className="text-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={paths.auth.login}
              className="text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
