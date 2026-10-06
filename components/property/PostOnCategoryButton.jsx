import Link from "next/link";
import { MdAddHome } from "react-icons/md";

// Deep-links into /post-property with this page's category pre-selected
// (section/category/purpose read by PostPropertyForm — see Task 4).
export default function PostOnCategoryButton({ section, category, purpose, label = "Post Property on this Category" }) {
  const params = new URLSearchParams();
  if (section) params.set("section", section);
  if (category) params.set("category", category);
  if (purpose) params.set("purpose", purpose);
  const query = params.toString();

  return (
    <Link
      href={`/post-property${query ? `?${query}` : ""}`}
      className="tracked-label inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-gold-400 px-6 py-3.5 text-center text-xs text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 active:scale-[0.98] sm:w-auto"
    >
      <MdAddHome className="h-4 w-4" />
      {label}
    </Link>
  );
}
