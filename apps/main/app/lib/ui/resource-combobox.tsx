import { Combobox, ComboboxOption, ComboboxOptions, ComboboxTrigger, FormLabel } from '@wesp-up/ui';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useField } from 'remix-validated-form';

export interface Resource {
    id: number;
}

export interface ResourceComboboxProps<T extends Resource> {
    displayValue: (resource: T) => string;
    resources: T[];
    label: string;
    formName: string;
    placeholder: string;
    className?: string;
}

export function ResourceCombobox<T extends Resource>({
    displayValue,
    resources,
    label,
    formName,
    placeholder,
    ...rest
}: ResourceComboboxProps<T>) {
    const { defaultValue } = useField(formName);
    const [selected, setSelected] = useState<T>(defaultValue ?? resources[0]);
    const [query, setQuery] = useState('');
    const filtered =
        query === ''
            ? resources
            : resources.filter((resource) =>
                  displayValue(resource)
                      .toLowerCase()
                      .replace(/\s+/g, '')
                      .includes(query.toLowerCase().replace(/\s+/g, '')),
              );

    return (
        <FormLabel name={label} {...rest}>
            {/* TODO: Turn the label blue when the combobox is focused */}
            {/* TODO: Fix focus state on combobox */}
            <Combobox name={formName} value={selected} by="id" onChange={setSelected}>
                <ComboboxTrigger
                    displayValue={displayValue}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setQuery(event.target.value)
                    }
                    placeholder={placeholder}
                />
                <ComboboxOptions>
                    {filtered.length === 0 && query !== '' ? (
                        <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                            Nothing found.
                        </div>
                    ) : (
                        filtered.map((resource) => (
                            <ComboboxOption key={resource.id} value={resource}>
                                {displayValue(resource)}
                            </ComboboxOption>
                        ))
                    )}
                </ComboboxOptions>
            </Combobox>
        </FormLabel>
    );
}
