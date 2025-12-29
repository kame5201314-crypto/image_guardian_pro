"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FolderOpen, Radar, Scale } from "lucide-react";

const navItems = [
  {
    href: "/assets",
    label: "資產庫",
    icon: FolderOpen,
    description: "Asset Vault",
  },
  {
    href: "/scan",
    label: "掃描引擎",
    icon: Radar,
    description: "Scan Engine",
  },
  {
    href: "/evidence",
    label: "維權存證",
    icon: Scale,
    description: "Evidence Vault",
  },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-neutral-100 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "text-neutral-900"
                    : "text-neutral-500 hover:text-neutral-700"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
