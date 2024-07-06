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
} from '@nextui-org/react';
import { NavLink, Link as RemixLink, useLocation, useSubmit } from '@remix-run/react';
import { forwardRef } from '@wesp-up/ui';
import React, { type ElementType } from 'react';
import { twMerge } from 'tailwind-merge';

import { useOptionalUser } from '#app/utils';

export function Header() {
    const user = useOptionalUser();
    const submit = useSubmit();
    const location = useLocation();

    return (
        <Navbar isBordered maxWidth="full" classNames={{ wrapper: 'px-2 sm:px-6' }}>
            <NavbarContent>
                <NavbarBrand>
                    <Link as={RemixLink} to={user ? '/home' : '/'} className="p-1 space-x-2">
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
                                    href="/profile"
                                    className={
                                        location.pathname === '/profile'
                                            ? 'bg-blue-100 dark:bg-blue-900'
                                            : undefined
                                    }
                                >
                                    Profile
                                </DropdownItem>
                            </DropdownSection>

                            <DropdownSection showDivider classNames={{ group: 'space-y-1' }}>
                                <DropdownItem
                                    href="/home"
                                    className={
                                        location.pathname === '/home'
                                            ? 'bg-blue-100 dark:bg-blue-900'
                                            : undefined
                                    }
                                >
                                    Home
                                </DropdownItem>
                                <DropdownItem
                                    href="/groups"
                                    className={
                                        location.pathname === '/groups'
                                            ? 'bg-blue-100 dark:bg-blue-900'
                                            : undefined
                                    }
                                >
                                    Groups
                                </DropdownItem>
                            </DropdownSection>

                            <DropdownItem
                                onPress={() =>
                                    submit(null, {
                                        method: 'post',
                                        action: '/logout',
                                        encType: 'text/plain',
                                    })
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
                            <Button color="primary" variant="bordered" as={RemixLink} to="/signup">
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

export const MenuLink = forwardRef<MenuLinkProps, 'a'>(
    ({ label, to, icon: Icon, ...rest }: MenuLinkProps, ref) => {
        return (
            <NavLink
                ref={ref}
                to={to}
                className={({ isActive }) =>
                    twMerge(
                        'flex items-center py-2 px-4 text-gray-600 rounded-lg hover:bg-blue-100 active:bg-blue-200',
                        isActive ? 'bg-slate-200' : '',
                    )
                }
                {...rest}
            >
                <Icon className="w-6 h-6" aria-hidden />
                <span className="ml-3">{label}</span>
            </NavLink>
        );
    },
);
