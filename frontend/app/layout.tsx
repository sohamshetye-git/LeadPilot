import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LeadPilot - AI-Powered Event Lead Management",
  description: "Capture, prioritize, and accelerate follow-ups for B2B event leads with Google Gemini AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-zinc-50 dark:bg-zinc-950">
      <body className={`${inter.className} min-h-full flex flex-col text-zinc-900 dark:text-zinc-50 antialiased`}>
        <Navbar />
        <main className="flex-1 pb-16">
          {children}
        </main>
      </body>
    </html>
  );
}
