import { Bars3Icon, HomeIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import * as Avatar from '@radix-ui/react-avatar';
import { Link, NavLink, useSubmit } from '@remix-run/react';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    focusKeyboardRing,
    forwardRef,
} from '@wesp-up/ui';
import type { ElementType } from 'react';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import { useOptionalUser } from '~/utils';

export function Header() {
    const user = useOptionalUser();
    const submit = useSubmit();

    return (
        <nav className="w-full flex items-center justify-between border-b border-b-gray-200 bg-white px-3 py-1">
            <div className="flex gap-4">
                <Link
                    to={user ? '/home' : '/'}
                    className={twMerge(
                        'flex items-center justify-start',
                        'p-1',
                        'rounded',
                        focusKeyboardRing,
                    )}
                >
                    {user ? (
                        <img src="/assets/logo-icon.svg" alt="Commit" className="h-8" />
                    ) : (
                        <img src="/assets/logo-full.webp" alt="Commit" className="h-8" />
                    )}
                </Link>
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button kind="tertiary" className="p-1 h-10 w-10 text-gray-600">
                                <Bars3Icon />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem asChild>
                                <MenuLink to="/home" icon={HomeIcon} label="Home" />
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <MenuLink to="/groups" icon={UserGroupIcon} label="Groups" />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : undefined}
            </div>

            {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button kind="tertiary" className="p-1 h-10 w-10 ">
                            <UserAvatar
                                imageUrl={user.imageUrl ?? undefined}
                                displayName={user.displayName}
                            />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                            <Link to="/profile">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onSelect={() =>
                                submit(null, {
                                    method: 'post',
                                    action: '/logout',
                                    encType: 'text/plain',
                                })
                            }
                        >
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <div className="flex gap-2">
                    <Button as={Link} to="/login">
                        Log in
                    </Button>
                    <Button kind="secondary" as={Link} to="/signup">
                        Sign up
                    </Button>
                </div>
            )}
        </nav>
    );
}

export function UserAvatar({
    imageUrl,
    displayName,
    className,
}: {
    imageUrl?: string;
    displayName: string;
    className?: string;
}) {
    return (
        <Avatar.Root
            className={twMerge(
                'flex select-none w-full h-full items-center justify-center overflow-hidden rounded-full align-middle',
                className,
            )}
        >
            <Avatar.Image
                className="h-full w-full object-cover"
                src={imageUrl ?? ''}
                alt={displayName}
            />
            <Avatar.Fallback
                className="flex h-full w-full items-center justify-center text-sm font-medium text-white bg-blue-600 rounded-full "
                delayMs={600}
            >
                {displayName.charAt(0).toUpperCase()}
            </Avatar.Fallback>
        </Avatar.Root>
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
