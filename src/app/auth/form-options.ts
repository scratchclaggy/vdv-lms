import { formOptions } from "@tanstack/react-form-nextjs";

export const loginFormOptions = formOptions({
  defaultValues: {
    email: "",
    password: "",
  },
});

export const signupFormOptions = formOptions({
  defaultValues: {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  },
});
