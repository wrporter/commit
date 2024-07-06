// import type { LoaderArgs } from '@remix-run/node';
// import { json } from '@remix-run/node';
// import { Form, Link, useLoaderData } from '@remix-run/react';
// import { withZod } from '@remix-validated-form/with-zod';
// import {
//     Button,
//     Dialog,
//     DialogContent,
//     DialogTitle,
//     DialogTrigger,
//     DropdownMenuItem,
//     Pill,
//     PillGroup,
//     PillMenu,
//     TextField,
// } from '@wesp-up/ui';
// import React, { useState } from 'react';
// import { ValidatedForm, useFormContext } from 'remix-validated-form';
// import invariant from 'tiny-invariant';
// import { z } from 'zod';
// import { zfd } from 'zod-form-data';
//
// import { requireUser } from '#app/auth.server';
// import { getGroupForUser } from '#app/lib/models/group.server';
// import type { Serialized } from '#app/lib/models/model';
// import { createTask, deleteTask, updateTask } from '#app/lib/models/task.server';
// import type { Task } from '#app/lib/models/task.server';
// import { loader as groupLoader } from '#app/routes/_app.groups_.$groupId';
// import { ResourceFormField } from "~/lib/ui/resource-pill";
//
// export const loader = groupLoader;
//
// export const action = async ({ request, params }: LoaderArgs) => {
//     const user = await requireUser(request);
//
//     const groupId = Number.parseInt(params.groupId ?? '0', 10);
//     invariant(groupId, 'Group not found');
//     const group = await getGroupForUser(user.id, groupId);
//     invariant(group, 'Unauthorized');
//
//     const form = await validator.validate(await request.formData());
//     invariant(form.data, 'No form data');
//     invariant(form.data.taskId, 'No taskId provided');
//
//     if (request.method === 'DELETE') {
//         return deleteTask(user.id, form.data.taskId);
//     }
//
//     if (request.method === 'PUT') {
//         return updateTask(user.id, form.data.taskId, form.data);
//     }
//
//     const task = createTask(group.id, form.data.name);
//     return json(task);
// };
//
// const validator = withZod(
//     z.object({
//         taskId: zfd.numeric(z.number().optional()),
//         icon: z
//             .string()
//             .min(1, 'Please enter an icon.')
//             .max(1, 'Please enter only one icon.'),
//         name: z.string().min(1, 'Please enter a name.'),
//     }),
// );
//
// const fields: ResourceFormField[] = [
//     {
//         label: 'Icon',
//         textFieldProps: {
//             name: 'icon',
//             placeholder: 'Icon',
//             maxLength: 1,
//         },
//     },
//     {
//         label: 'Name',
//         textFieldProps: {
//             name: 'name',
//             placeholder: 'Vacuum',
//         },
//     },
// ];
//
// export default function Page() {
//     const group = useLoaderData<typeof loader>();
//     const [open, setOpen] = useState(false);
//
//     if (!group) {
//         return <div className="py-4">Group not found!</div>;
//     }
//
//     return (
//         <section>
//             <div className="flex justify-between items-center">
//                 <h2 className="text-xl">People</h2>
//
//                 <Dialog open={open} onOpenChange={setOpen}>
//                     <DialogTrigger asChild>
//                         <Button kind="primary">Create Task</Button>
//                     </DialogTrigger>
//                     <DialogContent>
//                         <DialogTitle>Create Task</DialogTitle>
//                         <TaskFormDialog
//                             method="post"
//                             onSubmit={() => setOpen(false)}
//                         />
//                     </DialogContent>
//                 </Dialog>
//             </div>
//
//             <div className="flex flex-col gap-4 mt-4">
//                 {group.people.map((task) => (
//                     <TaskPill groupId={group.id} task={task} />
//                 ))}
//             </div>
//         </section>
//     );
// }
//
// function TaskPill({
//     groupId,
//     task,
// }: {
//     groupId: number;
//     task: Serialized<Task>;
// }) {
//     const [deleteOpen, setDeleteOpen] = useState(false);
//     const [editOpen, setEditOpen] = useState(false);
//
//     return (
//         <>
//             <PillGroup>
//                 <Pill
//                     as={Link}
//                     key={task.id}
//                     to={`/groups/${groupId}/people/${task.id}`}
//                 >
//                     {task.name}
//                 </Pill>
//
//                 <PillMenu>
//                     <DropdownMenuItem onSelect={() => setEditOpen(true)}>
//                         Edit
//                     </DropdownMenuItem>
//                     <DropdownMenuItem onSelect={() => setDeleteOpen(true)}>
//                         Delete
//                     </DropdownMenuItem>
//                 </PillMenu>
//             </PillGroup>
//
//             <Dialog open={editOpen} onOpenChange={setEditOpen}>
//                 <DialogContent>
//                     <DialogTitle>Edit Task: {task.name}</DialogTitle>
//                     <TaskFormDialog
//                         method="put"
//                         onSubmit={() => setEditOpen(false)}
//                         task={task}
//                     />
//                 </DialogContent>
//             </Dialog>
//
//             <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
//                 <DialogContent>
//                     <DialogTitle>Delete Task: {task.name}</DialogTitle>
//                     <Form method="delete" onSubmit={() => setDeleteOpen(false)}>
//                         <input type="hidden" name="taskId" value={task.id} />
//                         <div className="p-4">
//                             Are you sure you want to delete task{' '}
//                             <span className="font-bold">{task.name}</span>?
//                         </div>
//                         <div className="flex p-4 justify-end border-t border-t-gray-300">
//                             <Button type="submit" kind="danger">
//                                 Delete
//                             </Button>
//                         </div>
//                     </Form>
//                 </DialogContent>
//             </Dialog>
//         </>
//     );
// }
//
// function TaskFormDialog({
//     method,
//     onSubmit,
//     task,
// }: {
//     method: 'post' | 'put';
//     onSubmit: () => void;
//     task?: Serialized<Task>;
// }) {
//     const form = useFormContext('createTaskForm');
//
//     return (
//         <ValidatedForm
//             method={method}
//             id="createTaskForm"
//             validator={validator}
//             onSubmit={onSubmit}
//         >
//             {task?.id ? (
//                 <input type="hidden" name="taskId" value={task.id} />
//             ) : undefined}
//
//             <div className="p-4">
//                 <label className="flex flex-col-reverse gap-1">
//                     <TextField
//                         className="flex-grow peer"
//                         name="name"
//                         placeholder="Johnny Appleseed"
//                         aria-describedby="name-error"
//                         autoComplete="off"
//                         data-1p-ignore
//                     />
//                     <span className="text-gray-600 peer-focus:text-blue-600">
//                         Name
//                     </span>
//                 </label>
//                 {form.fieldErrors.name && (
//                     <div className="mt-1 text-red-700" id="name-error">
//                         {form.fieldErrors.name}
//                     </div>
//                 )}
//             </div>
//             <div className="flex p-4 justify-end border-t border-t-gray-300">
//                 <Button type="submit">Create</Button>
//             </div>
//         </ValidatedForm>
//     );
// }
