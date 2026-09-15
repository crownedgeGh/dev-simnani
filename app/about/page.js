import { FiMapPin, FiMail } from "react-icons/fi";
import { FaInstagram } from "react-icons/fa6";
import BackButton from "@/components/layout/BackButton";

const LEADERSHIP = [
  {
    initials: "IA",
    role: "FOUNDER",
    name: "Imran Ali",
    title: "Founder — Real Estate & Business Development",
  },
  {
    initials: "SM",
    role: "CO-FOUNDER",
    name: "Shaikh Mahfooz",
    title: "Co-Founder — Land & Farmland Ventures",
  },
];

export const metadata = {
  title: "About  | Simnani Estate",
  description:
    "Learn about Simnani Groups' leadership and find our office location in Raipur, Chhattisgarh.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="font-display text-3xl text-cream sm:text-4xl">
          About
        </h1>
      </div>

      <p className="tracked-label mt-10 text-xs text-gold-400">Leadership</p>

      <div className="mt-4 flex flex-col gap-4">
        {LEADERSHIP.map(({ initials, role, name, title }) => (
          <div
            key={name}
            className="flex items-center gap-5 rounded-sm border border-navy-700/60 bg-navy-900 px-6 py-6"
          >
            <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border border-gold-500/60 px-1 text-center">
              <span className="font-display text-lg text-cream">{initials}</span>
              <span className="text-[8px] font-semibold uppercase tracking-wide text-gold-400 leading-tight">
                {role}
              </span>
            </div>
            <div>
              <p className="font-display text-lg text-cream sm:text-xl">{name}</p>
              <p className="tracked-label text-xs text-gold-400">{title}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-10 max-w-3xl text-sm text-muted sm:text-base">
        SIMNANI GROUPS, under the visionary leadership of Imran Ali and Shaikh
        Mahfooz, operates from its central executive office in Currency Tower,
        Raipur. We are strategically aligned to spearhead growth and premium
        innovations across diverse real estate, farmland ventures, and
        high-impact industries.
      </p>

      <div className="mt-8 flex flex-col gap-5 text-sm">
        <div className="flex gap-3">
          <FiMapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold-400" />
          <p className="text-cream">
            Shop No 1080, First Floor, Beside House of Sansa, Currency Tower,
            VIP Road Corner, Raipur, Chhattisgarh, India
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
      </div>
    </div>
  );
}
