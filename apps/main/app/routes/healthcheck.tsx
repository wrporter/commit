import type { LoaderFunctionArgs } from '@remix-run/node';

import { prisma } from '~/prisma.server';
import { log } from '~/server/logger.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const host = request.headers.get('X-Forwarded-Host') ?? request.headers.get('host');

    try {
        const url = new URL('/', `http://${host}`);
        // if we can connect to the database and make a simple query
        // and make a HEAD request to ourselves, then we're good.
        await Promise.all([
            prisma.user.count(),
            fetch(url.toString(), { method: 'HEAD' }).then((r) => {
                if (!r.ok) return Promise.reject(r);
                return Promise.resolve();
            }),
        ]);
        return new Response('OK');
    } catch (error: unknown) {
        log.error({ message: 'healthcheck ❌', error });
        return new Response(JSON.stringify({ status: 'failed', error }));
    }
};
