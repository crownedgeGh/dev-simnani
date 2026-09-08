import { Playfair_Display, Inter, Open_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import PublicShell from "@/components/layout/PublicShell";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Simnani Estate | Find a Place You'll Love to Call Home",
  description:
    "Discover properties, investment opportunities and trusted real estate services with Simnani Estate.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${openSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-navy-950 text-cream">
        <AuthProvider>
          <PublicShell>{children}</PublicShell>
        </AuthProvider>
      </body>
    </html>
  );
}
