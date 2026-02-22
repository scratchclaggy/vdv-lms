"use client";

import Link from "next/link";
import { useState } from "react";
import { loginAction } from "@/app/auth/login";
import { loginSchema } from "@/app/auth/login-schema";
import { useAppForm } from "@/components/form/use-app-form";
import { isActionError } from "@/utils/action-result";

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: { email: "", password: "" },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const result = await loginAction(value);
      if (isActionError(result)) {
        setServerError(result.error);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body gap-4">
          <h1 className="card-title text-2xl justify-center">Sign in</h1>

          {serverError && (
            <div role="alert" className="alert alert-error">
              <span>{serverError}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="flex flex-col gap-4"
          >
            <form.AppForm>
              <form.AppField name="email">
                {(field) => (
                  <field.TextField
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                )}
              </form.AppField>

              <form.AppField name="password">
                {(field) => (
                  <field.PasswordField
                    label="Password"
                    autoComplete="current-password"
                  />
                )}
              </form.AppField>

              <form.SubmitButton label="Sign in" />
            </form.AppForm>
          </form>

          <p className="text-center text-sm text-base-content/60">
            Don't have an account?{" "}
            <Link href="/signup" className="link link-primary">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
