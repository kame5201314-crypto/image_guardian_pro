"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/assets", label: "資產庫" },
  { href: "/scan", label: "掃描引擎" },
  { href: "/infringements", label: "維權中心" },
  { href: "/evidence", label: "存證庫" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-black/[0.04] bg-white">
      <div className="mx-auto max-w-[980px] px-4 lg:px-0">
        <div className="flex justify-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-5 py-3 text-xs font-medium transition-colors duration-200",
                  isActive
                    ? "text-[#1d1d1f]"
                    : "text-[#86868b] hover:text-[#424245]"
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-[#1d1d1f]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
