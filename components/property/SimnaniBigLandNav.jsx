import Link from "next/link";
import { MdAgriculture } from "react-icons/md";
import { BIG_LAND_CATEGORIES } from "@/lib/properties";

export default function SimnaniBigLandNav() {
  return (
    <div className="border-b border-navy-950/10 bg-cream shadow-[0_1px_12px_rgba(5,7,12,0.08)]">
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-2.5 sm:gap-5 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/agriculture" className="group flex shrink-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-950 text-gold-400 transition group-hover:bg-gold-400 group-hover:text-navy-950 sm:h-9 sm:w-9">
            <MdAgriculture className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </span>
          <span className="tracked-label hidden whitespace-nowrap font-display text-sm font-semibold text-navy-950 sm:block">
            Simnani Big Land
          </span>
        </Link>

        {/* Divider */}
        <span className="hidden h-6 w-px shrink-0 bg-navy-950/10 sm:block" />

        {/* Category links */}
        <nav className="gold-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto sm:gap-1.5">
          {BIG_LAND_CATEGORIES.map((category) => (
            <Link
              key={category.key}
              href={`/agriculture/${category.key}`}
              className="tracked-label flex min-h-[44px] shrink-0 items-center whitespace-nowrap rounded-full px-3.5 text-[11px] text-navy-950/70 transition hover:bg-navy-950/5 hover:text-gold-600 active:bg-navy-950/10 sm:text-xs"
            >
              {category.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
