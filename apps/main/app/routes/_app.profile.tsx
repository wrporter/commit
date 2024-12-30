import { Avatar } from "@nextui-org/react";
import { type LoaderFunction } from "@remix-run/node";

import { requireUser } from "#app/auth.server";
import { useUser } from "#app/utils";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request);
  return null;
};

export default function Page() {
  const user = useUser();

  return (
    <div className="p-4">
      <div className="flex gap-4 items-center">
        <Avatar
          src={user.imageUrl ?? undefined}
          name={user.displayName}
          showFallback
          fallback={
            <span className="text-base">
              {user.displayName.charAt(0).toUpperCase()}
            </span>
          }
        />
        <div className="">
          <div className="font-bold">{user.displayName}</div>
          <div className="text-gray-600">{user.email}</div>
        </div>
      </div>

      <div className="mt-4 text-gray-600">
        Using commit since{" "}
        <span className="font-bold">
          {user.createdAt.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
            day: "numeric",
          })}
        </span>
      </div>

      <div className="mt-8 border-1 border-blue-400 p-2 rounded">
        <p>TODO:</p>
        <ul className="list-disc list-inside ml-4">
          <li>Delete account</li>
          <li>Edit account details</li>
          <li>Change password</li>
          <li>Add/remove social providers</li>
        </ul>
      </div>
    </div>
  );
}
