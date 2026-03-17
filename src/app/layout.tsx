import type { Metadata } from "next";
import { Inter, Geist, Radio_Canada, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const radioCanada = Radio_Canada({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "Lawn & Order | Professional Lawn Care in Lindale, TX",
  description:
    "Professional lawn mowing, edging, and maintenance services in Lindale, TX. Insured, reliable, and affordable. Call for a free estimate today!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable, radioCanada.variable, sourceSerif.variable)}>
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
