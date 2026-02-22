"use client";

import Link from "next/link";
import { useState } from "react";
import { signupAction } from "@/app/auth/signup";
import { signupSchema } from "@/app/auth/signup-schema";
import { useAppForm } from "@/components/form/use-app-form";
import { isActionError } from "@/utils/action-result";

export default function SignupPage() {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: signupSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const result = await signupAction(value);
      if (isActionError(result)) {
        setServerError(result.error);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body gap-4">
          <h1 className="card-title text-2xl justify-center">Create account</h1>

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
              <div className="flex gap-3">
                <form.AppField name="firstName">
                  {(field) => (
                    <div className="flex-1">
                      <field.TextField
                        label="First name"
                        placeholder="Jane"
                        autoComplete="given-name"
                      />
                    </div>
                  )}
                </form.AppField>

                <form.AppField name="lastName">
                  {(field) => (
                    <div className="flex-1">
                      <field.TextField
                        label="Last name"
                        placeholder="Doe"
                        autoComplete="family-name"
                      />
                    </div>
                  )}
                </form.AppField>
              </div>

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
                    autoComplete="new-password"
                  />
                )}
              </form.AppField>

              <form.AppField name="confirmPassword">
                {(field) => (
                  <field.PasswordField
                    label="Confirm password"
                    autoComplete="new-password"
                  />
                )}
              </form.AppField>

              <form.SubmitButton label="Create account" />
            </form.AppForm>
          </form>

          <p className="text-center text-sm text-base-content/60">
            Already have an account?{" "}
            <Link href="/login" className="link link-primary">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
