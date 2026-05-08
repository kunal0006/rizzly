import { Home, History, PlusSquare, LogOut } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row pb-20 md:pb-0 font-mono overflow-x-hidden">
      
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="w-64 border-r-4 border-black bg-white hidden md:flex flex-col h-screen sticky top-0 p-6 z-50">
        <Link href="/" className="font-bold text-3xl font-pixel text-black mb-12 brutal-border p-2 text-center brutal-shadow-sm bg-primary">
          RIZZLY
        </Link>
        <nav className="flex-1 flex flex-col gap-4">
          <Link href="/dashboard" className="p-4 brutal-border bg-white font-bold brutal-shadow-sm hover:-translate-y-1 transition-transform flex items-center gap-3 uppercase text-lg">
            <Home className="w-6 h-6" /> Home
          </Link>
          <Link href="/dashboard/history" className="p-4 brutal-border bg-white font-bold brutal-shadow-sm hover:-translate-y-1 transition-transform flex items-center gap-3 uppercase text-lg">
            <History className="w-6 h-6" /> History
          </Link>
        </nav>
        <div className="mt-auto">
          <Link href="/" className="p-4 brutal-border bg-white font-bold brutal-shadow-sm hover:-translate-y-1 transition-transform flex items-center gap-3 uppercase">
            <LogOut className="w-6 h-6" /> Exit Game
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full bg-white relative">
        <div className="md:hidden w-full border-b-4 border-black bg-white p-4 flex justify-between items-center z-50 sticky top-0">
           <Link href="/" className="font-bold text-xl font-pixel text-black">
            RIZZLY
          </Link>
        </div>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 border-t-4 border-black bg-white z-50 flex justify-around items-center px-2">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-black font-bold uppercase p-2">
          <Home className="w-6 h-6" />
          <span className="text-[10px]">Home</span>
        </Link>
        
        <Link href="/analyzer" className="relative -top-6 bg-secondary text-white w-16 h-16 brutal-border brutal-shadow flex items-center justify-center hover:-translate-y-1 transition-transform">
          <PlusSquare className="w-8 h-8" />
        </Link>
        
        <Link href="/dashboard/history" className="flex flex-col items-center gap-1 text-black font-bold uppercase p-2">
          <History className="w-6 h-6" />
          <span className="text-[10px]">History</span>
        </Link>
      </nav>
    </div>
  );
}
