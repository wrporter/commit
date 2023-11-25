import { TextField } from '@wesp-up/ui';
import { useField } from 'remix-validated-form';
import { twMerge } from 'tailwind-merge';

export interface FormInputProps {
    name: string;
    className?: string;
}
export function FormInput({ name, className, ...rest }: FormInputProps) {
    const { getInputProps } = useField(name);

    return (
        <TextField
            {...getInputProps({ ...rest })}
            className={twMerge('flex-grow peer', className)}
            autoComplete="off"
            data-1p-ignore
        />
    );
}
