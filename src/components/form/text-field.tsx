"use client";

import { useFieldContext } from "./form-context";
import { type FormError, getErrorMessage } from "./get-error-message";

interface TextFieldProps {
  label: string;
  placeholder?: string;
  type?: "text" | "email";
  autoComplete?: string;
}

export function TextField({
  label,
  placeholder,
  type = "text",
  autoComplete,
}: TextFieldProps) {
  const field = useFieldContext<string>();
  const hasError =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;

  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{label}</legend>
      <input
        id={field.name}
        name={field.name}
        type={type}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        className={`input w-full ${hasError ? "input-error" : ""}`}
        autoComplete={autoComplete}
      />
      {hasError && (
        <p className="fieldset-label text-error">
          {getErrorMessage(field.state.meta.errors[0] as FormError)}
        </p>
      )}
    </fieldset>
  );
}
