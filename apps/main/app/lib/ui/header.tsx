import {
  ArrowLeftStartOnRectangleIcon,
  UserCircleIcon,
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
} from "@heroui/react";
import React, { type PropsWithChildren } from "react";
import { Link as RemixLink, useLocation, useSubmit } from "react-router";
import { tv } from "tailwind-variants";

import { ThemeSwitch } from "~/lib/theme/theme.js";
import { useOptionalUser } from "~/utils.js";

export const headerMenuItemIconClasses = "w-5 h-5 text-slate-600";

export const headerMenuItemVariants = tv({
  variants: {
    isSelected: {
      true: "bg-blue-100 dark:bg-blue-900",
    },
  },
});

export function Header({ children }: PropsWithChildren) {
  const user = useOptionalUser();
  const submit = useSubmit();
  const location = useLocation();

  return (
    <Navbar
      isBordered
      maxWidth="full"
      classNames={{ wrapper: "px-2 sm:px-6" }}
      position="static"
    >
      <NavbarBrand className="flex grow-0 items-center justify-center">
        <Link as={RemixLink} to={user ? "/home" : "/"} className="w-8">
          <img src="/assets/logo-icon.svg" alt="Commit" />
        </Link>
      </NavbarBrand>

      {children}

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
                  className={headerMenuItemVariants({
                    isSelected: location.pathname === "/profile",
                  })}
                  startContent={
                    <UserCircleIcon className={headerMenuItemIconClasses} />
                  }
                >
                  Profile
                </DropdownItem>

                <DropdownItem
                  key="theme"
                  isReadOnly
                  aria-label="Theme"
                  className="p-0"
                >
                  <ThemeSwitch />
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
                  <ArrowLeftStartOnRectangleIcon
                    className={headerMenuItemIconClasses}
                  />
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
