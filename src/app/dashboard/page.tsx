"use client";

import { useState, useEffect } from "react";
import { Upload, MessageSquare, Zap, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getHistory, formatTimeAgo, ChatHistoryItem } from "@/lib/history";
import { createClient } from "@/lib/supabase/client";

export default function DashboardHome() {
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [userName, setUserName] = useState("PLAYER");
  
  useEffect(() => {
    setHistory(getHistory().slice(0, 5)); // show last 5

    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "PLAYER";
        setUserName(name.toUpperCase());
      }
    };
    fetchUser();
  }, []);
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">
      <header className="space-y-4 border-b-4 border-black pb-8">
        <h1 className="text-4xl md:text-5xl font-bold font-pixel uppercase tracking-tight">{userName}</h1>
        <p className="font-bold text-xl uppercase">Welcome to the lobby</p>
      </header>

      {/* Main Action Area */}
      <section>
        <Link href="/analyzer" className="block w-full">
          <div className="w-full bg-secondary brutal-border brutal-shadow rounded-3xl p-8 md:p-12 text-center hover:-translate-y-1 transition-transform group cursor-pointer relative overflow-hidden">
            <div className="absolute right-4 bottom-4 w-24 h-24 opacity-50 rotate-12">
              <Image src="/dino.png" alt="Dino" fill className="object-contain" />
            </div>
            
            <div className="w-20 h-20 bg-white brutal-border brutal-shadow-sm flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform">
              <Upload className="w-10 h-10 text-black" />
            </div>
            <h2 className="text-3xl md:text-4xl font-pixel text-white mb-4 paint-stroke-black [text-shadow:-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000,2px_2px_0_#000]">
              GET YOUR NEXT DATE
            </h2>
            <p className="font-bold text-white uppercase text-sm md:text-lg max-w-sm mx-auto bg-black p-2">
              INSERT SCREENSHOT TO START
            </p>
          </div>
        </Link>
      </section>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "CHATS SAVED", value: history.length > 0 ? getHistory().length.toString() : "0", icon: <MessageSquare className="w-6 h-6 text-black" />, color: "bg-primary" },
          { label: "AVG SCORE", value: history.length > 0 ? `${Math.round(getHistory().reduce((acc, curr) => acc + (curr.match === "HIGH" ? 90 : curr.match === "MID" ? 70 : 40), 0) / getHistory().length)}%` : "--", icon: <Zap className="w-6 h-6 text-black" />, color: "bg-accent" },
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} brutal-border brutal-shadow-sm rounded-xl p-4 flex flex-col justify-between h-32 hover:-translate-y-1 transition-transform`}>
            <div className="flex justify-between items-start">
              <span className="text-sm font-bold uppercase">{stat.label}</span>
              {stat.icon}
            </div>
            <span className="text-4xl font-pixel">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Recent History */}
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b-4 border-black pb-2">
          <h3 className="text-2xl font-pixel">SAVED FILES</h3>
          <Link href="/dashboard/history" className="text-sm font-bold uppercase hover:bg-black hover:text-white px-2 py-1 transition-colors">View all</Link>
        </div>
        
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center p-8 bg-white brutal-border font-bold uppercase">
              No saved files yet.
            </div>
          ) : (
            history.map((item) => (
            <div key={item.id} className={`${item.color} brutal-border brutal-shadow-sm rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between hover:-translate-y-1 transition-transform cursor-pointer gap-4`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary brutal-border flex items-center justify-center">
                  <Clock className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{item.name}</h4>
                  <span className="text-xs font-bold uppercase text-gray-500">{formatTimeAgo(item.time)}</span>
                </div>
              </div>
            </div>
          )))}
        </div>
      </section>
    </div>
  );
}
