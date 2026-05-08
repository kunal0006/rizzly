"use client";

import { useState, useEffect } from "react";
import { Clock, MessageSquare, Search } from "lucide-react";
import { getHistory, formatTimeAgo, ChatHistoryItem } from "@/lib/history";

export default function HistoryPage() {
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  
  useEffect(() => {
    setHistory(getHistory().slice(0, 5)); // limit to last 5
  }, []);
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">
      <header className="space-y-4 border-b-4 border-black pb-8">
        <h1 className="text-4xl md:text-5xl font-pixel uppercase tracking-tight">SAVED FILES</h1>
        <p className="font-bold text-xl uppercase">Look back at your past conversations</p>
        
        <div className="relative max-w-md mt-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-black" />
          <input 
            type="text" 
            placeholder="Search past chats..." 
            className="w-full bg-white brutal-border brutal-shadow-sm pl-12 pr-4 py-3 text-sm font-bold uppercase outline-none focus:bg-accent transition-all placeholder:text-gray-400"
          />
        </div>
      </header>

      <div className="space-y-6">
        {history.length === 0 ? (
          <div className="text-center p-12 bg-white brutal-border brutal-shadow-sm font-bold uppercase">
            No save files found. Play a game to start.
          </div>
        ) : (
          history.map((item) => (
          <div key={item.id} className={`${item.color} brutal-border brutal-shadow-sm p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:-translate-y-1 transition-transform cursor-pointer group`}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary brutal-border flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-black" />
              </div>
              <div>
                <h4 className="font-bold text-xl mb-1 uppercase">{item.name}</h4>
                <p className="text-sm font-mono font-bold line-clamp-1">{item.preview}</p>
                <div className="flex items-center gap-2 mt-2 md:hidden">
                  <Clock className="w-4 h-4 text-black" />
                  <span className="text-xs font-bold uppercase">{formatTimeAgo(item.time)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 justify-between md:justify-end border-t-4 border-black md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-accent brutal-border text-xs font-bold uppercase text-center">{item.vibe}</span>
                <span className="px-3 py-1 bg-secondary text-white brutal-border text-xs font-bold uppercase text-center">{item.match} SCORE</span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-black bg-white brutal-border px-2 py-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">{formatTimeAgo(item.time)}</span>
              </div>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}
