"use client";

import Link from "next/link";
import { useState } from "react";
import { signupAction } from "@/app/auth/signup";
import { signupSchema } from "@/app/auth/signup-schema";
import { useAppForm } from "@/components/form/use-app-form";

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
    onSubmit: async ({ value }) => {
      setServerError(null);
      const result = await signupAction(value);
      if (result?.error) {
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
                <form.AppField
                  name="firstName"
                  validators={{
                    onChange: ({ value }) => {
                      const result =
                        signupSchema.shape.firstName.safeParse(value);
                      return result.success
                        ? undefined
                        : result.error.issues[0]?.message;
                    },
                  }}
                >
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

                <form.AppField
                  name="lastName"
                  validators={{
                    onChange: ({ value }) => {
                      const result =
                        signupSchema.shape.lastName.safeParse(value);
                      return result.success
                        ? undefined
                        : result.error.issues[0]?.message;
                    },
                  }}
                >
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

              <form.AppField
                name="email"
                validators={{
                  onChange: ({ value }) => {
                    const result = signupSchema.shape.email.safeParse(value);
                    return result.success
                      ? undefined
                      : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <field.TextField
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                )}
              </form.AppField>

              <form.AppField
                name="password"
                validators={{
                  onChange: ({ value }) => {
                    const result = signupSchema.shape.password.safeParse(value);
                    return result.success
                      ? undefined
                      : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <field.PasswordField
                    label="Password"
                    autoComplete="new-password"
                  />
                )}
              </form.AppField>

              <form.AppField
                name="confirmPassword"
                validators={{
                  onChangeListenTo: ["password"],
                  onChange: ({ value, fieldApi }) => {
                    const password = fieldApi.form.getFieldValue("password");
                    if (!value) return "Please confirm your password";
                    if (value !== password) return "Passwords do not match";
                  },
                }}
              >
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
