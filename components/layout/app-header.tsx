"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Image Guardian</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-1 rounded-full">
            Pro Edition
          </span>
        </div>
      </div>
    </header>
  );
}
