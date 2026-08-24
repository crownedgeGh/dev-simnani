export const metadata = {
  title: "Terms & Conditions | Simnani Estate",
  description: "The rules that govern use of Simnani Estate.",
};

const SECTIONS = [
  {
    title: "01. Introduction",
    body: "These Terms & Conditions govern your access to and use of Simnani Estate. By using our platform you agree to be bound by these terms.",
  },
  {
    title: "02. User Accounts",
    body: "Buyer, investor, broker and freelancer accounts each carry distinct responsibilities. You are responsible for maintaining the confidentiality of your account credentials.",
  },
  {
    title: "03. Platform Usage",
    body: "You agree not to misuse the platform, including submitting fraudulent leads, misrepresenting property details, or attempting to circumvent our verification processes.",
  },
  {
    title: "04. Property Listings",
    body: "All listings are subject to review before publication. Simnani Estate reserves the right to remove listings that do not meet our quality and accuracy standards.",
  },
];

export default function TermsConditionsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-cream sm:text-4xl">Terms & Conditions</h1>
      <p className="tracked-label mt-3 text-xs text-muted">Last Updated: October 2025</p>

      <div className="mt-10 flex flex-col gap-10">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-xl text-cream">{section.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
