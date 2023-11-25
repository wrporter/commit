import { useLoaderData } from '@remix-run/react';
import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
    Pill,
    PillGroup,
} from '@wesp-up/ui';
import React, { useState } from 'react';

import { UserAvatar } from '~/lib/ui/header';
import { loader as groupLoader } from '~/routes/_app.groups_.$groupId';
import { useUser } from '~/utils';

export const loader = groupLoader;

export default function Page() {
    const { group } = useLoaderData<typeof loader>();
    const user = useUser();
    const [open, setOpen] = useState(false);

    if (!group) {
        return <div className="py-4">Group not found!</div>;
    }

    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl">Owners</h2>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button kind="primary">Share</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Share</DialogTitle>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-col gap-4">
                {/* @ts-ignore */}
                {group.owners.map((owner) => (
                    <PillGroup key={owner.id}>
                        <Pill>
                            <div className="flex items-center gap-4">
                                <UserAvatar
                                    imageUrl={owner.imageUrl ?? undefined}
                                    displayName={owner.displayName}
                                    className="w-10 h-10"
                                />
                                {`${owner.displayName}${user.id === owner.id ? ' (you)' : ''}`}
                            </div>
                        </Pill>
                    </PillGroup>
                ))}
            </div>
        </section>
    );
}
