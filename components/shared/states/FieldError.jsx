import { MdErrorOutline } from "react-icons/md";

/** Inline field-level validation message — drop directly under any input
 * built with inputClass/selectClass/textareaClass from inputStyles.js. */
export default function FieldError({ children }) {
  if (!children) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
      <MdErrorOutline className="h-3.5 w-3.5 shrink-0" />
      {children}
    </p>
  );
}
