"use client";

import { useFieldContext } from "./form-context";

interface PasswordFieldProps {
  label: string;
  placeholder?: string;
  autoComplete?: string;
}

export function PasswordField({
  label,
  placeholder = "••••••••",
  autoComplete,
}: PasswordFieldProps) {
  const field = useFieldContext<string>();
  const hasError =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;

  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{label}</legend>
      <input
        id={field.name}
        name={field.name}
        type="password"
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        className={`input w-full ${hasError ? "input-error" : ""}`}
        autoComplete={autoComplete}
      />
      {hasError && (
        <p className="fieldset-label text-error">
          {String(field.state.meta.errors[0])}
        </p>
      )}
    </fieldset>
  );
}
