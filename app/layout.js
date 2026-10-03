import { Inter, Open_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import PublicShell from "@/components/layout/PublicShell";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import LocationPrompt from "@/components/LocationPrompt";
import CookieConsentBanner from "@/components/CookieConsentBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "Simnani Estate | Find a Place You'll Love to Call Home",
  description:
    "Discover properties, investment opportunities and trusted real estate services with Simnani Estate.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${openSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-navy-950 text-cream">
        <GoogleAnalytics />
        <AuthProvider>
          <PublicShell>{children}</PublicShell>
          <LocationPrompt />
        </AuthProvider>
        <CookieConsentBanner />
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3000}
          gap={12}
          toastOptions={{
            style: {
              fontFamily: "var(--font-inter, Inter, sans-serif)",
              width: "380px",
            },
            classNames: {
              toast:
                "!rounded-2xl !border !border-navy-700/60 !bg-navy-900 !p-4 !shadow-2xl",
              title: "!font-display !text-[15px] !leading-snug !text-cream",
              description: "!mt-1.5 !text-xs !leading-relaxed !text-muted",
              actionButton:
                "!tracked-label !ml-2 !rounded-full !bg-gold-400 !px-4 !py-2.5 !text-[11px] !font-semibold !text-navy-950 !transition hover:!bg-gold-300",
              cancelButton:
                "!tracked-label !rounded-full !border !border-navy-700/60 !bg-transparent !px-4 !py-2.5 !text-[11px] !text-cream !transition hover:!border-gold-400 hover:!text-gold-400",
              closeButton:
                "!rounded-full !border-navy-700/60 !bg-navy-800 !text-cream hover:!bg-navy-700",
              success: "!border-gold-500/40",
              error: "!border-red-500/40",
            },
          }}
        />
      </body>
    </html>
  );
}
