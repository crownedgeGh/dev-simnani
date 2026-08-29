import Accordion from "@/components/portal/Accordion";
import SectionCard from "@/components/portal/SectionCard";
import { FiMapPin, FiMail, FiExternalLink } from "react-icons/fi";
import { FaInstagram } from "react-icons/fa6";

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
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-xl text-cream">Frequently Asked Questions</h2>
          <div className="mt-4">
            <Accordion items={FAQS} />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <SectionCard title="Contact Concierge">
            <div className="flex flex-col gap-5 text-sm">
              <div className="flex gap-3">
                <FiMapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold-400" />
                <p className="text-cream">
                  Shop No 1080, First Floor, Beside House of Sansa, Currency Tower, VIP Road
                  Corner, Raipur, Chhattisgarh, India
                </p>
              </div>

              <a
                href="mailto:simnanigroupsraipur@gmail.com"
                className="flex items-center gap-3 text-cream transition hover:text-gold-400"
              >
                <FiMail className="h-5 w-5 shrink-0 text-gold-400" />
                simnanigroupsraipur@gmail.com
              </a>

              <a
                href="https://www.instagram.com/simnani.groups"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-cream transition hover:text-gold-400"
              >
                <FaInstagram className="h-5 w-5 shrink-0 text-gold-400" />
                @simnani.groups
              </a>

              <a
                href="https://www.google.com/maps?ll=21.2263,81.6749&z=16&t=m&hl=en&gl=IN&mapclient=embed"
                target="_blank"
                rel="noopener noreferrer"
                className="tracked-label flex items-center gap-2 border-t border-navy-700/60 pt-4 text-xs text-gold-400 transition hover:text-gold-300"
              >
                <FiExternalLink className="h-4 w-4" />
                View on Google Maps
              </a>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
