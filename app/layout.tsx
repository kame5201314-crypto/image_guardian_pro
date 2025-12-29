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
      <body className="min-h-screen bg-[#f5f5f7] antialiased font-sans overflow-x-hidden">
        {/* App Container with Flex Layout */}
        <div className="app-layout">
          {/* Fixed Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
