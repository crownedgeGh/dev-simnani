import Link from "next/link";
import Accordion from "@/components/portal/Accordion";
import ContactSupportForm from "@/components/portal/ContactSupportForm";
import SectionCard from "@/components/portal/SectionCard";

const TOPICS = [
  { title: "Buying Property", desc: "Search, shortlist and enquire about listings.", href: "/buy" },
  { title: "Investing", desc: "Explore high-yield investment opportunities.", href: "/invest" },
  { title: "Broker Account", desc: "Register as a broker and manage listings.", href: "/auth/register/broker" },
  { title: "Freelancer Account", desc: "Promote projects and earn commission.", href: "/auth/register/freelancer" },
  { title: "Site Visits", desc: "Schedule and track your property visits.", href: "/account/site-visits" },
  { title: "Account & Login", desc: "Manage your profile and sign-in details.", href: "/account" },
];

const FAQS = [
  {
    question: "How do I search for a property?",
    answer:
      "Use the search bar on the Buy, Rent or Sell pages, or browse Featured Developments under Projects to explore curated listings by location, type and budget.",
  },
  {
    question: "How do I submit an enquiry?",
    answer:
      "Open any property or project and select \"Send Enquiry\" or \"Enquire Now\". Our advisory team responds to every enquiry within 24 hours.",
  },
  {
    question: "How do I schedule a site visit?",
    answer:
      "From a property or project page, select \"Schedule Site Visit\", choose a date and time, and we'll confirm your appointment.",
  },
  {
    question: "How does freelancer lead submission work?",
    answer:
      "Once registered as a freelancer, you can submit client leads against approved projects from your portal and track commission eligibility.",
  },
  {
    question: "When is commission approved?",
    answer:
      "Commission becomes eligible for approval once the associated deal is verified as successfully closed by our team.",
  },
  {
    question: "How can I update my profile?",
    answer: "Visit your Account page and select \"Edit Profile\" to update your details.",
  },
];

export const metadata = {
  title: "Help & Support | Simnani Estate",
  description: "Find answers to common questions or reach our concierge team.",
};

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl text-cream sm:text-4xl">Help & Support</h1>
        <p className="mt-3 text-sm text-muted sm:text-base">
          Find answers to common questions or reach out to our dedicated concierge team for
          personalized assistance.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOPICS.map((topic) => (
          <Link
            key={topic.title}
            href={topic.href}
            className="border border-navy-700/60 bg-navy-900 p-5 transition hover:border-gold-400"
          >
            <h3 className="font-display text-base text-cream">{topic.title}</h3>
            <p className="mt-1 text-xs text-muted">{topic.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-xl text-cream">Frequently Asked Questions</h2>
          <div className="mt-4">
            <Accordion items={FAQS} />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <SectionCard title="Contact Concierge">
            <div className="flex flex-col gap-2 text-sm">
              <p className="text-cream">+1 (800) 555-0199</p>
              <p className="text-cream">concierge@simnaniestate.com</p>
              <p className="text-muted">Available 24/7 for premier clients.</p>
            </div>
          </SectionCard>

          <SectionCard title="Report an Issue">
            <ContactSupportForm />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
