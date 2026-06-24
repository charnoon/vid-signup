import type { Metadata, Viewport } from "next";

import { temporaryDisplay } from "@/lib/fonts";
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
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={temporaryDisplay.variable}>
      <body>{children}</body>
    </html>
  );
}
