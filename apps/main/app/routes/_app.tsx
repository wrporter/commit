import { Outlet } from '@remix-run/react';
import React from 'react';

import { Header } from '~/lib/ui/header';

export default function Layout() {
    return (
        <div className="flex flex-col flex-grow h-full">
            <Header />

            <Outlet />
        </div>
    );
}
