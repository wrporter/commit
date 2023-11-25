import { Form, Link } from '@remix-run/react';
import type { TextFieldProps } from '@wesp-up/ui';
import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
    DropdownMenuItem,
    FormLabel,
    Pill,
    PillGroup,
    PillMenu,
} from '@wesp-up/ui';
import type { ReactNode } from 'react';
import { useState } from 'react';
import type { Validator } from 'remix-validated-form';
import { ValidatedForm, useFormContext } from 'remix-validated-form';

import { FormInput } from '~/lib/ui/form-input';

export interface HiddenField {
    name: string;
    value: string | number;
}

export interface ResourceFormField {
    label: string;
    textFieldProps: TextFieldProps & { name: string };
}

export interface ResourceFormProps {
    method: 'post' | 'put';
    onSubmit: () => void;
    resource: Resource;
    validator: Validator<any>;
    fields: ResourceFormField[];
    hiddenFields: HiddenField[];
    children?: ReactNode;
}

function constructHiddenFields(hiddenFields: HiddenField[]) {
    return hiddenFields.map((field) =>
        field.value ? (
            <input key={field.name} type="hidden" name={field.name} value={field.value} />
        ) : undefined,
    );
}

export interface FormErrorsProps {
    formId: string;
}
export function FormErrors({ formId }: FormErrorsProps) {
    const form = useFormContext(formId);
    if (form.isValid) {
        return null;
    }

    return (
        <div className="bg-red-75 border border-red-400 rounded p-3 text-neutral-600">
            <p className="mb-2">
                There were errors submitting the form. Please correct the following and try again.
            </p>
            <ul className="list-disc pl-6">
                {Object.entries(form.fieldErrors).map(([name, error]) => (
                    <li key={name}>{error}</li>
                ))}
            </ul>
        </div>
    );
}

export function ResourceForm({
    method,
    onSubmit,
    resource,
    validator,
    fields,
    hiddenFields,
    children,
    ...rest
}: ResourceFormProps) {
    const id = `upsert${resource.type}Form`;

    return (
        <ValidatedForm method={method} id={id} validator={validator} onSubmit={onSubmit} {...rest}>
            {constructHiddenFields(hiddenFields)}

            <div className="p-4 space-y-2">
                {children || undefined}

                {fields
                    ? fields.map((field) => (
                          <FormLabel key={field.label} name={field.label}>
                              {/* <TextField */}
                              {/*    className="flex-grow peer" */}
                              {/*    autoComplete="off" */}
                              {/*    data-1p-ignore */}
                              {/*    {...field.textFieldProps} */}
                              {/* /> */}
                              <FormInput {...field.textFieldProps} />
                          </FormLabel>
                      ))
                    : undefined}

                <FormErrors formId={id} />
            </div>
            <div className="flex p-4 justify-end border-t border-t-gray-300">
                <Button type="submit">Create</Button>
            </div>
        </ValidatedForm>
    );
}

export interface Resource {
    id?: string | number;
    name?: string;
    type: string;
    component?: ReactNode;
}

export interface ResourcePillProps {
    to: string;
    form: ResourceFormPropagatedProps;
}

export interface ResourceFormPropagatedProps
    extends Pick<
        ResourceFormProps,
        'children' | 'fields' | 'hiddenFields' | 'resource' | 'validator'
    > {
    [key: string]: unknown;
}

export function ResourcePill({ to, form }: ResourcePillProps) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    return (
        <>
            <PillGroup>
                <Pill as={Link} key={form.resource.id} to={to}>
                    {form.resource.component ?? form.resource.name}
                </Pill>

                <PillMenu>
                    <DropdownMenuItem onSelect={() => setEditOpen(true)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setDeleteOpen(true)}>Delete</DropdownMenuItem>
                </PillMenu>
            </PillGroup>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogTitle>Edit {form.resource.type}</DialogTitle>
                    <ResourceForm method="put" onSubmit={() => setEditOpen(false)} {...form} />
                </DialogContent>
            </Dialog>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogTitle>Delete {form.resource.type}</DialogTitle>
                    <Form method="delete" onSubmit={() => setDeleteOpen(false)}>
                        {constructHiddenFields(form.hiddenFields)}
                        <div className="p-4">
                            <div>
                                Are you sure you want to delete the following{' '}
                                {form.resource.type.toLowerCase()}?
                            </div>
                            <div className="font-bold">
                                {form.resource.component ?? form.resource.name}
                            </div>
                        </div>
                        <div className="flex p-4 justify-end border-t border-t-gray-300">
                            <Button type="submit" kind="danger">
                                Delete
                            </Button>
                        </div>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}

export interface ResourceDialogProps {
    form: ResourceFormPropagatedProps;
}

export function ResourceDialog({ form }: ResourceDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button kind="primary">Create {form.resource.type}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Create {form.resource.type}</DialogTitle>
                <ResourceForm method="post" onSubmit={() => setOpen(false)} {...form} />
            </DialogContent>
        </Dialog>
    );
}
