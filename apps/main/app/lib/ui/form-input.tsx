import {
  DatePicker,
  type DatePickerProps,
  Image,
  Input,
  type InputProps,
} from "@heroui/react";
import { useField } from "@rvf/react-router";
import { type ChangeEvent, useState } from "react";

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

export interface FormImagePickerProps extends InputProps {
  name: string;
}

function arrayBufferToBase64String(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function arrayBufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function FormImagePicker({
  name,
  label,
  onChange,
  ...rest
}: FormImagePickerProps) {
  const field = useField(name);
  const [image, setImage] = useState<string>("");
  const [imageByteStr, setImageByteStr] = useState<string>("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onload = (e) => {
        setImageByteStr(
          arrayBufferToBase64String(e.target?.result as ArrayBuffer)
        );
      };
      reader.readAsArrayBuffer(file);
    }
    onChange?.(event);
  };
  const {
    value,
    name: ignored,
    ...inputProps
  } = field.getInputProps({
    ...rest,
    onChange: handleChange,
  });
  const errorMessage = field.error();

  return (
    <>
      <Input
        type="file"
        accept="image/*"
        {...inputProps}
        value={value as string}
        label={label}
        isInvalid={Boolean(errorMessage)}
        errorMessage={errorMessage}
        endContent={
          <div className="pointer-events-none flex items-center">
            <Image alt="Image preview" src={image} width={36} />
          </div>
        }
      />
      <input type="hidden" name={name} value={imageByteStr} />
    </>
  );
}

export interface FormDatePickerProps extends DatePickerProps {
  name: string;
}

export function FormDatePicker({ name, label, ...rest }: FormDatePickerProps) {
  const field = useField(name);
  // @ts-ignore
  const { value, ...inputProps } = field.getControlProps({ ...rest });
  const errorMessage = field.error();

  return (
    <DatePicker
      {...inputProps}
      // @ts-ignore
      value={value}
      label={label}
      isInvalid={Boolean(errorMessage)}
      errorMessage={errorMessage}
    />
  );
}
