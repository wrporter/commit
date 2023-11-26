import { cssBundleHref } from '@remix-run/css-bundle';
import type { LinksFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';

import { getUser } from '~/auth.server';
import stylesheet from '~/tailwind.css';

export const links: LinksFunction = () => [
    { rel: 'stylesheet', href: stylesheet },
    ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
];

export const meta: MetaFunction = () => [
    { charset: 'utf-8' },
    { title: 'Commit' },
    { viewport: 'width=device-width,initial-scale=1' },
];

export const loader: LoaderFunction = async ({ request }) => {
    return json({
        user: await getUser(request),
    });
};

export default function App() {
    return (
        <html lang="en" className="h-full">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width,initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body className="h-full">
                <Outlet />
                <ScrollRestoration />
                <Scripts />
                <LiveReload />
            </body>
        </html>
    );
}