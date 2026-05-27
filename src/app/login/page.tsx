"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 selection:bg-primary/30 relative overflow-x-hidden">
      
      <Link href="/" className="absolute top-8 left-8 text-xl md:text-2xl pt-1 brutal-border bg-white px-4 py-2 brutal-shadow-sm hover:translate-y-1 transition-transform">
        RIZZLY
      </Link>

      <div className="w-full max-w-md bg-white brutal-border rounded-3xl p-8 brutal-shadow relative z-10 mt-16 md:mt-0">
        
        <div className="absolute -top-12 -right-6 w-24 h-24 rotate-12 z-20">
          <Image 
            src="/dino.png" 
            alt="Dino" 
            fill
            className="object-contain drop-shadow-[4px_4px_0_rgba(0,0,0,1)]"
          />
        </div>

        <div className="text-center mb-8 border-b-4 border-black pb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">LOGIN</h1>
          <p className="font-bold text-sm uppercase">Enter the game</p>
        </div>

        {error && (
          <div className="bg-secondary text-white p-3 brutal-border mb-6 text-sm font-bold uppercase text-center">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-black font-bold brutal-border py-4 px-4 flex items-center justify-center gap-2 brutal-shadow-sm hover:-translate-y-1 transition-transform uppercase disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t-4 border-black"></div>
            <span className="flex-shrink-0 mx-4 font-bold uppercase text-xs">or</span>
            <div className="flex-grow border-t-4 border-black"></div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold uppercase">Email</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="PLAYER1@GMAIL.COM" 
                required
                className="w-full bg-white brutal-border px-4 py-3 text-sm outline-none focus:bg-accent transition-colors placeholder:text-gray-400 font-bold font-mono"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-bold uppercase">Password</label>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                required
                className="w-full bg-white brutal-border px-4 py-3 text-sm outline-none focus:bg-accent transition-colors placeholder:text-gray-400 font-bold font-mono"
              />
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-black font-bold py-4 px-4 flex items-center justify-center gap-2 brutal-border brutal-shadow-sm hover:-translate-y-1 transition-transform uppercase text-lg mt-4 disabled:opacity-50"
            >
              {loading ? "LOADING..." : "START"} <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        <p className="text-center text-sm font-bold mt-8 border-t-4 border-black pt-6 uppercase">
          No account? <Link href="/signup" className="text-secondary hover:text-pink-600 underline">Sign up</Link>
        </p>
      </div>
    </main>
  );
}
