import BackButton from "@/components/layout/BackButton";
import JsonLd from "@/components/seo/JsonLd";

export const metadata = {
  title: "RERA Flat Buying Checklist | Simnani Estate",
  description:
    "Complete checklist for buying a RERA-approved flat in India: legal documents, hidden costs, loan eligibility & developer red flags.",
};

const LEGAL_DOCS = [
  {
    name: "RERA Registration Certificate",
    why: "Confirms the project is registered with the state's Real Estate Regulatory Authority and legally allowed to sell under-construction units.",
  },
  {
    name: "Title Deed",
    why: "Proves the seller/developer actually owns the land, free of competing claims.",
  },
  {
    name: "Encumbrance Certificate",
    why: "Shows the property is free of unpaid loans, mortgages, or legal disputes over a specified period (typically 13–30 years).",
  },
  {
    name: "Occupancy Certificate (OC)",
    why: "Confirms the building was constructed per the approved plan and is legally fit to be occupied. Never move in without one.",
  },
  {
    name: "Approved Building Plan",
    why: "Verifies the sanctioned layout matches what's actually being built or sold — mismatches are a common red flag.",
  },
  {
    name: "Khata / Mutation Certificate",
    why: "Records the property in municipal records under the current owner's name, required for utility connections and resale.",
  },
];

const HIDDEN_COSTS = [
  { item: "Stamp Duty", range: "3% – 7% of property value", note: "Varies by state; higher for resale in some states." },
  { item: "Registration Fee", range: "1% of property value (typically capped)", note: "Paid at the sub-registrar's office." },
  { item: "GST", range: "1% (affordable) / 5% (other, under-construction)", note: "Not applicable on ready-to-move or resale flats with OC." },
  { item: "Maintenance Deposit", range: "₹20,000 – ₹1,00,000+", note: "One-time advance maintenance corpus, varies by developer." },
  { item: "Parking / Club Membership", range: "₹1 – 5 lakh", note: "Often quoted separately from the base unit price." },
  { item: "Legal & Loan Processing", range: "0.5% – 1% of loan amount", note: "Covers lawyer verification fees and bank processing charges." },
];

const RED_FLAGS = [
  "No RERA registration number displayed in ads, brochures, or the agreement for sale.",
  "Possession date pushed back repeatedly with no penalty clause enforced.",
  "Carpet area, built-up area, and super built-up area not clearly distinguished in the agreement.",
  "Developer asks for payment in cash or to a personal account instead of the project's RERA-registered escrow account.",
  "No occupancy certificate at the time of possession — you're being asked to move in 'provisionally.'",
  "Reluctance to share the approved building plan or past project track record on request.",
];

const FAQ = [
  {
    q: "Is it safe to buy a flat that isn't RERA registered?",
    a: "In most Indian states, any project with 8+ units or built-up area over 500 sq.m. must be RERA registered before it can be advertised or sold. If a developer can't produce a RERA ID, that alone is reason to walk away — you lose RERA's escrow protections, delay penalties, and defect-liability recourse.",
  },
  {
    q: "What is the difference between carpet area and super built-up area?",
    a: "Carpet area is the actual usable floor space inside your walls. Built-up area adds wall thickness and balconies. Super built-up area further adds a share of common areas (lobbies, stairwells). RERA now mandates that developers quote price based on carpet area — always confirm which figure is being used in your agreement.",
  },
  {
    q: "Can I get a home loan before the project has an Occupancy Certificate?",
    a: "Yes, for under-construction projects, banks disburse home loans in stages tied to construction milestones, provided the project itself is RERA-registered and the bank has approved the project. The final disbursement and possession, however, should not happen without the OC.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function ReraBuyerChecklistPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <JsonLd data={faqJsonLd} />

      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="font-display text-3xl text-cream sm:text-4xl">
          Complete Checklist for Buying a RERA-Approved Flat in India
        </h1>
      </div>
      <p className="tracked-label mt-3 text-xs text-muted">Updated Guide</p>

      <p className="mt-6 text-sm leading-relaxed text-muted">
        Buying your first flat is one of the largest financial decisions you&apos;ll make, and in India it
        comes with a paper trail that can feel designed to confuse rather than protect you. RERA (the
        Real Estate Regulation and Development Act) exists specifically to fix that — it forces
        developers to register projects, escrow buyer payments, and commit to disclosed timelines. This
        guide walks through exactly what to verify before you sign anything, so you go in with the same
        information a seasoned buyer would.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-xl text-cream">Why RERA Verification Comes First</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          A valid RERA registration means the project&apos;s land title, approvals, and sanctioned plan have
          already been screened by the state regulator, that at least 70% of buyer payments go into an
          escrow account earmarked for that project&apos;s construction (not the developer&apos;s other projects
          or debts), and that you have a formal forum to file complaints if possession is delayed. Every
          state runs its own RERA portal (e.g. MahaRERA, K-RERA, UP-RERA) — search the project name or
          registration number there before paying anything, and cross-check that the promoter name on
          the certificate matches who you&apos;re actually paying.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl text-cream">Legal Documents to Verify</h2>
        <div className="mt-4 flex flex-col gap-4">
          {LEGAL_DOCS.map((doc) => (
            <div key={doc.name} className="border border-navy-700/60 bg-navy-900 p-4 sm:p-5">
              <p className="tracked-label text-xs text-gold-400">{doc.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{doc.why}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl text-cream">Hidden Costs Beyond the Quoted Price</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The price per sq.ft. quoted by a developer is rarely the full cost of ownership. Budget for
          these on top of the base price:
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border border-navy-700/60 text-left text-sm">
            <thead>
              <tr className="border-b border-navy-700/60 bg-navy-900">
                <th className="p-3 text-xs tracked-label text-gold-400">Cost</th>
                <th className="p-3 text-xs tracked-label text-gold-400">Typical Range</th>
                <th className="p-3 text-xs tracked-label text-gold-400">Note</th>
              </tr>
            </thead>
            <tbody>
              {HIDDEN_COSTS.map((row) => (
                <tr key={row.item} className="border-b border-navy-800">
                  <td className="p-3 text-cream">{row.item}</td>
                  <td className="p-3 text-muted">{row.range}</td>
                  <td className="p-3 text-muted">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl text-cream">Home Loan Eligibility — Quick Action Steps</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
          <li>Check your credit score (CIBIL) before applying — anything below 700 will limit your loan offers.</li>
          <li>Confirm the project is on your lender&apos;s approved-project list; this speeds up disbursement and sometimes gets better rates.</li>
          <li>Keep your EMI-to-income ratio under 40% of take-home pay — most banks cap eligibility around this line.</li>
          <li>Get a sanction letter before you commit to a booking amount, not after.</li>
          <li>For under-construction flats, confirm disbursement is milestone-linked, not a lump sum upfront.</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl text-cream">Common Developer Red Flags</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
          {RED_FLAGS.map((flag) => (
            <li key={flag}>{flag}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10 border-t border-navy-700/60 pt-8">
        <h2 className="font-display text-xl text-cream">Frequently Asked Questions</h2>
        <div className="mt-6 space-y-4">
          {FAQ.map((item) => (
            <div key={item.q} className="border border-navy-700/60 bg-navy-900 p-4 sm:p-5">
              <h3 className="font-display text-base text-cream">{item.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
