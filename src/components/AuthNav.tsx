"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AuthNav() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (isLoggedIn === null) {
    return <div className="h-10 w-24"></div>; // Placeholder to avoid jank
  }

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="bg-primary text-black font-bold px-3 py-1.5 text-xs md:text-sm brutal-border brutal-shadow-sm flex items-center justify-center hover:-translate-y-1 transition-transform">
          DASHBOARD
        </Link>
        <button 
          onClick={handleLogout}
          className="bg-white text-black font-bold p-1.5 md:p-2 text-xs brutal-border brutal-shadow-sm hover:-translate-y-1 transition-transform flex items-center"
          title="Logout"
        >
          <LogOut className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <Link href="/login" className="bg-secondary text-white font-bold px-4 py-2 text-sm brutal-border brutal-shadow-sm flex items-center justify-center hover:-translate-y-1 transition-transform">
        LOGIN
      </Link>
    </div>
  );
}
