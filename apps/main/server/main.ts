/**
 * Code copied and simplified from https://github.com/epicweb-dev/epic-stack
 */
import 'source-map-support/register.js';
import path from 'node:path';

import { context, propagation } from '@opentelemetry/api';
import { createRequestHandler } from '@react-router/express';
import { RequestLogger, Server, type Options as ServerOptions } from '@wesp-up/express';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import express, {
  type Application,
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from 'express';
import { type ServerBuild } from 'react-router';

import { db } from './db.server.js';
import { env } from './env.server.js';

const { NODE_ENV } = env;

declare module 'react-router' {
  interface AppLoadContext {
    log: RequestLogger;
  }
}

const viteDevServer =
  NODE_ENV === 'development'
    ? // eslint-disable-next-line import-x/no-extraneous-dependencies -- this is only for development
      await import('vite').then((vite) =>
        vite.createServer({
          server: {
            allowedHosts: ['public.ogov.me'],
            middlewareMode: true,
            hmr: {
              port: 24000,
              clientPort: 24001,
            },
          },
        }),
      )
    : undefined;

async function getBuild() {
  try {
    const build = viteDevServer
      ? await viteDevServer.ssrLoadModule('virtual:react-router/server-build')
      : await import('../build/server/index.js');

    return { build: build as unknown as ServerBuild, error: null };
  } catch (error) {
    // Catch error and return null to make express happy and avoid an unrecoverable crash
    console.error('Error creating build:', error);
    return { error: error, build: null as unknown as ServerBuild };
  }
}

/**
 * React Router options.
 */
export interface ReactRouterOptions {
  /**
   * The build path for the backend server.
   * @default `${PWD}/build`
   */
  serverBuildPath: string;
  /**
   * The root folder for public assets.
   * @default `public`
   */
  assetsRoot: string;
  /**
   * The build directory for react-router assets. Should be a child of
   * `assetsRoot`.
   * @default `public/build`
   */
  assetsBuildDirectory: string;
  /**
   * The route path for public assets.
   * @default `/build/`
   */
  publicPath: string;
}

/**
 * Smart defaults for React Router. You normally shouldn't have to change these.
 */
export const defaultReactRouterOptions: ReactRouterOptions = {
  serverBuildPath: path.join(process.cwd(), 'build'),
  assetsBuildDirectory: 'build/client/assets',
  publicPath: '/assets',
  assetsRoot: 'build/client',
};

const assetRegex = /\.(ico|js|css|json|webp)$/;

export const traceResponseHeader: RequestHandler = (_, res, next) => {
  const headers: { traceparent?: string } = {};
  propagation.inject(context.active(), headers);
  if (headers.traceparent) {
    // See spec https://github.com/w3c/trace-context/blob/main/spec/21-http_response_header_format.md
    res.setHeader('traceresponse', headers.traceparent);
  }
  next();
};

export const redirectWithoutTrailingSlash: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.path.endsWith('/') && req.path.length > 1) {
    const query = req.url.slice(req.path.length);
    const safePath = req.path.slice(0, -1).replace(/\/+/g, '/');
    res.redirect(302, safePath + query);
  }
  next();
};

/**
 * An Express server integrated with React Router. Inherits from the server from
 * \@wesp-up/express.
 */
export class ReactRouterServer extends Server {
  private readonly reactRouterOptions: ReactRouterOptions;

  constructor(options?: Partial<ReactRouterOptions & ServerOptions>) {
    super(options as ServerOptions);
    this.reactRouterOptions = {
      ...defaultReactRouterOptions,
      ...options,
    };

    // Filter out static assets from metrics and access logs.
    const skipMetricsAndLogs = (req: Request) => {
      if (assetRegex.test(req.path)) {
        return true;
      }
      if (viteDevServer?.config.base) {
        return req.path.startsWith(viteDevServer.config.base);
      }
      return req.path.startsWith(this.reactRouterOptions.publicPath);
    };

    this.options.accessLogs = {
      skip: this.options.accessLogs?.skip ?? skipMetricsAndLogs,
    };
    this.options.metricsOptions = {
      bypass: this.options.metricsOptions?.bypass ?? skipMetricsAndLogs,
      formatStatusCode: (res) => {
        if (res.statusCode < 300) {
          return '2xx';
        }
        if (res.statusCode < 400) {
          return '3xx';
        }
        return res.statusCode;
      },
    };
  }

  protected preMountApp(app: Application) {
    app.use(traceResponseHeader);
  }

  /**
   * Apply React Router middleware and assets to an Express application. This should be
   * applied towards the end of an application since control will be given to
   * React Router at this point. Any custom Express routes and middleware should be
   * applied previous to using this.
   * @param app - Express app to apply React Router middleware to.
   */
  protected postMountApp(app: Application) {
    const { publicPath, assetsBuildDirectory, assetsRoot } = this.reactRouterOptions;

    // Do not allow trailing slashes in URLs
    app.get(/(.*)/, redirectWithoutTrailingSlash);

    // Static assets
    if (viteDevServer) {
      app.use(viteDevServer.middlewares);
    } else {
      // Vite fingerprints its assets so we can cache forever.
      app.use(publicPath, express.static(assetsBuildDirectory, { immutable: true, maxAge: '1y' }));

      // Everything else (like favicon.ico) is cached for an hour. You may want to be
      // more aggressive with this caching.
      app.use(express.static(assetsRoot, { maxAge: '1h' }));
    }

    // React Router routes
    app.all(
      /(.*)/,
      createRequestHandler({
        getLoadContext: (req: Request) => ({
          serverBuild: getBuild(),
          ...req.context,
        }),
        mode: NODE_ENV,
        build: async () => {
          const { error, build } = await getBuild();
          // Gracefully handle the error
          if (error) {
            throw error;
          }
          return build;
        },
      }),
    );
  }
}

/**
 * Creates an Express server integrated with React Router and ready for production.
 */
export function createReactRouterServer(options: Partial<ReactRouterOptions & ServerOptions> = {}) {
  const server = new ReactRouterServer(options);
  server.init();
  return server;
}

await migrate(db, { migrationsFolder: './migrations' });

const server = createReactRouterServer();
const port = 3000;
server.start(port, 22501);
