import BackButton from "@/components/layout/BackButton";

export const metadata = {
  title: "Privacy Policy | Simnani Estate",
  description: "A fully transparent account of what data Simnani Estate collects, why, and how it is stored.",
};

const DATA_FIDUCIARY = {
  legalName: "[LEGAL ENTITY NAME — e.g. Simnani Estate Pvt. Ltd.]",
  registeredOffice: "Office No. 1080, First Floor, Currency Tower, VIP Chowk, Telibandha, Raipur",
  cin: "[CIN]",
  gstin: "[GSTIN]",
};

const GRIEVANCE_OFFICER = {
  name: "[GRIEVANCE OFFICER NAME]",
  designation: "[DESIGNATION]",
  email: "privacy@simnaniestates.com",
  phone: "[GRIEVANCE OFFICER PHONE]",
  responseTime: "[RESPONSE TIMELINE, e.g. within 7 working days]",
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
    items: "Full name, mobile number, email, employee code, designation, and assigned district. Processed on the basis of legitimate use for employment, not consent.",
  },
  {
    title: "Owner / general registration",
    items: "Full name, mobile number, email, and city.",
  },
  {
    title: "Tenant / PG seeker",
    items: "Full name, mobile number, email, city, preferred locality, budget, and move-in timeline submitted when enquiring about a rental or PG listing.",
  },
  {
    title: "Landlord (rental management)",
    items: "Full name, mobile number, email, property address, and tenant verification documents submitted for rental listing or management.",
  },
  {
    title: "Home loan / legal / valuation / NRI service clients",
    items: "Full name, mobile number, email, and the specific details needed for that service (e.g. loan amount sought, property for valuation, legal query) shared with our bank, legal panel, or valuer tie-ups.",
  },
  {
    title: "Helpdesk & callback enquirers",
    items: "Full name, mobile number, and the nature of the query submitted via the helpdesk or 'Request a Callback' forms.",
  },
  {
    title: "Website visitors (no account)",
    items: "Approximate location, device/browser type, and pages visited, collected only via analytics cookies if you consent on the cookie banner.",
  },
];

const RETENTION_TABLE = [
  {
    title: "Enquiries & Leads",
    items: "Retained for 6 months to 1 year, deleted/anonymised sooner once the lead is closed, converted, or withdrawn (DPDP Act, s. 8(7)). If never converted, auto-archived/deleted after 12 months. Never retained beyond 2 years.",
  },
  {
    title: "Buyer / Tenant / Investor Accounts",
    items: "Retained while your account is active. Deleted within 30 days of an account-deletion request. If inactive for 3 years, you will be notified before the account is deleted or anonymised.",
  },
  {
    title: "Broker / Freelancer / Contractor Verification Documents (RERA, PAN, ID proof)",
    items: "Kept securely (encrypted) for the full duration of the active business relationship, then retained for a further 5 years after the relationship ends, as required for identity/KYC records under PMLA and related rules. Records tied to a commission, payout or invoice are retained for 6–8 years under the Income Tax Act and GST Rules.",
  },
  {
    title: "Server & Access Logs",
    items: "Retained for a minimum of 1 year as required under the IT Act, 2000 rules.",
  },
];

