import  { type ActionFunctionArgs , json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import React from 'react';
import invariant from 'tiny-invariant';
import { z } from 'zod';
import { zfd } from 'zod-form-data';

import { requireUser } from '#app/auth.server';
import { getGroupForUser } from '#app/lib/models/group.server';
import { createPerson, deletePersonForUser, updatePersonForUser } from '#app/lib/models/person.server';
import  { type ResourceFormField, type ResourceFormPropagatedProps , ResourceModal, ResourcePill } from '#app/lib/ui/resource-pill';
import { loader as groupLoader } from '#app/routes/_app.groups_.$groupId';

export const loader = groupLoader;

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const user = await requireUser(request);

    const groupId = Number.parseInt(params.groupId ?? '0', 10);
    invariant(groupId, 'Group not found');
    const group = await getGroupForUser(user.id, groupId);
    invariant(group, 'Unauthorized');

    if (request.method === 'DELETE') {
        const formData = await request.formData();
        const personId = Number.parseInt((formData.get('personId') as string) ?? '0', 10);
        return deletePersonForUser(user.id, personId);
    }

    const form = await validator.validate(await request.formData());
    invariant(form.data, 'No form data');

    if (request.method === 'PUT' && form.data.personId) {
        return updatePersonForUser(user.id, form.data.personId, form.data.name);
    }

    const person = createPerson(group.id, form.data.name);
    return json(person);
};

const validator = withZod(
    z.object({
        personId: zfd.numeric(z.number().optional()),
        name: z.string().min(1, 'Please enter a name.').max(50),
    }),
);

const fields: ResourceFormField[] = [
    {
        label: 'Name',
        textFieldProps: {
            name: 'name',
            placeholder: 'Johnny Appleseed',
        },
    },
];

export default function Page() {
    const { group } = useLoaderData<typeof loader>();

    if (!group) {
        return <div className="py-4">Group not found!</div>;
    }

    const form: ResourceFormPropagatedProps = {
        validator,
        fields,
        hiddenFields: [],
        resource: { type: 'Person' },
    };

    return (
        <section>
            <div className="flex justify-between items-center">
                <h2 className="text-xl">People</h2>

                <ResourceModal form={form} />
            </div>

            <div className="flex flex-col gap-4 mt-4">
                {group.people.map((person) => (
                    <ResourcePill
                        key={person.id}
                        to={`/groups/${group.id}/people/${person.id}`}
                        form={{
                            ...form,
                            resource: {
                                type: form.resource.type,
                                id: person.id,
                                name: person.name,
                            },
                            hiddenFields: form.hiddenFields.concat([
                                { name: 'personId', value: person.id },
                            ]),
                        }}
                    />
                ))}
            </div>
        </section>
    );
}
