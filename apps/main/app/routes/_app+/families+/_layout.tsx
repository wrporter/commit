import {
  BriefcaseIcon,
  ChevronDownIcon,
  ClipboardDocumentCheckIcon,
  CursorArrowRaysIcon,
  HomeIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  NavbarContent,
} from "@heroui/react";
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
import {
  Header,
  headerMenuItemIconClasses,
  headerMenuItemVariants,
} from "~/lib/ui/header.js";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  const family = await requireFamilyAccess(user, params.familyId);
  return { family };
};
export default function Component({ loaderData }: Route.ComponentProps) {
  const location = useLocation();
  const params = useParams();
  const base = `/families/${params.familyId}`;

  const menuItems = [
    {
      href: `${base}/people`,
      label: "People",
      Icon: UserGroupIcon,
    },
    {
      href: `${base}/chores`,
      label: "Chores",
      Icon: BriefcaseIcon,
    },
    {
      href: `${base}/assignments`,
      label: "Assignments",
      Icon: CursorArrowRaysIcon,
    },
    {
      href: `${base}/chore-chart`,
      label: "Chore Chart",
      Icon: ClipboardDocumentCheckIcon,
    },
  ];

  return (
    <>
      <Header>
        <NavbarContent>
          <Dropdown>
            <DropdownTrigger>
              <Button
                aria-label="Navigation"
                color="primary"
                variant="light"
                size="sm"
                disableRipple
                endContent={<ChevronDownIcon className="size-4" />}
              >
                {loaderData.family.name}
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Menu" variant="faded">
              <DropdownSection showDivider>
                <DropdownItem
                  key="/home"
                  href="/home"
                  className={headerMenuItemVariants({
                    isSelected: location.pathname === "/home",
                  })}
                  startContent={
                    <HomeIcon className={headerMenuItemIconClasses} />
                  }
                >
                  Home
                </DropdownItem>
              </DropdownSection>
              <DropdownSection title="Family">
                {menuItems.map(({ label, href, Icon }) => (
                  <DropdownItem
                    key={href}
                    href={href}
                    className={headerMenuItemVariants({
                      isSelected: location.pathname === href,
                    })}
                    startContent={
                      <Icon className={headerMenuItemIconClasses} />
                    }
                  >
                    {label}
                  </DropdownItem>
                ))}
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Header>

      <section className="p-4">
        <Outlet />
      </section>
    </>
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
