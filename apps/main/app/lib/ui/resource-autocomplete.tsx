import type { AutocompleteProps } from '@nextui-org/react';
import { Autocomplete, AutocompleteItem } from '@nextui-org/react';
import { useState } from 'react';
import { useField } from 'remix-validated-form';

export interface Resource {
    id: number;
}

export interface ResourceComboboxProps<T extends Resource>
    extends Omit<AutocompleteProps, 'children'> {
    displayValue: (resource?: T) => string;
    resources: T[];
    name: string;
}

export function ResourceAutocomplete<T extends Resource>({
    resources,
    displayValue,
    name,
    ...rest
}: ResourceComboboxProps<T>) {
    const { defaultValue } = useField(name);
    // The autocomplete only works properly when values are strings and not numbers
    const [value, setValue] = useState<string>(defaultValue?.toString() ?? '');

    return (
        <>
            <Autocomplete
                {...rest}
                name={name}
                selectedKey={value}
                onSelectionChange={(v) => setValue(v.toString())}
                isClearable={false}
            >
                {resources.map((resource) => (
                    <AutocompleteItem key={resource.id.toString()}>
                        {displayValue(resource)}
                    </AutocompleteItem>
                ))}
            </Autocomplete>
            <input
                type="hidden"
                name={`${name}Id`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        </>
    );
}
