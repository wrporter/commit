import { Outlet } from '@remix-run/react';
import React from 'react';

export default function Layout() {
    return (
        <main className="flex h-full flex-col bg-gradient-to-r from-lime-300 to-cyan-400 py-6 sm:py-8 lg:py-10">
            <div className="container">
                <Outlet />
            </div>
        </main>
    );
}
