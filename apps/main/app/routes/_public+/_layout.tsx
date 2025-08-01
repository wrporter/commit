import { Outlet } from "react-router";

import { Header } from "~/lib/ui/header";

export default function Layout() {
  return (
    <div className="h-full">
      <Header />
      <main className="flex h-full flex-col bg-linear-to-r from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 py-6 sm:py-8 lg:py-10">
        <div className="px-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
