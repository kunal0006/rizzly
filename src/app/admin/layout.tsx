"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  ToggleLeft,
  MessageSquareCode,
  Users,
  BarChart3,
  Ticket,
  Megaphone,
  MessageCircle,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "DASHBOARD", icon: LayoutDashboard, color: "bg-emerald-500" },
  { href: "/admin/pricing", label: "PRICING", icon: CreditCard, color: "bg-violet-500" },
  { href: "/admin/features", label: "FEATURES", icon: ToggleLeft, color: "bg-cyan-500" },
  { href: "/admin/prompts", label: "PROMPTS", icon: MessageSquareCode, color: "bg-amber-500" },
  { href: "/admin/users", label: "USERS", icon: Users, color: "bg-pink-500" },
  { href: "/admin/analytics", label: "ANALYTICS", icon: BarChart3, color: "bg-blue-500" },
  { href: "/admin/coupons", label: "COUPONS", icon: Ticket, color: "bg-orange-500" },
  { href: "/admin/announcements", label: "ANNOUNCE", icon: Megaphone, color: "bg-yellow-500" },
  { href: "/admin/feedback", label: "FEEDBACK", icon: MessageCircle, color: "bg-rose-500" },
  { href: "/admin/settings", label: "SETTINGS", icon: Settings, color: "bg-slate-500" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Don't wrap the login page in the admin layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#0a0a1a" }}>
      {/* Scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
        }}
      />

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: "#0d0d24", borderBottom: "3px solid #1a1a3e" }}>
        <button onClick={() => setSidebarOpen(true)} className="text-gray-300 p-1">
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-pixel text-xs text-emerald-400 tracking-wider">RIZZLY ADMIN</span>
        <div className="w-8" />
      </header>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen z-50 flex flex-col w-60
          transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{
          background: "#0d0d24",
          borderRight: "3px solid #1a1a3e",
        }}
      >
        {/* Sidebar Header */}
        <div className="px-4 py-5 flex items-center justify-between" style={{ borderBottom: "3px solid #1a1a3e" }}>
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center" style={{ background: "#00ff00", border: "2px solid #000" }}>
              <span className="font-pixel text-[8px] text-black">R</span>
            </div>
            <span className="font-pixel text-[10px] text-emerald-400 tracking-wider">ADMIN</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 text-xs font-bold uppercase tracking-wide transition-all duration-100
                  ${isActive
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-200"
                  }
                `}
                style={isActive ? {
                  background: "#1a1a3e",
                  boxShadow: "3px 3px 0px #000",
                  border: "2px solid #2a2a5e",
                } : {}}
              >
                <div
                  className={`w-7 h-7 flex items-center justify-center ${isActive ? item.color : "bg-gray-800"}`}
                  style={{ border: "2px solid #000" }}
                >
                  <item.icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-mono text-[11px]">{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto text-emerald-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="px-2 py-3" style={{ borderTop: "3px solid #1a1a3e" }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <div className="w-7 h-7 flex items-center justify-center bg-red-900/50" style={{ border: "2px solid #000" }}>
              <LogOut className="w-3.5 h-3.5" />
            </div>
            <span className="font-mono text-[11px]">LOGOUT</span>
          </button>
          <div className="mt-3 px-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 animate-pulse" style={{ boxShadow: "0 0 6px #00ff00" }} />
            <span className="text-[9px] font-mono text-gray-600 uppercase">System Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen md:ml-0 pt-14 md:pt-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
