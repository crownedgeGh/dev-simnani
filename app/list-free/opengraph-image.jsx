import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Sell or Rent your property — list FREE on Simnani Estate";

// ponytail: default OG font (no Google Font fetch) — add Inter loading like post-property/opengraph-image.jsx if branding demands it.
export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/logo-se.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  const chip = (t) => (
    <div style={{ display: "flex", padding: "12px 26px", borderRadius: 999, border: "1px solid rgba(245,180,0,0.55)", background: "rgba(255,198,51,0.10)", color: "#ffde85", fontSize: 28, fontWeight: 700 }}>
      {t}
    </div>
  );

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#05070c", backgroundImage: "radial-gradient(ellipse 1000px 560px at 50% -10%, rgba(255,198,51,0.30), transparent 60%)", padding: "50px 80px" }}>
        <img src={logoSrc} width={340} height={79} alt="" />
        <div style={{ marginTop: 34, display: "flex", fontSize: 28, fontWeight: 700, letterSpacing: 8, color: "#ffc633" }}>SELL · RENT · LIST FREE</div>
        <div style={{ marginTop: 18, display: "flex", fontSize: 80, fontWeight: 800, color: "#f5f1e8", textAlign: "center", lineHeight: 1.1 }}>
          Post Your Property Now
        </div>
        <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", padding: "10px 34px", borderRadius: 999, background: "#ffc633", color: "#05070c", fontSize: 54, fontWeight: 800 }}>100% FREE</div>
          <div style={{ display: "flex", fontSize: 34, color: "#9aa3b8" }}>No charges. Genuine leads.</div>
        </div>
        <div style={{ marginTop: 40, display: "flex", gap: 20 }}>
          {chip("Owners · 5 free listings")}
          {chip("Brokers · 20 free listings")}
        </div>
      </div>
    ),
    size
  );
}
