import {
  ArrowLeftStartOnRectangleIcon,
  ChartPieIcon,
  CheckCircleIcon,
  ClipboardIcon,
  HomeIcon,
  StarIcon,
  UserCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  forwardRef,
} from "@nextui-org/react";
import React, { type ElementType } from "react";
import {
  NavLink,
  Link as RemixLink,
  useLocation,
  useSubmit,
} from "react-router";
import { twMerge } from "tailwind-merge";

import { useOptionalUser } from "~/utils.js";

const iconClasses = "w-5 h-5 text-slate-600";

export function Header() {
  const user = useOptionalUser();
  const submit = useSubmit();
  const location = useLocation();

  return (
    <Navbar isBordered maxWidth="full" classNames={{ wrapper: "px-2 sm:px-6" }}>
      <NavbarContent>
        <NavbarBrand>
          <Link
            as={RemixLink}
            to={user ? "/home" : "/"}
            className="p-1 space-x-2"
          >
            <img src="/assets/logo-icon.svg" alt="Commit" className="h-8" />
            <p className="font-bold text-foreground hidden sm:flex">Commit</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="end" className="gap-2">
        {user ? (
          <Dropdown>
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                src={user.imageUrl ?? undefined}
                name={user.displayName}
                showFallback
                fallback={
                  <span className="text-base">
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                }
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Menu">
              <DropdownSection showDivider>
                <DropdownItem
                  key="profile"
                  href="/profile"
                  className={
                    location.pathname === "/profile"
                      ? "bg-blue-100 dark:bg-blue-900"
                      : undefined
                  }
                  startContent={<UserCircleIcon className={iconClasses} />}
                >
                  Profile
                </DropdownItem>
              </DropdownSection>

              <DropdownSection showDivider classNames={{ group: "space-y-1" }}>
                <DropdownItem
                  key="home"
                  href="/home"
                  className={
                    location.pathname === "/home"
                      ? "bg-blue-100 dark:bg-blue-900"
                      : undefined
                  }
                  startContent={<HomeIcon className={iconClasses} />}
                >
                  Home
                </DropdownItem>
                <DropdownItem
                  key="people"
                  href="/people"
                  className={
                    location.pathname === "/people"
                      ? "bg-blue-100 dark:bg-blue-900"
                      : undefined
                  }
                  startContent={<UserGroupIcon className={iconClasses} />}
                >
                  People
                </DropdownItem>
                <DropdownItem
                  key="chores"
                  href="/chores"
                  className={
                    location.pathname === "/chores"
                      ? "bg-blue-100 dark:bg-blue-900"
                      : undefined
                  }
                  startContent={<CheckCircleIcon className={iconClasses} />}
                >
                  Chores
                </DropdownItem>
                <DropdownItem
                  key="rewards"
                  href="/rewards"
                  className={
                    location.pathname === "/rewards"
                      ? "bg-blue-100 dark:bg-blue-900"
                      : undefined
                  }
                  startContent={<StarIcon className={iconClasses} />}
                >
                  Rewards
                </DropdownItem>
                <DropdownItem
                  key="assignments"
                  href="/assignments"
                  className={
                    location.pathname === "/assignments"
                      ? "bg-blue-100 dark:bg-blue-900"
                      : undefined
                  }
                  startContent={<ClipboardIcon className={iconClasses} />}
                >
                  Assignments
                </DropdownItem>
                <DropdownItem
                  key="chore-chart"
                  href="/chore-chart"
                  className={
                    location.pathname === "/chore-chart"
                      ? "bg-blue-100 dark:bg-blue-900"
                      : undefined
                  }
                  startContent={<ChartPieIcon className={iconClasses} />}
                >
                  Chore Chart
                </DropdownItem>
              </DropdownSection>

              <DropdownItem
                key="logout"
                /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
                onPress={() =>
                  submit(null, {
                    method: "post",
                    action: "/logout",
                    encType: "text/plain",
                  })
                }
                startContent={
                  <ArrowLeftStartOnRectangleIcon className={iconClasses} />
                }
              >
                Logout
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <>
            <NavbarItem>
              <Button color="primary" as={RemixLink} to="/login">
                Log in
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button
                color="primary"
                variant="bordered"
                as={RemixLink}
                to="/signup"
              >
                Sign up
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>
    </Navbar>
  );
}

export interface MenuLinkProps {
  label: string;
  to: string;
  icon: ElementType;

  [prop: string]: unknown;
}

export const MenuLink = forwardRef<"a", MenuLinkProps>(
  ({ label, to, icon: Icon, ...rest }: MenuLinkProps, ref) => {
    return (
      <NavLink
        ref={ref}
        to={to}
        className={({ isActive }) =>
          twMerge(
            "flex items-center py-2 px-4 text-gray-600 rounded-lg hover:bg-blue-100 active:bg-blue-200",
            isActive ? "bg-slate-200" : ""
          )
        }
        {...rest}
      >
        <Icon className="w-6 h-6" aria-hidden />
        <span className="ml-3">{label}</span>
      </NavLink>
    );
  }
);
