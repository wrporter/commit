import { Button } from "@heroui/react";
import { Link, useLocation } from "react-router";

export default function Component() {
  const location = useLocation();

  return (
    <div className="flex flex-col justify-center space-y-4 p-8">
      <p className="text-center text-4xl">
        Oh, snap! This page does not exist!
      </p>
      <p className="text-center text-gray-400">
        You visited {location.pathname}
      </p>

      <div className="flex justify-center">
        <Button as={Link} to="/home">
          Take me home!
        </Button>
      </div>
    </div>
  );
}
