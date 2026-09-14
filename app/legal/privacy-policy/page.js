import BackButton from "@/components/layout/BackButton";

export const metadata = {
  title: "Privacy Policy | Simnani Estate",
  description: "A fully transparent account of what data Simnani Estate collects, why, and how it is stored.",
};

const DATA_BY_ACCOUNT = [
  {
    title: "Buyer",
    items: "Full name, mobile number, email, city, property type(s) of interest, budget range, and preferred location.",
  },
  {
    title: "Investor",
    items: "Full name, mobile number, email, city, property type(s) of interest, budget range, expected profit range, and preferred investment city.",
  },
  {
    title: "Broker",
    items: "Full name, mobile number, email, city, applicant type, agency name, years of experience, office address, operating areas, specialties, RERA registration status and RERA number, PAN number, and uploaded documents (RERA certificate, identity proof, business proof).",
  },
  {
    title: "Freelancer / Channel Partner",
    items: "Full name, mobile number, email, city, current working status, coverage areas, years of experience, and invitation/referral code (if any).",
  },
  {
    title: "Employee",
    items: "Full name, mobile number, email, employee code, designation, and assigned district.",
  },
  {
    title: "Common Person / general registration",
    items: "Full name, mobile number, email, and city.",
  },
];

const SECTIONS = [
  {
    title: "Information We Collect",
    body: "We only collect what you directly give us during registration, listing a property, submitting an enquiry, scheduling a visit, or requesting a callback. The exact fields captured depend on the account type you register as — see the full breakdown below. We do not collect financial/payment card data, government ID numbers beyond PAN (for brokers, for verification), or biometric data.",
  },
  {
    title: "Exactly What We Store, By Account Type",
    body: null,
  },
  {
    title: "How This Data Is Currently Stored",
    body: "In full transparency: Simnani Estate, as currently deployed, stores your registration and account data in your own browser's local storage (localStorage) on your device — it is not transmitted to or held on a remote company server or database at this stage of the platform. This means the data persists only on the device and browser you registered from, and clearing your browser storage will remove it. As the platform moves to a production backend, this section will be updated to describe server-side storage, encryption and retention practices before that change goes live.",
  },
  {
    title: "Purpose of Collection",
    body: "We use the information you provide to: create and manage your account; match you with relevant properties, investment opportunities or leads; enable brokers/freelancers/staff to respond to your enquiries and site-visit requests; verify broker and freelancer credentials (RERA, PAN, identity and business proof); and personalise what you see on the platform (such as saved properties and preferred locations).",
  },
  {
    title: "What We Do Not Do",
    body: "We do not sell your personal data to third parties. We do not share your contact details with advertisers. We do not use your data for purposes beyond those listed above without asking you first.",
  },
  {
    title: "Cookies & Local Storage",
    body: "Simnani Estate uses browser local storage (not third-party tracking cookies) to keep you logged in, remember in-progress registration form drafts, and remember properties you've saved. This data stays on your device.",
  },
  {
    title: "Your Rights",
    body: "You may request access to, correction of, or deletion of your personal data at any time by contacting our privacy team. Because current data lives in your browser's local storage, you can also directly clear it by logging out and clearing your browser storage for this site.",
  },
  {
    title: "Data Deletion",
    body: "You can request permanent deletion of your account and associated data from your Account Settings page at any time — this immediately removes your profile and registration data from local storage.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="font-display text-3xl text-cream sm:text-4xl">Privacy Policy</h1>
      </div>
      <p className="tracked-label mt-3 text-xs text-muted">Last Updated: September 2026</p>
      <p className="mt-6 text-sm leading-relaxed text-muted">
        We want you to know exactly what data we collect and where it goes — no hidden fields, no
        undisclosed sharing. This page is a complete, plain-language account of that.
      </p>

      <div className="mt-10 flex flex-col gap-10">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-xl text-cream">{section.title}</h2>
            {section.body && <p className="mt-3 text-sm leading-relaxed text-muted">{section.body}</p>}

            {section.title === "Exactly What We Store, By Account Type" && (
              <div className="mt-4 flex flex-col gap-4">
                {DATA_BY_ACCOUNT.map((account) => (
                  <div
                    key={account.title}
                    className="border border-navy-700/60 bg-navy-900 p-4 sm:p-5"
                  >
                    <p className="tracked-label text-xs text-gold-400">{account.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{account.items}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        <section className="border-t border-navy-700/60 pt-8">
          <h2 className="font-display text-xl text-cream">Contact</h2>
          <p className="mt-3 text-sm text-muted">
            Questions about this policy, or requests to access/delete your data, can be sent to{" "}
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
