import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Welcome - Minimal Next.js Site",
  description: "A minimal Next.js website deployed on Vercel.",
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
            <div className="text-center text-sm text-gray-600">
              <p>&copy; 2026 Minimal Site. All rights reserved.</p>
              <p className="mt-2">
                <a href="/contact" className="hover:text-black">Contact Us</a>
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
