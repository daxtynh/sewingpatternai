import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sewing Pattern AI - Turn Any Image Into a Custom Sewing Pattern",
  description: "AI-powered sewing pattern generator. Upload any garment image and get production-ready sewing patterns perfectly sized to your measurements.",
  keywords: ["sewing pattern", "AI", "pattern generator", "custom patterns", "dressmaking", "FreeSewing"],
  authors: [{ name: "Sewing Pattern AI" }],
  openGraph: {
    title: "Sewing Pattern AI",
    description: "Turn any image into a custom sewing pattern with AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
