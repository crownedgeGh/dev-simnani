"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/gtag";

/** Fires a GA4 view_item event once per mount — dropped into the property
 * detail page (a server component) so the view is tracked without turning
 * the whole page client-side. */
export default function PropertyViewTracker({ id, title, price, type, location }) {
  useEffect(() => {
    trackEvent("view_item", {
      item_id: id,
      item_name: title,
      item_category: type,
      price,
      location,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return null;
}
