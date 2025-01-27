import { Button } from "@heroui/react";
import { Link } from "react-router";

import { ErrorState } from "~/lib/ui/error-state.js";

export default function Component() {
  return (
    <ErrorState
      title="Page not found"
      description="The page you are looking for doesn't exist."
    >
      <div className="flex items-center w-full mt-6 gap-x-3 shrink-0 sm:w-auto">
        <Button as={Link} color="primary" variant="ghost" to="/home">
          Take me home
        </Button>
      </div>
    </ErrorState>
  );
}
