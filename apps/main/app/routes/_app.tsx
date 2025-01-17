import React from "react";
import { Outlet } from "react-router";

import { Header } from "~/lib/ui/header.js";

export default function Layout() {
  // TODO: Add dark mode theme switching
  return (
    <div className="text-foreground bg-background flex flex-col flex-grow h-full">
      <Header />

      <Outlet />
    </div>
  );
}
