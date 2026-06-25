import type { Metadata, Viewport } from "next";

import { temporaryDisplay, temporaryDisplayBold } from "@/lib/fonts";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Vid.",
  description: "Vid. — curated music visuals and early access.",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${temporaryDisplay.variable} ${temporaryDisplayBold.variable}`}>
      <body>{children}</body>
    </html>
  );
}
