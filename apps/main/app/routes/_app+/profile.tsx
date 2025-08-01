import { Avatar } from "@heroui/react";
import { type LoaderFunction } from "react-router";

import { requireUser } from "~/lib/authentication/authentication.server.js";
import { Header } from "~/lib/ui/header";
import { useUser } from "~/utils.js";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request);
  return null;
};

export default function Component() {
  const user = useUser();

  return (
    <>
      <Header />

      <div className="p-4 flex flex-col gap-4">
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

        <div className="border border-blue-400 p-2 rounded">
          <p>TODO:</p>
          <ul className="list-disc list-inside ml-4">
            <li>Delete account</li>
            <li>Edit account details</li>
            <li>Change password</li>
            <li>Add/remove social providers</li>
          </ul>
        </div>
      </div>
    </>
  );
}
