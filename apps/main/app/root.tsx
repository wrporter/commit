import { HeroUIProvider } from "@heroui/react";
import type { PropsWithChildren } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useNavigate,
} from "react-router";

import type { Route } from "./+types/root.js";
import stylesheet from "./tailwind.css?url";

import { getUser } from "~/lib/authentication/authentication.server.js";
import { ClientHintCheck, getHints } from "~/lib/client-hints/client-hints.js";
import { ErrorState } from "~/lib/ui/error-state.js";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: stylesheet },
];

export const meta: Route.MetaFunction = () => [
  { charset: "utf-8" },
  { title: "Commit" },
  { viewport: "width=device-width,initial-scale=1" },
];

export const loader = async ({ request }: Route.LoaderArgs) => {
  return {
    user: await getUser(request),
    hints: getHints(request),
  };
};

export function Layout({ children }: PropsWithChildren) {
  const navigate = useNavigate();

  return (
    <html lang="en" className="h-full">
      <head>
        <ClientHintCheck />
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi"
        />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <HeroUIProvider className="h-full" navigate={navigate}>
          {children}
          <ScrollRestoration />
          <Scripts />
        </HeroUIProvider>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;
  let status: "empty" | "error" = "error";

  if (isRouteErrorResponse(error)) {
    status = error.status === 404 ? "empty" : "error";
    message = status === "empty" ? "404" : "Error";
    details =
      status === "empty"
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main>
      <ErrorState status={status} title={message} description={details}>
        {stack && (
          <pre className="w-full p-4 overflow-x-auto">
            <code>{stack}</code>
          </pre>
        )}
      </ErrorState>
    </main>
  );
}
