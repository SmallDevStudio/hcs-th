import { Noto_Sans_Thai } from "next/font/google";
import { AppProviders } from "@/components/common/AppProviders";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["latin", "thai"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "HCS Thailand | Hardware & Security Solutions",
    template: "%s | HCS Thailand",
  },

  description:
    "Architectural hardware, security products, fire doors and total opening solutions for every project.",

  applicationName: "HCS Thailand",

  keywords: [
    "HCS Thailand",
    "architectural hardware",
    "door hardware",
    "door closer",
    "door handles",
    "door locks",
    "fire doors",
    "panic exit hardware",
    "security solutions",
  ],

  authors: [
    {
      name: "HCS Thailand",
    },
  ],

  creator: "HCS Thailand",
  publisher: "HCS Thailand",

  manifest: "/site.webmanifest",

  icons: {
    icon: [
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    shortcut: "/favicon.ico",
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "th_TH",
    siteName: "HCS Thailand",
    title: "HCS Thailand | Hardware & Security Solutions",
    description:
      "Architectural hardware, security products, fire doors and total opening solutions for every project.",
    url: siteUrl,
  },

  twitter: {
    card: "summary_large_image",
    title: "HCS Thailand | Hardware & Security Solutions",
    description:
      "Architectural hardware, security products, fire doors and total opening solutions for every project.",
  },

  category: "Architectural Hardware",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#ffffff",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#07111b",
    },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${notoSansThai.variable} antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
