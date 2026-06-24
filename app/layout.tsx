import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Proper Paper Audit",
    template: "%s — Proper Paper Audit",
  },
  description: "Does your paper generate thought, or only arrange language? A conceptual audit engine for research papers and manuscripts.",
  openGraph: {
    title: "Proper Paper Audit",
    description: "Does your paper generate thought, or only arrange language?",
    siteName: "Proper Paper Audit",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Proper Paper Audit",
    description: "Does your paper generate thought, or only arrange language?",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
