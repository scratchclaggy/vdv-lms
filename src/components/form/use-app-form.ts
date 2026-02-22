"use client";

import { createFormHook } from "@tanstack/react-form";
import { DateField } from "./date-field";
import { fieldContext, formContext } from "./form-context";
import { PasswordField } from "./password-field";
import { SelectField } from "./select-field";
import { SubmitButton } from "./submit-button";
import { TextField } from "./text-field";
import { TimeField } from "./time-field";

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    PasswordField,
    SelectField,
    DateField,
    TimeField,
  },
  formComponents: {
    SubmitButton,
  },
});
