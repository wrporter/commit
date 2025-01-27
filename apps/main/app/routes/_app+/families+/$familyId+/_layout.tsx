import {
  Bars3BottomLeftIcon,
  BriefcaseIcon,
  ClipboardDocumentCheckIcon,
  CursorArrowRaysIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Listbox,
  ListboxItem,
} from "@heroui/react";
import { useState } from "react";
import {
  type LoaderFunctionArgs,
  Outlet,
  isRouteErrorResponse,
  useLocation,
  useParams,
} from "react-router";

import type { Route } from "./+types/_layout.js";

import { requireUser } from "~/lib/authentication/authentication.server.js";
import { requireFamilyAccess } from "~/lib/authorization/require-family.js";
import { ErrorState } from "~/lib/ui/error-state.js";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  const family = await requireFamilyAccess(user, params.familyId);
  return { family };
};

export default function Component({ loaderData }: Route.ComponentProps) {
  const { pathname } = useLocation();
  const params = useParams();
  const base = `/families/${params.familyId}`;

  const [isOpen, setIsOpen] = useState(false);

  const links = [
    {
      to: `${base}/people`,
      label: "People",
      Icon: UserGroupIcon,
    },
    {
      to: `${base}/chores`,
      label: "Chores",
      Icon: BriefcaseIcon,
    },
    {
      to: `${base}/assignments`,
      label: "Assignments",
      Icon: CursorArrowRaysIcon,
    },
    {
      to: `${base}/chore-chart`,
      label: "Chore Chart",
      Icon: ClipboardDocumentCheckIcon,
    },
  ];

  return (
    <section className="p-4">
      <Outlet
        context={{
          header: (
            <>
              <Button
                isIconOnly
                aria-label="Navigation"
                color="primary"
                variant="light"
                onPress={() => setIsOpen((v) => !v)}
              >
                <Bars3BottomLeftIcon className="text-default-600 w-8" />
              </Button>

              <Drawer
                isOpen={isOpen}
                size="xs"
                onClose={() => setIsOpen(false)}
                placement="left"
              >
                <DrawerContent>
                  <DrawerHeader className="flex flex-col gap-1">
                    {loaderData.family.name}
                  </DrawerHeader>
                  <DrawerBody>
                    <Listbox
                      variant="faded"
                      items={links}
                      aria-label="Family navigation"
                    >
                      {({ to, label, Icon }) => (
                        <ListboxItem
                          key={to}
                          href={to}
                          className={
                            pathname === to
                              ? "bg-blue-100 dark:bg-blue-900"
                              : undefined
                          }
                          onPress={() => setIsOpen(false)}
                          startContent={<Icon className="size-5" />}
                        >
                          {label}
                        </ListboxItem>
                      )}
                    </Listbox>
                  </DrawerBody>
                </DrawerContent>
              </Drawer>
            </>
          ),
        }}
      />
    </section>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    return (
      <ErrorState
        title="Family not found"
        description="The family you are looking for either does not exist or you do not have permission to view it."
      />
    );
  } else if (error instanceof Error) {
    return (
      <ErrorState
        status="error"
        title="Failed to load family"
        description="We apologize for the inconvenience. Please try again later."
      />
    );
  } else {
    return (
      <ErrorState
        status="error"
        title="Encountered unknown error"
        description="We apologize for the inconvenience. Please try again later."
      />
    );
  }
}
