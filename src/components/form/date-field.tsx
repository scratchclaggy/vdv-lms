"use client";

import { useFieldContext } from "./form-context";
import { type FormError, getErrorMessage } from "./get-error-message";

interface DateFieldProps {
  label: string;
}

export function DateField({ label }: DateFieldProps) {
  const field = useFieldContext<string>();
  const hasError =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;

  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{label}</legend>
      <input
        id={field.name}
        name={field.name}
        type="date"
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className={`input w-full ${hasError ? "input-error" : ""}`}
      />
      {hasError && (
        <p className="fieldset-label text-error">
          {getErrorMessage(field.state.meta.errors[0] as FormError)}
        </p>
      )}
    </fieldset>
  );
}
