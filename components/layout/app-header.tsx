"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-black/[0.04]">
      <div className="mx-auto flex h-12 max-w-[980px] items-center justify-between px-4 lg:px-0">
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-70"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#1d1d1f] to-[#424245]">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-[#1d1d1f]">
            Image Guardian
          </span>
        </Link>

        <span className="text-[11px] font-medium text-[#86868b] tracking-wide uppercase">
          Pro
        </span>
      </div>
    </header>
  );
}
