import Link from "next/link";

const DOCUMENTS = [
  {
    title: "Privacy Policy",
    desc: "How we collect, use and protect your data.",
    href: "/legal/privacy-policy",
  },
  {
    title: "Terms & Conditions",
    desc: "The rules that govern use of Simnani Estate.",
    href: "/legal/terms-conditions",
  },
];

export const metadata = {
  title: "Legal & Policies | Simnani Estate",
  description: "Our commitment to transparency, security and professional excellence.",
};

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-cream sm:text-4xl">Legal & Policies</h1>
      <p className="mt-3 text-sm text-muted sm:text-base">
        Our commitment to transparency, security, and professional excellence.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {DOCUMENTS.map((doc) => (
          <Link
            key={doc.title}
            href={doc.href}
            className="border border-navy-700/60 bg-navy-900 p-6 transition hover:border-gold-400"
          >
            <h3 className="font-display text-lg text-cream">{doc.title}</h3>
            <p className="mt-2 text-sm text-muted">{doc.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
