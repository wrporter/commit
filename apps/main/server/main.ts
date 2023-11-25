import 'source-map-support/register';

import { installGlobals } from '@remix-run/node';
import { createRemixServer } from '@wesp-up/express-remix';

installGlobals();

async function main() {
    const server = await createRemixServer();
    server.start(3000);
}

main();
