"use client";

import {
  initialFormState,
  mergeForm,
  useStore,
  useTransform,
} from "@tanstack/react-form-nextjs";
import Link from "next/link";
import { useActionState } from "react";
import { z } from "zod/mini";
import { signupFormOptions } from "@/app/auth/form-options";
import { signupAction } from "@/app/auth/signup";
import { useAppForm } from "@/components/form/use-app-form";

export default function SignupPage() {
  const [state, action] = useActionState(signupAction, initialFormState);

  const form = useAppForm({
    ...signupFormOptions,
    transform: useTransform(
      (baseForm) => mergeForm(baseForm, state ?? initialFormState),
      [state],
    ),
  });

  const formErrors = useStore(form.store, (s) => s.errors);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body gap-4">
          <h1 className="card-title text-2xl justify-center">Create account</h1>

          {formErrors.length > 0 && (
            <div role="alert" className="alert alert-error">
              {formErrors.map((error) => (
                <span key={String(error)}>{String(error)}</span>
              ))}
            </div>
          )}

          <form
            action={action as never}
            onSubmit={() => form.handleSubmit()}
            className="flex flex-col gap-4"
          >
            <form.AppForm>
              <div className="flex gap-3">
                <form.AppField
                  name="firstName"
                  validators={{
                    onChange: ({ value }) => (!value ? "Required" : undefined),
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
                    onChange: ({ value }) => (!value ? "Required" : undefined),
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
                    if (!value) return "Email is required";
                    const result = z.email().safeParse(value);
                    return result.success ? undefined : "Enter a valid email";
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
                  onChange: ({ value }) =>
                    !value
                      ? "Password is required"
                      : value.length < 8
                        ? "Password must be at least 8 characters"
                        : undefined,
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
                    return !value
                      ? "Please confirm your password"
                      : value !== password
                        ? "Passwords do not match"
                        : undefined;
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
