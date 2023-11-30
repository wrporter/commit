import { Avatar, Button, Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';
import { useLoaderData } from '@remix-run/react';
import { Pill, PillGroup } from '@wesp-up/ui';
import React, { useState } from 'react';

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

                <Button color="primary">Share</Button>
                <Modal isOpen={open} onOpenChange={setOpen}>
                    <ModalContent>
                        <ModalHeader>Share</ModalHeader>
                        <ModalBody>TODO: Add sharing</ModalBody>
                    </ModalContent>
                </Modal>
            </div>

            <div className="flex flex-col gap-4">
                {/* @ts-ignore */}
                {group.owners.map((owner) => (
                    <PillGroup key={owner.id}>
                        <Pill>
                            <div className="flex items-center gap-4">
                                <Avatar
                                    src={owner.imageUrl ?? undefined}
                                    name={owner.displayName}
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
