import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Post Your Property on Simnani Estate";

const HEADLINE = "Add Your Property. Get Buyers Fast.";
const SUBTEXT = "List free on Simnani Estate — verified leads, zero hassle.";
const EYEBROW = "POST YOUR PROPERTY";
const BADGE = "simnaniestates.com/post-property";

// Google's css2 endpoint serves a plain .ttf (instead of .woff2) when the
// request carries no User-Agent — satori/resvg (which ImageResponse uses)
// can only render ttf/otf, not woff2, so this is the standard workaround.
async function loadGoogleFont(text, weight) {
  const url = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const match = css.match(/src: url\(([^)]+)\) format\('(opentype|truetype)'\)/);
  if (!match) throw new Error("Google Font CSS did not contain a ttf/otf source");
  const res = await fetch(match[1]);
  if (!res.ok) throw new Error("Failed to download Google Font file");
  return res.arrayBuffer();
}

export default async function Image() {
  const logoData = await readFile(join(process.cwd(), "public/logo-se.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  let fonts;
  try {
    const [bold, semibold, regular] = await Promise.all([
      loadGoogleFont(HEADLINE, 700),
      loadGoogleFont(EYEBROW + BADGE, 600),
      loadGoogleFont(SUBTEXT, 400),
    ]);
    fonts = [
      { name: "Inter", data: bold, weight: 700, style: "normal" },
      { name: "Inter", data: semibold, weight: 600, style: "normal" },
      { name: "Inter", data: regular, weight: 400, style: "normal" },
    ];
  } catch {
    fonts = undefined;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#05070c",
          backgroundImage:
            "radial-gradient(ellipse 900px 500px at 50% -10%, rgba(255,198,51,0.20), transparent 60%)",
          padding: "70px 90px",
        }}
      >
        <img src={logoSrc} width={460} height={107} alt="" />

        <div
          style={{
            marginTop: 56,
            display: "flex",
            fontSize: 26,
            fontFamily: "Inter",
            fontWeight: 600,
            letterSpacing: 7,
            color: "#ffc633",
          }}
        >
          {EYEBROW}
        </div>

        <div
          style={{
            marginTop: 24,
            display: "flex",
            fontSize: 66,
            fontFamily: "Inter",
            fontWeight: 700,
            color: "#f5f1e8",
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: 980,
          }}
        >
          {HEADLINE}
        </div>

        <div
          style={{
            marginTop: 40,
            display: "flex",
            fontSize: 30,
            fontFamily: "Inter",
            fontWeight: 400,
            color: "#9aa3b8",
            textAlign: "center",
          }}
        >
          {SUBTEXT}
        </div>

        <div
          style={{
            marginTop: 48,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "16px 36px",
            borderRadius: 4,
            border: "1px solid rgba(245,180,0,0.5)",
            background: "rgba(255,198,51,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontFamily: "Inter",
              fontWeight: 600,
              letterSpacing: 2,
              color: "#ffc633",
            }}
          >
            {BADGE}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
