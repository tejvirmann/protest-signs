import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://protestsigns.com"),
  title: {
    default: "Protest Signs — Make Your Voice Heard",
    template: "%s | Protest Signs",
  },
  description:
    "Shop high-quality protest and rally signs. Plastic bag signs with bundle pricing, plus 40+ paper signs on today's issues. Fast shipping. Stand up, speak out.",
  keywords: [
    "protest signs",
    "rally signs",
    "political signs",
    "demonstration signs",
    "plastic bag signs",
    "paper protest signs",
    "march signs",
    "activist signs",
    "buy protest signs",
    "protest sign bundle",
  ],
  authors: [{ name: "Protest Signs" }],
  creator: "Protest Signs",
  publisher: "Protest Signs",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://protestsigns.com",
    siteName: "Protest Signs",
    title: "Protest Signs — Make Your Voice Heard",
    description:
      "Shop high-quality protest and rally signs. Plastic bag signs with bundle pricing, plus 40+ paper signs. Stand up, speak out.",
    images: [
      {
        url: "/logo.png",
        width: 1872,
        height: 1054,
        alt: "Protest Signs — Make Your Voice Heard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Protest Signs — Make Your Voice Heard",
    description:
      "Shop high-quality protest and rally signs. Plastic bag signs with bundle pricing, plus 40+ paper signs.",
    images: ["/logo.png"],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <footer className="border-t bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
              <p>&copy; {new Date().getFullYear()} Protest Signs. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="/browse?type=paper" className="hover:text-black transition-colors">Paper Signs</a>
                <a href="/browse?type=bag" className="hover:text-black transition-colors">Bag Signs</a>
                <a href="/about" className="hover:text-black transition-colors">About Us</a>
                <a href="/contact" className="hover:text-black transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
