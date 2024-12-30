import  { type InputProps , Input } from "@nextui-org/react";
import { useField } from "remix-validated-form";

export interface FormInputProps extends InputProps {
  name: string;
}
export function FormInput({ name, label, ...rest }: FormInputProps) {
  const { getInputProps, error } = useField(name);

  return (
    <Input
      {...getInputProps({ ...rest })}
      label={label}
      autoComplete="off"
      data-1p-ignore
      isInvalid={Boolean(error)}
      errorMessage={error}
    />
  );
}
