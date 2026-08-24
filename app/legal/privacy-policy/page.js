export const metadata = {
  title: "Privacy Policy | Simnani Estate",
  description: "How Simnani Estate collects, uses and protects your data.",
};

const SECTIONS = [
  {
    title: "Information Collection",
    body: "We collect identity data (name, contact details), financial data relevant to transactions, and technical data such as device and usage information when you interact with Simnani Estate.",
  },
  {
    title: "Purpose of Collection",
    body: "Information is collected to curate relevant properties and investment opportunities, facilitate enquiries and site visits, and maintain the security of your account.",
  },
  {
    title: "How We Use Your Data",
    body: "Your data is used for property curation and matching, and to manage transactions between you and our advisory, broker and freelancer network.",
  },
  {
    title: "Your Rights",
    body: "You may request access to, correction of, or deletion of your personal data at any time by contacting our privacy team.",
  },
  {
    title: "Data Deletion",
    body: "You can request permanent deletion of your account and associated data from your Account Settings page.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-cream sm:text-4xl">Privacy Policy</h1>
      <p className="tracked-label mt-3 text-xs text-muted">Last Updated: October 2025</p>

      <div className="mt-10 flex flex-col gap-10">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-xl text-cream">{section.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{section.body}</p>
          </section>
        ))}

        <section className="border-t border-navy-700/60 pt-8">
          <h2 className="font-display text-xl text-cream">Contact</h2>
          <p className="mt-3 text-sm text-muted">
            Questions about this policy can be sent to{" "}
            <a href="mailto:privacy@simnaniestate.com" className="text-gold-400 hover:text-gold-300">
              privacy@simnaniestate.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
