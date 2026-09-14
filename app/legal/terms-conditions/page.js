import BackButton from "@/components/layout/BackButton";

export const metadata = {
  title: "Terms & Conditions | Simnani Estate",
  description: "The rules, regulations and obligations that govern use of Simnani Estate.",
};

const SECTIONS = [
  {
    title: "01. Introduction & Acceptance",
    body: "These Terms & Conditions ('Terms') govern your access to and use of Simnani Estate, including browsing listings, registering an account, posting properties, and engaging with brokers, freelancers or Simnani Estate staff. By creating an account or using any part of the platform, you agree to be legally bound by these Terms and our Privacy Policy. If you do not agree, please discontinue use of the platform.",
  },
  {
    title: "02. Eligibility & Account Types",
    body: "You must be at least 18 years old and legally capable of entering into a binding contract to register. Simnani Estate offers distinct account types — Buyer, Investor, Broker, Freelancer/Channel Partner, and Employee — each carrying different responsibilities, verification requirements and platform privileges. Registering under an incorrect account type to gain access you are not entitled to is a violation of these Terms.",
  },
  {
    title: "03. RERA Compliance & Regulatory Disclosure",
    body: "Where applicable under the Real Estate (Regulation and Development) Act, 2016 ('RERA') and corresponding state rules, brokers and agents transacting on Simnani Estate must hold a valid RERA registration and disclose their RERA number where required. Simnani Estate does not verify the RERA or legal compliance of every third-party listing or every transaction, and users are strongly advised to independently verify RERA registration, land title, encumbrance status, and approvals (such as sanctioned building plans, occupancy/completion certificates) before making any payment or entering into an agreement.",
  },
  {
    title: "04. Accuracy of Listings & User-Submitted Content",
    body: "Property listings, prices, area, amenities and images may be submitted by individual sellers, brokers, freelancers or Simnani Estate staff. While all listings are subject to review before publication, Simnani Estate does not independently inspect, survey or guarantee the accuracy, legality, title, or availability of any listed property. You agree to independently verify all material details — including ownership, encumbrances, carpet/built-up area, approvals and pricing — before relying on any listing or making a payment.",
  },
  {
    title: "05. Brokerage, Commission & Fees",
    body: "Where a broker or freelancer (Channel Partner) facilitates a transaction, brokerage or commission terms are agreed directly between the parties involved (buyer, seller, broker/freelancer) unless otherwise stated in writing by Simnani Estate. Simnani Estate does not set, collect, or guarantee brokerage amounts on user-to-user transactions unless explicitly stated as a platform fee. Any 'Post Property' listing fee, subscription, or service charge levied directly by Simnani Estate will be clearly disclosed before payment is collected.",
  },
  {
    title: "06. Site Visits, Enquiries & Callback Requests",
    body: "By submitting an enquiry, scheduling a site visit, or requesting a callback, you consent to being contacted by Simnani Estate, the concerned broker/freelancer, or the property owner via phone call, SMS, WhatsApp or email regarding that request. Users conducting or hosting site visits are responsible for their own safety and are advised to visit properties during daylight hours and, where possible, accompanied by another person.",
  },
  {
    title: "07. Booking Amounts, Payments & Refunds",
    body: "Simnani Estate is a discovery and lead-facilitation platform. Any token/booking amount, advance, or full consideration for a property is paid directly between the buyer and the seller/developer/broker, outside the Simnani Estate platform, unless a specific in-platform payment flow explicitly states otherwise. Simnani Estate is not a party to, and bears no liability for, any payment, refund, or cancellation dispute arising from such direct transactions. Always obtain a signed receipt or agreement for any amount paid.",
  },
  {
    title: "08. Verification of Brokers & Freelancers",
    body: "Brokers and Freelancers may be required to submit identity proof, business proof, PAN details and, where applicable, RERA certification during registration for internal verification purposes. Submission of documents does not itself constitute a guarantee of authenticity by Simnani Estate; users transacting with a verified broker/freelancer should still exercise independent diligence.",
  },
  {
    title: "09. Prohibited Conduct",
    body: "You agree not to: submit fraudulent, duplicate, or misleading listings or leads; misrepresent property ownership, price, or approval status; impersonate another person or entity; scrape, copy or resell platform data; attempt to bypass verification, security or access-control mechanisms; or use the platform for any unlawful purpose, including money laundering or benami transactions.",
  },
  {
    title: "10. Account Suspension & Termination",
    body: "Simnani Estate reserves the right to suspend, restrict or terminate any account — with or without notice — that violates these Terms, submits fraudulent listings/documents, receives repeated user complaints, or engages in conduct harmful to other users or the platform. You may request deletion of your own account and associated data at any time via Account Settings.",
  },
  {
    title: "11. Intellectual Property",
    body: "The Simnani Estate name, logo, design, and platform content (excluding user-submitted listing content) are the property of Simnani Estate and may not be copied, reproduced or used without prior written permission. Users retain ownership of images and descriptions they upload, but grant Simnani Estate a non-exclusive licence to display that content on the platform for the purpose of the listing.",
  },
  {
    title: "12. Limitation of Liability",
    body: "Simnani Estate acts as an intermediary connecting buyers, sellers, investors, brokers and freelancers, and does not itself own, sell, lease, value, or guarantee any property listed on the platform. To the maximum extent permitted by law, Simnani Estate is not liable for any loss, damage, financial dispute, misrepresentation, or dispute in title arising from a transaction conducted between users, whether or not facilitated through the platform.",
  },
  {
    title: "13. Dispute Resolution & Governing Law",
    body: "These Terms are governed by the laws of India. Any dispute arising out of or relating to your use of Simnani Estate shall first be attempted to be resolved amicably, failing which it shall be subject to the exclusive jurisdiction of the courts at the location of Simnani Estate's registered office.",
  },
  {
    title: "14. Changes to These Terms",
    body: "Simnani Estate may update these Terms from time to time to reflect changes in law, regulation, or platform functionality. Material changes will be reflected by updating the 'Last Updated' date below. Continued use of the platform after changes are posted constitutes acceptance of the revised Terms.",
  },
];

export default function TermsConditionsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="font-display text-3xl text-cream sm:text-4xl">Terms & Conditions</h1>
      </div>
      <p className="tracked-label mt-3 text-xs text-muted">Last Updated: September 2026</p>
      <p className="mt-6 text-sm leading-relaxed text-muted">
        These Terms set out the major rules and regulations that apply to buyers, sellers, investors,
        brokers, freelancers and staff using Simnani Estate. Please read them carefully before
        registering an account or transacting through the platform.
      </p>

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
