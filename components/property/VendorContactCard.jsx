import { FaWhatsapp } from "react-icons/fa6";
import { MdCall } from "react-icons/md";

const VENDOR_NUMBER = "9988778899";

// Hardcoded vendor contact for Farming Land / Industrial pages (Task 5).
export default function VendorContactCard() {
  return (
    <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-navy-700/60 bg-navy-900 p-6 sm:flex-row">
      <div>
        <p className="tracked-label text-xs text-gold-400">Need Help Choosing?</p>
        <p className="mt-1 font-display text-xl text-cream">Connect with Vendor</p>
        <p className="mt-1 text-sm text-muted">+91 {VENDOR_NUMBER}</p>
      </div>
      <div className="flex w-full gap-3 sm:w-auto">
        <a
          href={`tel:+91${VENDOR_NUMBER}`}
          className="tracked-label flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-gold-500/70 px-6 text-xs text-gold-400 transition hover:bg-gold-500/10 sm:flex-none"
        >
          <MdCall className="h-4 w-4" /> Call
        </a>
        <a
          href={`https://wa.me/91${VENDOR_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="tracked-label flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-gold-400 px-6 text-xs text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 sm:flex-none"
        >
          <FaWhatsapp className="h-4 w-4" /> WhatsApp
        </a>
      </div>
    </div>
  );
}
