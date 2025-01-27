import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { tv } from "@heroui/react";
import type { ReactNode } from "react";

const iconVariants = tv({
  base: "size-10 rounded-full p-5 box-content",
  variants: {
    status: {
      empty: ["bg-blue-50 text-blue-500", "dark:bg-blue-800"],
      error: ["bg-red-50 text-red-500", "dark:bg-red-800"],
    },
  },
});

interface ErrorStateProps {
  title: string;
  description: string;
  status?: "error" | "empty";
  children?: ReactNode;
}

export function ErrorState({
  title,
  description,
  status = "empty",
  children,
}: ErrorStateProps) {
  return (
    <section className="bg-white dark:bg-gray-900 ">
      <div className="container flex items-center min-h-screen px-6 py-12 mx-auto">
        <div className="flex flex-col items-center max-w-sm mx-auto text-center">
          <ExclamationCircleIcon className={iconVariants({ status })} />

          <h1 className="mt-3 text-2xl font-semibold text-gray-800 dark:text-white md:text-3xl">
            {title}
          </h1>

          <p className="mt-4 text-gray-500 dark:text-gray-400">{description}</p>

          {children}
        </div>
      </div>
    </section>
  );
}
