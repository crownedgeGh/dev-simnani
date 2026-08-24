import CallbackForm from "@/components/property/CallbackForm";

export const metadata = {
  title: "Request Callback | Simnani Estate",
  description: "Request a callback from a Simnani Estate advisor.",
};

export default function RequestCallbackPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
      <CallbackForm />
    </div>
  );
}
