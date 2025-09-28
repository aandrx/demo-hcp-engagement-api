import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { suppressHydrationWarning, suppressDevToolsWarning, suppressRuntimeErrors } from "@/utils/suppress-warnings";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "HCP Engagement Platform",
  description: "Healthcare Provider Analytics & Literature Search Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Suppress development warnings
  if (typeof window !== 'undefined') {
    suppressHydrationWarning();
    suppressDevToolsWarning();
    suppressRuntimeErrors();
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}