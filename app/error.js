"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/shared/states/StateScreen";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
      <ErrorState actionLabel="Try Again" onAction={reset} />
    </div>
  );
}
