import { NotFoundState } from "@/components/shared/states/StateScreen";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
      <NotFoundState actionLabel="Back to Home" actionHref="/" />
    </div>
  );
}
