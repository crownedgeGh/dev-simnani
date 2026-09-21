"use client";

import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaXTwitter, FaLinkedinIn } from "react-icons/fa6";
import { useLanguage } from "@/context/LanguageContext";

const SOCIALS = [
  {
    label: "Facebook",
    Icon: FaFacebookF,
    href: "https://www.facebook.com/profile.php?id=61571000980523",
  },
  {
    label: "Instagram",
    Icon: FaInstagram,
    href: "https://www.instagram.com/simnani.groups/",
  },
  { label: "X", Icon: FaXTwitter, href: "https://x.com/simnanigroups" },
  {
    label: "LinkedIn",
    Icon: FaLinkedinIn,
    href: "https://www.linkedin.com/in/simnanigroups-raipur-303721428/",
  },
];

export default function Footer() {
  const { t } = useLanguage();

  const COLUMNS = [
    {
      titleKey: "footer.col.company",
      title: "Company",
      links: [
        { labelKey: "footer.link.about", label: "About Us", href: "/about" },
        { labelKey: "footer.link.contact", label: "Contact Us", href: "/request-callback" },
      ],
    },
    {
      titleKey: "footer.col.properties",
      title: "Properties",
      links: [
        { labelKey: "footer.link.buy", label: "Buy", href: "/buy" },
        { labelKey: "footer.link.rent", label: "Rent", href: "/rent" },
        { labelKey: "footer.link.sell", label: "Sell", href: "/sell" },
        { labelKey: "footer.link.invest", label: "Invest", href: "/invest" },
        { labelKey: "footer.link.projects", label: "Projects", href: "/projects" },
        { labelKey: "footer.link.services", label: "Services", href: "/services" },
      ],
    },
    {
      titleKey: "footer.col.support",
      title: "Support",
      links: [
        { labelKey: "footer.link.help", label: "Help Center", href: "/help" },
        { labelKey: "footer.link.privacy", label: "Privacy Policy", href: "/legal/privacy-policy" },
        { labelKey: "footer.link.terms", label: "Terms & Conditions", href: "/legal/terms-conditions" },
        { labelKey: "footer.link.support", label: "Contact Support", href: "/help" },
      ],
    },
  ];

  return (
    <footer className="border-t border-navy-700/60 bg-navy-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <span className="relative block h-12 w-[206px]">
              <Image
                src="/logo-se.png"
                alt="Simnani Estates"
                fill
                sizes="206px"
                className="object-contain object-left"
              />
            </span>
            <p className="mt-4 text-sm text-muted">
              {t("footer.tagline")}
            </p>
            <div className="mt-6 flex items-center gap-4">
              {SOCIALS.map(({ label, Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
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
                {t(column.titleKey)}
              </p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition hover:text-gold-400"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-navy-700/60 pt-6 text-xs text-muted">
          © {new Date().getFullYear()} Simnani Estate. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
