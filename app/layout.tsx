import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "F3 Iron Clad Challenge",
  description: "Track your F3 challenge submissions and see the leaderboard",
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
