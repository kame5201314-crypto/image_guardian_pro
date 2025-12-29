"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FolderOpen, Radar, Shield, Scale } from "lucide-react";

const navItems = [
  { href: "/assets", label: "資產庫", icon: FolderOpen },
  { href: "/scan", label: "掃描引擎", icon: Radar },
  { href: "/infringements", label: "維權中心", icon: Shield },
  { href: "/evidence", label: "存證庫", icon: Scale },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-black/[0.04] bg-white sticky top-12 z-40">
      <div className="mx-auto max-w-[980px] px-4 lg:px-0">
        {/* Desktop: centered, Mobile: scrollable with icons */}
        <div className="flex sm:justify-center overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex min-w-max sm:min-w-0">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1.5 px-4 sm:px-5 py-3 text-xs font-medium transition-colors duration-200 whitespace-nowrap",
                    isActive
                      ? "text-[#1d1d1f]"
                      : "text-[#86868b] hover:text-[#424245]"
                  )}
                >
                  <Icon className="w-4 h-4 sm:hidden" />
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 sm:left-3 sm:right-3 h-[2px] rounded-full bg-[#1d1d1f]" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
