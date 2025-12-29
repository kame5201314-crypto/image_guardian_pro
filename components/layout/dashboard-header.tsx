"use client";

import { Search, Bell } from "lucide-react";
import { useState } from "react";

interface DashboardHeaderProps {
  title: string;
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Page title */}
      <h1 className="text-lg font-semibold text-[#1d1d1f] hidden sm:block">
        {title}
      </h1>

      {/* Right section */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="搜尋..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 lg:w-64 h-10 pl-10 pr-4 rounded-xl bg-neutral-100 border-0 text-sm text-[#1d1d1f] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-neutral-100 transition-colors">
          <Bell className="w-5 h-5 text-neutral-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User avatar */}
        <button className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0071e3] to-[#7c3aed] flex items-center justify-center text-white text-sm font-medium">
          A
        </button>
      </div>
    </header>
  );
}
