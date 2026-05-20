import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eclipse FriendlyBot",
  description: "Find relevant WhatsApp groups across farming, tourism, business, jobs, property, health, education and more.",
  metadataBase: new URL("https://eclipse-friendlybot.vercel.app")
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
