"use client";

import ContactForm from "@/components/property/ContactForm";

/**
 * ContactFormSection
 * ------------------
 * A centered, standalone form card — no left panel, no trust points.
 * Just the "Send Us an Enquiry" card, full-width within its container.
 *
 * Props:
 *  @param {string}  source          — Tracks which page/property
 *  @param {string}  propertyTitle   — Pre-fills the message field
 */
export default function ContactFormSection({
  source = "Website",
  propertyTitle = "",
}) {
  return (
    <section className="border-t border-navy-800 bg-navy-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Card */}
        <div className="mx-auto max-w-2xl rounded-2xl border border-navy-700/60 bg-navy-950 p-6 sm:p-8">
          <p className="font-display text-xl text-cream">Send Us an Enquiry</p>
          <p className="mt-1 text-sm text-muted">
            Our team will call you back shortly after receiving your details.
          </p>
          <div className="mt-6">
            <ContactForm source={source} propertyTitle={propertyTitle} />
          </div>
        </div>
      </div>
    </section>
  );
}
