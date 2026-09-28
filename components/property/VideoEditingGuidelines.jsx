import { FiCheck, FiX } from "react-icons/fi";
import { MdVideoCameraFront } from "react-icons/md";

// Placeholder demo data — will be replaced by per-property guidelines
// authored from the admin panel once that flow is built.
const DEMO_DO_LIST = [
  "Shoot in landscape, natural daylight — avoid flash or artificial white balance.",
  "Show every room in one continuous walkthrough, starting from the main entrance.",
  "Highlight unique features: view, balcony, parking, clubhouse, or amenities.",
  "Keep the camera steady — use a gimbal or walk slowly with both hands on the phone.",
  "End with an exterior shot of the building or society entrance.",
];

const DEMO_DONT_LIST = [
  "Don't include faces of residents, neighbours, or license plates in the frame.",
  "Don't add background music with copyright — keep audio natural or royalty-free.",
  "Don't exaggerate size, price, or amenities not present in the listing.",
  "Don't shoot vertically for property walkthroughs — landscape only.",
  "Don't leave clutter, laundry, or personal items visible in shots.",
];

export default function VideoEditingGuidelines() {
  return (
    <section className="mt-10">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-400/15">
          <MdVideoCameraFront className="h-4 w-4 text-gold-400" />
        </div>
        <h2 className="font-display text-xl text-cream">Video Editing Guidelines</h2>
      </div>
      <p className="mt-2 text-xs text-muted">
        Follow these guidelines when shooting or editing a walkthrough video for this property.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3 border border-navy-700/60 bg-navy-900 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15">
              <FiCheck className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <p className="tracked-label text-xs text-cream">Do This</p>
          </div>
          <ul className="flex flex-col gap-2.5">
            {DEMO_DO_LIST.map((item) => (
              <li key={item} className="border-l-2 border-emerald-500/40 pl-3 text-xs leading-relaxed text-muted">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3 border border-navy-700/60 bg-navy-900 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/15">
              <FiX className="h-3.5 w-3.5 text-red-400" />
            </div>
            <p className="tracked-label text-xs text-cream">Avoid This</p>
          </div>
          <ul className="flex flex-col gap-2.5">
            {DEMO_DONT_LIST.map((item) => (
              <li key={item} className="border-l-2 border-red-500/40 pl-3 text-xs leading-relaxed text-muted">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
