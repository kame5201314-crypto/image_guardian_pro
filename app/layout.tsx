import type { Metadata } from "next";
import "./globals.css";
import { AppHeader } from "@/components/layout/app-header";
import { AppNav } from "@/components/layout/app-nav";

export const metadata: Metadata = {
  title: "Image Guardian Pro",
  description: "AI-Powered Image Protection & Infringement Detection System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen bg-white antialiased">
        <AppHeader />
        <AppNav />
        <main className="min-h-[calc(100vh-7rem)]">
          {children}
        </main>
      </body>
    </html>
  );
}
