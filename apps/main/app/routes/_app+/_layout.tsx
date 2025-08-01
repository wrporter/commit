import React from "react";
import { Outlet } from "react-router";

export default function Component() {
  return (
    <div className="flex flex-col grow h-full">
      <Outlet />
    </div>
  );
}
