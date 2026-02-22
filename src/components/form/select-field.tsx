"use client";

import { useFieldContext } from "./form-context";
import { type FormError, getErrorMessage } from "./get-error-message";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  options: SelectOption[];
  placeholder?: string;
}

export function SelectField({ label, options, placeholder }: SelectFieldProps) {
  const field = useFieldContext<string>();
  const hasError =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;

  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{label}</legend>
      <select
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className={`select w-full ${hasError ? "select-error" : ""}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hasError && (
        <p className="fieldset-label text-error">
          {getErrorMessage(field.state.meta.errors[0] as FormError)}
        </p>
      )}
    </fieldset>
  );
}
