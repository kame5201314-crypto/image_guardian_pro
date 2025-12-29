"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderOpen,
  Radar,
  Shield,
  Scale,
  Settings,
  X,
  Menu,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "儀表板", icon: LayoutDashboard },
  { href: "/assets", label: "資產庫", icon: FolderOpen },
  { href: "/scan", label: "掃描引擎", icon: Radar },
  { href: "/infringements", label: "維權中心", icon: Shield },
  { href: "/evidence", label: "存證庫", icon: Scale },
];

const bottomNavItems = [
  { href: "/settings", label: "設定", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white shadow-lg border border-neutral-200"
        aria-label="開啟選單"
      >
        <Menu className="w-5 h-5 text-neutral-700" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-[260px] bg-white border-r border-neutral-200 flex flex-col z-50 transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-neutral-100">
          <Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1d1d1f] to-[#424245] flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-[#1d1d1f] text-base">Image Guardian</span>
              <span className="ml-1.5 text-[10px] font-semibold text-[#0071e3] bg-[#0071e3]/10 px-1.5 py-0.5 rounded">PRO</span>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label="關閉選單"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-[#1d1d1f] text-white shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="py-4 px-3 border-t border-neutral-100">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-[#1d1d1f] text-white shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* Brand info */}
          <div className="mt-4 px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <p className="text-xs font-semibold text-[#1d1d1f]">Image Guardian Pro</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Powered by Gemini AI
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
