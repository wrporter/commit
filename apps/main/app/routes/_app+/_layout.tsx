import React from "react";
import { Outlet } from "react-router";

export default function Component() {
  // TODO: Add dark mode theme switching
  return (
    <div className="text-foreground bg-background flex flex-col flex-grow h-full">
      <Outlet />
    </div>
  );
}
