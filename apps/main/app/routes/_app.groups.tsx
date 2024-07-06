import { ChevronDownIcon } from '@heroicons/react/24/outline';
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from '@nextui-org/react';
import  { type ActionFunction, type LoaderFunctionArgs , json, redirect } from '@remix-run/node';
import { Form, Link, useLoaderData } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { Pill, PillGroup } from '@wesp-up/ui';
import React, { type ReactNode , useState } from 'react';
import { ValidatedForm, useFormContext } from 'remix-validated-form';
import { z } from 'zod';
import { zfd } from 'zod-form-data';


import { requireUser } from '#app/auth.server';
import  { type Group ,
    createGroupForUser,
    deleteGroupForUser,
    getGroupsForUser,
    updateGroupForUser,
} from '#app/lib/models/group.server';
import  { type Serialized } from '#app/lib/models/model';

const validator = withZod(
    z.object({
        groupId: zfd.numeric(z.number().optional()),
        name: z.string().min(1, 'Please enter a name.'),
    }),
);

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await requireUser(request);
    const groups = await getGroupsForUser(user.id);
    return json({ groups });
};

export const action: ActionFunction = async ({ request }) => {
    const user = await requireUser(request);

    if (request.method === 'DELETE') {
        const formData = await request.formData();
        const groupId = Number.parseInt((formData.get('groupId') as string) ?? '0', 10);
        return deleteGroupForUser(user.id, groupId);
    }

    const form = await validator.validate(await request.formData());
    if (!form.data) {
        return null;
    }

    if (request.method === 'PUT' && form.data.groupId) {
        return updateGroupForUser(user.id, form.data.groupId, form.data.name);
    }

    const group = await createGroupForUser(user.id, form.data.name);
    return redirect(`/groups/${group.id}`);
};

export default function Page() {
    const { groups } = useLoaderData<typeof loader>();
    const [open, setOpen] = useState(false);

    return (
        <section className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl">Groups</h2>

                <Button color="primary" onClick={() => setOpen(true)}>
                    Create Group
                </Button>

                <Modal isOpen={open} onOpenChange={setOpen}>
                    <ModalContent>
                        <ModalHeader>Create Group</ModalHeader>
                        <GroupFormModal
                            method="post"
                            onSubmit={() => setOpen(false)}
                            footer={
                                <Button type="submit" color="primary">
                                    Create
                                </Button>
                            }
                        />
                    </ModalContent>
                </Modal>
            </div>

            <div className="flex flex-col gap-4">
                {(groups as Serialized<Group[]>).map((group) => (
                    <GroupPill key={group.id} group={group} />
                ))}
            </div>
        </section>
    );
}

function GroupFormModal({
    method,
    onSubmit,
    group,
    footer,
}: {
    method: 'post' | 'put';
    onSubmit: () => void;
    group?: Serialized<Group>;
    footer: ReactNode;
}) {
    const form = useFormContext('createGroupForm');

    return (
        <ValidatedForm
            method={method}
            id="createGroupForm"
            validator={validator}
            onSubmit={onSubmit}
        >
            <ModalBody>
                {group?.id ? <input type="hidden" name="groupId" value={group.id} /> : undefined}

                <Input
                    label="Name"
                    className="flex-grow peer"
                    name="name"
                    defaultValue={group?.name}
                    placeholder={group?.name}
                    aria-describedby="name-error"
                    autoComplete="off"
                    data-1p-ignore
                />
                {form.fieldErrors.name && (
                    <div className="mt-1 text-red-700" id="name-error">
                        {form.fieldErrors.name}
                    </div>
                )}
            </ModalBody>

            <ModalFooter>{footer}</ModalFooter>
        </ValidatedForm>
    );
}

function GroupPill({ group }: { group: Serialized<Group> }) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    return (
        <>
            <PillGroup>
                <Pill as={Link} key={group.id} to={`/groups/${group.id}`}>
                    <div className="flex w-full justify-between">
                        <div className="flex flex-col justify-between">
                            <div className="font-bold">{group.name}</div>
                            <div className="text-gray-500 text-xs">
                                Last modified: {new Date(group.updatedAt).toLocaleString()}
                            </div>
                        </div>
                        <div className="flex flex-col items-center text-gray-600">
                            <div>People</div>
                            <div>{group.people?.length}</div>
                        </div>
                    </div>
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
                        <DropdownMenu>
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
                    <ModalHeader>Edit Group: {group.name}</ModalHeader>
                    <GroupFormModal
                        method="put"
                        onSubmit={() => setEditOpen(false)}
                        group={group}
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
                    <ModalHeader>Delete Group: {group.name}</ModalHeader>
                    <Form method="delete" onSubmit={() => setDeleteOpen(false)}>
                        <ModalBody>
                            <input type="hidden" name="groupId" value={group.id} />
                            <p>
                                Are you sure you want to delete group{' '}
                                <span className="font-bold">{group.name}</span>?
                            </p>
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
