/**
 * Renders a plain schema.org object as a JSON-LD <script> tag.
 * JSON.stringify already escapes the object safely for this context — no
 * schema-dts/library dependency needed for a handful of known shapes.
 */
export default function JsonLd({ data }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
