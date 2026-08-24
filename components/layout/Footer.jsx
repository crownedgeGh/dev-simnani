import Link from "next/link";

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
      { label: "Help Center", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms & Conditions", href: "#" },
      { label: "Contact Support", href: "#" },
    ],
  },
];

const SOCIALS = [
  {
    label: "Facebook",
    path: "M13.5 21v-7.5h2.5l.5-3H13.5V8.25c0-.87.24-1.46 1.49-1.46H16.6V4.14C16.34 4.1 15.46 4 14.44 4c-2.13 0-3.59 1.3-3.59 3.69V10.5H8.5v3H10.85V21h2.65Z",
  },
  {
    label: "Instagram",
    path: "M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Zm0 1.5a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5ZM16.5 4.5h-9A3 3 0 0 0 4.5 7.5v9a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3Zm1.5 12a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 16.5v-9A1.5 1.5 0 0 1 7.5 6h9A1.5 1.5 0 0 1 18 7.5v9ZM16.88 7.13a.94.94 0 1 1-1.88 0 .94.94 0 0 1 1.88 0Z",
  },
  {
    label: "X",
    path: "M4 4l7.2 9.6L4.4 20H6.6l6-6.4 4.6 6.4H20l-7.6-10 6.4-7.2h-2.2l-5.4 6-4.4-6H4Z",
  },
  {
    label: "LinkedIn",
    path: "M6.94 8.5H4.56V19.5h2.38V8.5Zm-1.19-3.8a1.38 1.38 0 1 0 0 2.75 1.38 1.38 0 0 0 0-2.75ZM19.5 19.5h-2.38v-5.7c0-1.36-.02-3.1-1.89-3.1-1.9 0-2.19 1.48-2.19 3v5.8H10.66V8.5h2.28v1.5h.03c.32-.6 1.1-1.24 2.26-1.24 2.42 0 2.87 1.6 2.87 3.68v6.06Z",
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-navy-700/60 bg-navy-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <p className="tracked-label font-display text-lg font-semibold text-gold-400">
              Simnani Estate
            </p>
            <p className="mt-4 text-sm text-muted">
              Elevating real estate excellence across India&apos;s most
              sought-after cities.
            </p>
            <div className="mt-6 flex items-center gap-4">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-navy-600 text-muted transition hover:border-gold-500 hover:text-gold-400"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d={social.path} />
                  </svg>
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
