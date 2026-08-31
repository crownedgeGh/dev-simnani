import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaXTwitter, FaLinkedinIn } from "react-icons/fa6";

const COLUMNS = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Partner With Us", href: "#" },
    ],
  },
  {
    title: "Properties",
    links: [
      { label: "Buy", href: "/buy" },
      { label: "Rent", href: "/rent" },
      { label: "Sell", href: "/sell" },
      { label: "Invest", href: "/invest" },
      { label: "Project Management", href: "/" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Property Guides", href: "#" },
      { label: "Market Trends", href: "#" },
      { label: "Real Estate News", href: "#" },
      { label: "Investment Insights", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Privacy Policy", href: "/legal/privacy-policy" },
      { label: "Terms & Conditions", href: "/legal/terms-conditions" },
      { label: "Contact Support", href: "/help" },
    ],
  },
];

const SOCIALS = [
  { label: "Facebook", Icon: FaFacebookF },
  { label: "Instagram", Icon: FaInstagram },
  { label: "X", Icon: FaXTwitter },
  { label: "LinkedIn", Icon: FaLinkedinIn },
];

export default function Footer() {
  return (
    <footer className="border-t border-navy-700/60 bg-navy-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <span className="relative block h-12 w-[206px]">
              <Image src="/logo-se.png" alt="Simnani Estates" fill className="object-contain object-left" />
            </span>
            <p className="mt-4 text-sm text-muted">
              Elevating real estate excellence across India&apos;s most
              sought-after cities.
            </p>
            <div className="mt-6 flex items-center gap-4">
              {SOCIALS.map(({ label, Icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-navy-600 text-muted transition hover:border-gold-500 hover:text-gold-400"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="tracked-label text-xs text-cream">
                {column.title}
              </p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition hover:text-gold-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-navy-700/60 pt-6 text-xs text-muted">
          © {new Date().getFullYear()} Simnani Estate. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
