import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

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
    <html lang="zh-TW" className={inter.variable}>
      <body className="min-h-screen bg-[#f8f9fa] antialiased font-sans">
        <Sidebar />
        <main className="lg:pl-[240px] min-h-screen transition-all duration-300">
          {children}
        </main>
      </body>
    </html>
  );
}
