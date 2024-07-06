import path from 'node:path'

import { createRequestHandler } from '@remix-run/express'
import { type ServerBuild, installGlobals } from '@remix-run/node'
import { Server, type Options as ServerOptions } from '@wesp-up/express'
import express, { type Application, type Request, type Response } from 'express'

/**
 * Remix options.
 */
export interface RemixOptions {
    /**
     * The build path for the backend server.
     * @default `${PWD}/build`
     */
    serverBuildPath: string
    /**
     * The root folder for public assets.
     * @default `public`
     */
    assetsRoot: string
    /**
     * The build directory for remix assets, should be a child of
     * {@link assetsRoot}.
     * @default `public/build`
     */
    assetsBuildDirectory: string
    /**
     * The route path for public assets.
     * @default `/build/`
     */
    publicPath: string
}

/**
 * Smart defaults for Remix. You normally shouldn't have to change these.
 */
export const defaultRemixOptions: RemixOptions = {
    serverBuildPath: path.join(process.cwd(), 'build'),
    assetsBuildDirectory: 'build/client/assets',
    publicPath: '/assets',
    assetsRoot: 'build/client',
}

/**
 * Apply Remix middleware and assets to an Express application. This should be
 * applied towards the end of an application since control will be given to
 * Remix at this point. Any custom Express routes and middleware should be
 * applied previous to using this.
 * @param app - Express app to apply Remix middleware to.
 * @param options - Options for configuring Remix assets and middleware.
 */
export async function useRemix(
    app: Application,
    options?: Partial<RemixOptions>,
) {
    installGlobals()

    const opts = {
        ...defaultRemixOptions,
        ...options,
    }
    const { publicPath, assetsBuildDirectory, assetsRoot } = opts

    /* -------------------------- Middleware ---------------------------- */
    // Do not allow trailing slashes in URLs
    app.use((req, res, next) => {
        if (req.path.endsWith('/') && req.path.length > 1) {
            const query = req.url.slice(req.path.length)
            const safePath = req.path.slice(0, -1).replace(/\/+/g, '/')
            res.redirect(301, safePath + query)
            return
        }
        next()
    })

    /* -------------------------- Static Assets ---------------------------- */
    const viteDevServer =
        process.env.NODE_ENV === 'production'
            ? undefined
            : // eslint-disable-next-line import/no-extraneous-dependencies
            await import('vite').then(vite =>
                vite.createServer({
                    server: { middlewareMode: true },
                }),
            )

    async function getBuild() {
        const build = viteDevServer
            ? viteDevServer.ssrLoadModule('virtual:remix/server-build')
            : // @ts-ignore this should exist before running the server
            // but it may not exist just yet.
            await import('../build/server/index.js')
        // not sure how to make this happy 🤷‍♂️
        return build as unknown as ServerBuild
    }

    /* -------------------------- Remix Routes -------------------------- */
    if (viteDevServer) {
        app.use(viteDevServer.middlewares)
    } else {
        // Vite fingerprints its assets so we can cache forever.
        app.use(
            publicPath,
            express.static(assetsBuildDirectory, { immutable: true, maxAge: '1y' }),
        )

        // Everything else (like favicon.ico) is cached for an hour. You may want to be
        // more aggressive with this caching.
        app.use(express.static(assetsRoot, { maxAge: '1h' }))
    }

    // handle SSR requests
    app.all(
        '*',
        createRequestHandler({
            getLoadContext: (req: Request, res: Response) => ({
                serverBuild: getBuild(),
                ...res.locals.requestContext,
            }),
            mode: process.env.NODE_ENV,
            build: getBuild,
        }),
    )

    return app
}

/**
 * Creates an Express server integrated with Remix and ready for production.
 */
export async function createRemixServer(
    options: Partial<RemixOptions & ServerOptions> = {},
) {
    const server = new RemixServer(options)
    await server.init()
    return server
}

/**
 * An Express server integrated with Remix. Inherits from the server from
 * \@wesp-up/express.
 */
export class RemixServer extends Server {
    private readonly remixOptions?: Partial<RemixOptions>

    constructor(options?: Partial<RemixOptions & ServerOptions>) {
        super(options as ServerOptions)
        this.remixOptions = options
    }

    protected async postMountApp(app: Application) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await useRemix(app, this.remixOptions)
    }
}

async function main() {
    const server = await createRemixServer()
    server.start(3000)
}

main()
