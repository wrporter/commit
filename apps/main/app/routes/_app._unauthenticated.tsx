import { Outlet } from '@remix-run/react';
import React from 'react';

export default function Layout() {
    return (
        <main className="flex h-full flex-col bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 py-6 sm:py-8 lg:py-10">
            <div className="px-4">
                <Outlet />
            </div>
        </main>
    );
}
