import { Outlet } from "@remix-run/react";
import React from "react";

import { Header } from "#app/lib/ui/header";

export default function Layout() {
  // TODO: Add dark mode theme switching
  return (
    <div className="text-foreground bg-background flex flex-col flex-grow h-full">
      <Header />

      <Outlet />
    </div>
  );
}