const SECTIONS = [
  {
    title: "Who We Are",
    body: `This Privacy Policy is issued by ${DATA_FIDUCIARY.legalName}, having its registered office at ${DATA_FIDUCIARY.registeredOffice} (CIN: ${DATA_FIDUCIARY.cin}, GSTIN: ${DATA_FIDUCIARY.gstin}), operating Simnani Estate ("we", "us", "our"). We are the Data Fiduciary responsible for your personal data under the Digital Personal Data Protection Act, 2023 ("DPDP Act").`,
  },
  {
    title: "Information We Collect",
    body: "We collect what you directly give us during registration, listing a property, enquiring about a rental/PG, submitting an enquiry, scheduling a visit, requesting a callback, raising a helpdesk ticket, or applying for a home loan/legal/valuation/NRI service. The exact fields captured depend on the account type or service — see the full breakdown below. We also collect limited analytics data from website visitors who consent via the cookie banner. We do not collect financial/payment card data, government ID numbers beyond PAN (for brokers, for verification), or biometric data.",
  },
  {
    title: "Exactly What We Store, By Account Type",
    body: null,
  },
  {
    title: "How This Data Is Stored",
    body: "Your personal data is stored on our servers in a secured database, not only in your browser. Browser storage (localStorage) is used only to keep you logged in and remember in-progress form drafts on your own device — the authoritative copy of your data is held by us. Verification documents (RERA certificate, identity proof, business proof, PAN) submitted by brokers and freelancers are stored on our servers and are accessible only to authorised personnel for verification purposes.",
  },
  {
    title: "Purpose of Collection",
    body: "We use the information you provide to: create and manage your account; match you with relevant properties, investment opportunities or leads; enable brokers/freelancers/staff to respond to your enquiries and site-visit requests; verify broker and freelancer credentials (RERA, PAN, identity and business proof); facilitate introductions to our bank, legal panel, valuer and tenant-verification partners where you request those services; and personalise what you see on the platform (such as saved properties and preferred locations).",
  },
  {
    title: "Who We Share Your Data With",
    body: "Depending on the service you use, we share relevant details of your enquiry with: the broker, freelancer/Channel Partner, or property owner handling that listing or lead; our tied-up banks, legal panel, valuers, or tenant-verification partners, where you request a home loan, legal, valuation or tenant-verification service; and service providers who process data on our behalf, including our cloud hosting provider, SMS/OTP gateway, WhatsApp Business API provider, and (with your cookie-banner consent) Google Analytics. These service providers are contractually bound to use your data only to provide their service to us and for no other purpose. We do not sell your personal data to third parties or share it with advertisers for their own use.",
  },
  {
    title: "Data Retention",
    body: null,
  },
  {
    title: "Security Safeguards & Breach Notification",
    body: "We use reasonable technical and organisational measures to protect your data, including encrypted transmission (HTTPS), access controls limiting who within our team can view verification documents, and restricted database access. In the event of a personal data breach, we will notify affected users and the Data Protection Board of India as required under Section 8(6) of the DPDP Act and the DPDP Rules, 2025.",
  },
  {
    title: "Consent",
    body: "Where we rely on consent, we ask for it through a clear affirmative action — a checkbox or button you actively select — separately for each distinct purpose (for example, account registration and being contacted about your enquiry are each consented to separately, and cookie/analytics consent is sought separately via the cookie banner). We do not treat merely using the platform, or submitting one form, as consent to an unrelated purpose. You may withdraw consent at any time by contacting our Grievance Officer (below) or, for analytics cookies, by choosing \"Necessary Only\" on the cookie banner — it is as easy to withdraw consent as it was to give it, and withdrawal does not affect processing already carried out.",
  },
  {
    title: "Cookies & Local Storage",
    body: "Simnani Estate uses browser local storage to keep you logged in, remember in-progress registration form drafts, and remember properties you've saved — this is necessary for the site to work, so it is not something we ask consent for. Separately, with your consent via the cookie banner, we use Google Analytics cookies to understand how visitors use the site (pages viewed, approximate location, device type). You can choose \"Necessary Only\" on the banner to opt out of analytics cookies at any time; clearing your browser storage resets that choice.",
  },
  {
    title: "Cross-Border Data Transfer",
    body: "Google Analytics, which we use for site analytics with your consent, may process data on servers located outside India. We only use analytics providers that meet the transfer conditions permitted under Section 16 of the DPDP Act.",
  },
  {
    title: "Children's Data & Persons with Disability",
    body: "Our platform is intended for users who are at least 18 years old. We do not knowingly collect personal data from children. Where a person with a disability who has a lawful guardian needs to register or transact on the platform, the guardian may act on their behalf and provide verifiable consent as required under Section 9 of the DPDP Act.",
  },
  {
    title: "Legal Basis (DPDP Act, 2023 & IT Act, 2000)",
    body: "Most of our processing is based on your consent, in line with the DPDP Act and DPDP Rules, 2025, and the IT Act, 2000 (Section 43A) read with the Sensitive Personal Data or Information (SPDI) Rules, 2011. Employee data is processed on the basis of legitimate use for the purposes of employment under Section 7(i) of the DPDP Act, not consent.",
  },
  {
    title: "Your Rights",
    body: "You have the right to: access a summary of your personal data and processing activities; request correction, completion, or erasure of your data; nominate another individual to exercise your rights in the event of your death or incapacity; withdraw consent at any time; and file a grievance with our Grievance Officer, and if unresolved, complain to the Data Protection Board of India. To exercise any of these rights, contact our Grievance Officer below.",
  },
  {
    title: "Data Deletion",
    body: "You can request permanent deletion of your account from your Account Settings page at any time. This removes your profile and registration data from our servers and your browser's local storage, and we instruct our service providers to delete or anonymise their copies, subject to any data we are legally required to retain (such as server logs, for the minimum period stated under Data Retention) and any copies remaining temporarily in routine backups until they are next overwritten.",
  },
  {
    title: "Grievance Officer",
    body: `For any questions about this policy, or to exercise your rights, contact our Grievance Officer: ${GRIEVANCE_OFFICER.name}, ${GRIEVANCE_OFFICER.designation}. Email: ${GRIEVANCE_OFFICER.email}. Phone: ${GRIEVANCE_OFFICER.phone}. We aim to resolve grievances ${GRIEVANCE_OFFICER.responseTime}. If you are not satisfied with our resolution, you may approach the Data Protection Board of India.`,
  },
  {
    title: "Changes to This Policy",
    body: "If we make a material change to this policy, we will update the \"Last Updated\" date below and, where the change affects how we use data we already hold about existing users, notify registered users via email or SMS before the change takes effect.",
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

            {section.title === "Data Retention" && (
              <div className="mt-4 flex flex-col gap-4">
                {RETENTION_TABLE.map((row) => (
                  <div
                    key={row.title}
                    className="border border-navy-700/60 bg-navy-900 p-4 sm:p-5"
                  >
                    <p className="tracked-label text-xs text-gold-400">{row.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{row.items}</p>
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
            <a href={`mailto:${GRIEVANCE_OFFICER.email}`} className="text-gold-400 hover:text-gold-300">
              {GRIEVANCE_OFFICER.email}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
