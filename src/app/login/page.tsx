"use client";

import {
  initialFormState,
  mergeForm,
  useStore,
  useTransform,
} from "@tanstack/react-form-nextjs";
import Link from "next/link";
import { useActionState } from "react";
import { loginFormOptions } from "@/app/auth/form-options";
import { loginAction } from "@/app/auth/login";
import { useAppForm } from "@/components/form/use-app-form";

export default function LoginPage() {
  const [state, action] = useActionState(loginAction, initialFormState);

  const form = useAppForm({
    ...loginFormOptions,
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
          <h1 className="card-title text-2xl justify-center">Sign in</h1>

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
              <form.AppField
                name="email"
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? "Email is required"
                      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                        ? "Enter a valid email"
                        : undefined,
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
                    !value ? "Password is required" : undefined,
                }}
              >
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
