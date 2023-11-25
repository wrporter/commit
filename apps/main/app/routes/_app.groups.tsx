import type { ActionFunction, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useLoaderData } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
    DropdownMenuItem,
    Pill,
    PillGroup,
    PillMenu,
    TextField,
} from '@wesp-up/ui';
import React, { useState } from 'react';
import { ValidatedForm, useFormContext } from 'remix-validated-form';
import { z } from 'zod';
import { zfd } from 'zod-form-data';

import { requireUser } from '~/auth.server';
import type { Group } from '~/lib/models/group.server';
import {
    createGroupForUser,
    deleteGroupForUser,
    getGroupsForUser,
    updateGroupForUser,
} from '~/lib/models/group.server';
import type { Serialized } from '~/lib/models/model';

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

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button kind="primary">Create Group</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Create Group</DialogTitle>
                        <GroupFormDialog method="post" onSubmit={() => setOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-col gap-4">
                {(groups as Serialized<Group[]>).map((group) => (
                    <GroupPill key={group.id} group={group} />
                ))}
            </div>
        </section>
    );
}

function GroupFormDialog({
    method,
    onSubmit,
    group,
}: {
    method: 'post' | 'put';
    onSubmit: () => void;
    group?: Serialized<Group>;
}) {
    const form = useFormContext('createGroupForm');

    return (
        <ValidatedForm
            method={method}
            id="createGroupForm"
            validator={validator}
            onSubmit={onSubmit}
        >
            {group?.id ? <input type="hidden" name="groupId" value={group.id} /> : undefined}

            <div className="p-4">
                <label className="flex flex-col-reverse gap-1">
                    <TextField
                        className="flex-grow peer"
                        name="name"
                        placeholder={group?.name}
                        aria-describedby="name-error"
                        autoComplete="off"
                        data-1p-ignore
                    />
                    <span className="text-gray-600 peer-focus:text-blue-600">Name</span>
                </label>
                {form.fieldErrors.name && (
                    <div className="mt-1 text-red-700" id="name-error">
                        {form.fieldErrors.name}
                    </div>
                )}
            </div>
            <div className="flex p-4 justify-end border-t border-t-gray-300">
                <Button type="submit">Create</Button>
            </div>
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

                <PillMenu>
                    <DropdownMenuItem onSelect={() => setEditOpen(true)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setDeleteOpen(true)}>Delete</DropdownMenuItem>
                </PillMenu>
            </PillGroup>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogTitle>Edit Group: {group.name}</DialogTitle>
                    <GroupFormDialog
                        method="put"
                        onSubmit={() => setEditOpen(false)}
                        group={group}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogTitle>Delete Group: {group.name}</DialogTitle>
                    <Form method="delete" onSubmit={() => setDeleteOpen(false)}>
                        <input type="hidden" name="groupId" value={group.id} />
                        <div className="p-4">
                            Are you sure you want to delete group{' '}
                            <span className="font-bold">{group.name}</span>?
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
