import {
  ArrowLeftStartOnRectangleIcon,
  Bars3BottomLeftIcon,
  HomeIcon,
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
} from "@heroui/react";
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
      <NavbarBrand className="flex flex-grow-0 items-center justify-center">
        <Link as={RemixLink} to={user ? "/home" : "/"} className="w-8">
          <img src="/assets/logo-icon.svg" alt="Commit" />
        </Link>
      </NavbarBrand>

      <NavbarContent>
        {user && (
          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                aria-label="Navigation"
                color="primary"
                variant="light"
              >
                <Bars3BottomLeftIcon className="text-default-600 w-8" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Menu" variant="faded">
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
                key="families"
                href="/families"
                className={
                  location.pathname === "/families"
                    ? "bg-blue-100 dark:bg-blue-900"
                    : undefined
                }
                startContent={<UserGroupIcon className={iconClasses} />}
              >
                Families
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
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
                size="md"
                color="primary"
                fallback={
                  <span className="text-base">
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                }
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Menu" variant="faded">
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

              <DropdownItem
                key="logout"
                /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
                onPress={() =>
                  submit(null, {
                    method: "post",
                    action: "/api/auth/logout",
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
