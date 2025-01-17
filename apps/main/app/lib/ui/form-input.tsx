import { Input, type InputProps } from "@nextui-org/react";
import { useField } from "@rvf/react-router";

export interface FormInputProps extends InputProps {
  name: string;
}

export function FormInput({ name, label, ...rest }: FormInputProps) {
  const field = useField(name);
  const { value, ...inputProps } = field.getInputProps({ ...rest });
  const errorMessage = field.error();

  return (
    <Input
      {...inputProps}
      value={value as string}
      label={label}
      autoComplete="off"
      data-1p-ignore
      isInvalid={Boolean(errorMessage)}
      errorMessage={errorMessage}
    />
  );
}
