import { useFormMetadata } from "@conform-to/react";
import { EllipsisVerticalIcon, PlusIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  type InputProps,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import {
  ValidatedForm,
  type Validator,
  useFormContext,
} from "@rvf/react-router";
import { type PropsWithChildren, type ReactNode, useState } from "react";
import { Form } from "react-router";

export interface HiddenField {
  name: string;
  value: string | number;
}

export interface ResourceFormField {
  label: string;
  textFieldProps: InputProps & { name: string };
}

export interface ResourceFormProps {
  method: "post" | "put";
  onSubmit: () => void;
  resource: Resource;
  validator: Validator<any>;
  fields: ReactNode[];
  hiddenFields: HiddenField[];
  footer: ReactNode;
  children?: ReactNode;
}

function constructHiddenFields(hiddenFields: HiddenField[]) {
  return hiddenFields.map((field) =>
    field.value !== undefined ? (
      <input
        key={field.name}
        type="hidden"
        name={field.name}
        value={field.value}
      />
    ) : undefined
  );
}

export function FormErrors() {
  const form = useFormContext();
  if (form.formState.isValid) {
    return null;
  }

  return (
    <div className="bg-red-75 border border-red-400 rounded p-3 text-neutral-600">
      <p className="mb-2">
        There were errors submitting the form. Please correct the following and
        try again.
      </p>
      <ul className="list-disc pl-6">
        {Object.entries(form.formState.fieldErrors).map(([name, error]) => (
          <li key={name}>{error}</li>
        ))}
      </ul>
    </div>
  );
}

export function ConformErrors() {
  const form = useFormMetadata();
  if (!form.errors) {
    return null;
  }

  return (
    <div className="bg-red-75 border border-red-400 rounded p-3 text-neutral-600">
      <p className="mb-2">
        There were errors submitting the form. Please correct the following and
        try again.
      </p>
      <ul className="list-disc pl-6">
        {Object.entries(form.errors).map(([name, error]) => (
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
  return (
    <ValidatedForm
      method={method}
      validator={validator}
      onSubmitSuccess={onSubmit}
      {...rest}
    >
      <ModalBody>
        {constructHiddenFields(hiddenFields)}

        <div className="flex flex-col gap-2">
          {fields}
          <FormErrors />
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

export interface ResourceActionsProps extends PropsWithChildren {
  to?: string;
  form: ResourceFormPropagatedProps;
  actions?: ReactNode;
}

export interface ResourceFormPropagatedProps
  extends Pick<
    ResourceFormProps,
    "children" | "fields" | "hiddenFields" | "resource" | "validator"
  > {
  [key: string]: unknown;
}

export function ResourceActions({
  to,
  form,
  actions,
  children,
}: ResourceActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <div className="relative flex justify-end items-center gap-2">
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly size="sm" variant="light">
              <EllipsisVerticalIcon className="text-default-500 size-8" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Actions">
            <>{actions}</>

            {to ? (
              <DropdownItem key="view" href={to}>
                View
              </DropdownItem>
            ) : null}

            <DropdownItem key="edit" onPress={() => setEditOpen(true)}>
              Edit
            </DropdownItem>
            <DropdownItem
              key="delete"
              onPress={() => setDeleteOpen(true)}
              color="danger"
              className="text-danger"
            >
              Delete
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <Modal isOpen={editOpen} onOpenChange={setEditOpen} placement="center">
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
          >
            {children}
          </ResourceForm>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        placement="center"
      >
        <ModalContent>
          <ModalHeader>Delete {form.resource.type}</ModalHeader>
          <Form method="delete" onSubmit={() => setDeleteOpen(false)}>
            <ModalBody>
              {constructHiddenFields(form.hiddenFields)}
              <p>
                Are you sure you want to delete the following{" "}
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
      <Button
        color="primary"
        onPress={() => setOpen(true)}
        startContent={<PlusIcon className="size-4" />}
      >
        Add {form.resource.type}
      </Button>
      <Modal isOpen={open} onOpenChange={setOpen} placement="center">
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
