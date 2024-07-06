import { ChevronDownIcon } from '@heroicons/react/24/outline';
import  { type InputProps ,
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from '@nextui-org/react';
import { Form, Link } from '@remix-run/react';
import { Pill, PillGroup } from '@wesp-up/ui';
import  { type ReactNode , useState } from 'react';
import  { type Validator , ValidatedForm, useFormContext } from 'remix-validated-form';

import { FormInput } from '#app/lib/ui/form-input';

export interface HiddenField {
    name: string;
    value: string | number;
}

export interface ResourceFormField {
    label: string;
    textFieldProps: InputProps & { name: string };
}

export interface ResourceFormProps {
    method: 'post' | 'put';
    onSubmit: () => void;
    resource: Resource;
    validator: Validator<any>;
    fields: ResourceFormField[];
    hiddenFields: HiddenField[];
    footer: ReactNode;
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
    footer,
    ...rest
}: ResourceFormProps) {
    const id = `upsert${resource.type}Form`;

    return (
        <ValidatedForm method={method} id={id} validator={validator} onSubmit={onSubmit} {...rest}>
            <ModalBody>
                {constructHiddenFields(hiddenFields)}

                <div className="space-y-2">
                    {children || undefined}

                    {fields
                        ? fields.map((field) => (
                              <FormInput
                                  key={field.label}
                                  label={field.label}
                                  {...field.textFieldProps}
                              />
                          ))
                        : undefined}

                    {/* <FormErrors formId={id} /> */}
                </div>
            </ModalBody>

            <ModalFooter>{footer}</ModalFooter>
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

                <div className="flex flex-col border-l border-gray-400">
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                variant="flat"
                                className="flex-grow border-none rounded-l-none rounded-r-sm p-1 min-w-10 w-10"
                            >
                                <ChevronDownIcon className="w-6 h-6" />
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Options">
                            <DropdownItem onPress={() => setEditOpen(true)}>Edit</DropdownItem>
                            <DropdownItem
                                onPress={() => setDeleteOpen(true)}
                                color="danger"
                                className="text-danger"
                            >
                                Delete
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </PillGroup>

            <Modal isOpen={editOpen} onOpenChange={setEditOpen}>
                <ModalContent>
                    <ModalHeader>Edit {form.resource.type}</ModalHeader>
                    <ResourceForm
                        method="put"
                        onSubmit={() => setEditOpen(false)}
                        {...form}
                        footer={
                            <Button type="submit" color="primary">
                                Save
                            </Button>
                        }
                    />
                </ModalContent>
            </Modal>

            <Modal isOpen={deleteOpen} onOpenChange={setDeleteOpen}>
                <ModalContent>
                    <ModalHeader>Delete {form.resource.type}</ModalHeader>
                    <Form method="delete" onSubmit={() => setDeleteOpen(false)}>
                        <ModalBody>
                            {constructHiddenFields(form.hiddenFields)}
                            <p>
                                Are you sure you want to delete the following{' '}
                                {form.resource.type.toLowerCase()}?
                            </p>
                            <div className="font-bold">
                                {form.resource.component ?? form.resource.name}
                            </div>
                        </ModalBody>

                        <ModalFooter>
                            <Button type="submit" color="danger">
                                Delete
                            </Button>
                        </ModalFooter>
                    </Form>
                </ModalContent>
            </Modal>
        </>
    );
}

export interface ResourceModalProps {
    form: ResourceFormPropagatedProps;
}

export function ResourceModal({ form }: ResourceModalProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button color="primary" onClick={() => setOpen(true)}>
                Create {form.resource.type}
            </Button>
            <Modal isOpen={open} onOpenChange={setOpen}>
                <ModalContent>
                    <ModalHeader>Create {form.resource.type}</ModalHeader>
                    <ResourceForm
                        method="post"
                        onSubmit={() => setOpen(false)}
                        {...form}
                        footer={
                            <Button type="submit" color="primary">
                                Create
                            </Button>
                        }
                    />
                </ModalContent>
            </Modal>
        </>
    );
}
