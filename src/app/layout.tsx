import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import { Yatra_One } from "next/font/google";
import { Toaster } from "sonner";
import { LookupProvider } from "@/contexts/lookup-context";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const yatraOne = Yatra_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-yatra-one",
});

export const metadata: Metadata = {
  title: "isKosher",
  description:
    "isKosher הוא מדריך כשרות עדכני לעסקים בישראל. גלו מסעדות וחנויות עם כשרות בתוקף, לפי מיקום, עיר, סוג אוכל, וקהילה.",
  keywords: [
    "כשרות",
    "isKosher",
    "מדריך כשרות",
    "מסעדות כשרות",
    "חנויות כשרות",
    "הרבנות",
    "בד״ץ",
    "כשרות בישראל",
    "תעודת כשרות",
  ],
  metadataBase: new URL("https://www.iskosher.co.il"),
  openGraph: {
    title: "isKosher",
    description: "מנוע חיפוש כשרות המתקדם בישראל. בדקו תוקף תעודות כשרות, חפשו לפי עיר, סוג אוכל ועוד.",
    url: "https://www.iskosher.co.il",
    siteName: "isKosher",
    type: "website",
    locale: "he_IL",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "isKosher - מדריך הכשרות הדיגיטלי",
      },
    ],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  authors: [{ name: "isKosher Team" }],
  applicationName: "isKosher",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} ${yatraOne.variable}  antialiased`}>
          <LookupProvider>
            <Navbar />
            {children}
            <Toaster position="top-left" dir="rtl" />
          </LookupProvider>
        </body>
      </html>
    </AuthProvider>
  );
}
