import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "F3 Iron Clad Challenge",
  description: "Track your F3 challenge submissions and see the leaderboard",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Iron Clad",
  },
  icons: {
    icon: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      {
        url: "/apple-touch-icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
      },
      {
        url: "/apple-touch-icon-167x167.png",
        sizes: "167x167",
        type: "image/png",
      },
      {
        url: "/apple-touch-icon-120x120.png",
        sizes: "120x120",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    title: "F3 Iron Clad Challenge",
    description: "Track your F3 challenge submissions and see the leaderboard",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Iron Clad 2026 Challenge",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
