"use client";

import { useState, useEffect } from "react";
import { Clock, MessageSquare, Search, Sparkles, BookOpen, Trash2, X, Copy, Check, Info } from "lucide-react";
import { formatTimeAgo } from "@/lib/history";
import { createClient } from "@/lib/supabase/client";

type TabType = "all" | "chats" | "profiles" | "prompts";

interface HistoryItem {
  id: string;
  type: "chat_analysis" | "target_profile" | "self_profile" | "saved_prompt";
  name: string;
  subtitle: string;
  vibe: string;
  badge: string;
  badgeColor: string;
  time: number;
  color: string;
  rawData: any;
}

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      // Fetch analyses and prompts concurrently
      const [analysesRes, promptsRes] = await Promise.all([
        supabase
          .from("analyses")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("saved_prompts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
      ]);

      const colors = ["bg-accent", "bg-primary", "bg-pink-100", "bg-green-100", "bg-yellow-100"];
      let combined: HistoryItem[] = [];

      if (!analysesRes.error && analysesRes.data) {
        analysesRes.data.forEach((item: any) => {
          const resData = item.result_data || {};
          const colorIdx = item.id.charCodeAt(0) % colors.length;
          
          if (item.analysis_type === "chat_analysis") {
            combined.push({
              id: item.id,
              type: "chat_analysis",
              name: "CHAT REVIEW",
              subtitle: "Wingman Chat Analysis",
              vibe: resData.interestLabel || "HIGH",
              badge: resData.interestLevel ? `${resData.interestLevel}% INTEREST` : "CHAT",
              badgeColor: "bg-secondary text-white",
              time: new Date(item.created_at).getTime(),
              color: colors[colorIdx],
              rawData: resData
            });
          } else if (item.analysis_type === "target_profile") {
            combined.push({
              id: item.id,
              type: "target_profile",
              name: `${(resData.targetName || "Target").toUpperCase()}'S READ`,
              subtitle: `Target Psychology Audit (${resData.app || "App"})`,
              vibe: resData.vibeCheck?.overallVibe || "MYSTERIOUS",
              badge: "TARGET",
              badgeColor: "bg-black text-white",
              time: new Date(item.created_at).getTime(),
              color: colors[colorIdx],
              rawData: resData
            });
          } else if (item.analysis_type === "self_profile") {
            combined.push({
              id: item.id,
              type: "self_profile",
              name: `${(resData.app || "App").toUpperCase()} PROFILE AUDIT`,
              subtitle: "Self Profile Optimization Review",
              vibe: `GRADE ${resData.grade || "A"}`,
              badge: resData.score ? `${resData.score}/100 SCORE` : "AUDIT",
              badgeColor: "bg-accent text-black",
              time: new Date(item.created_at).getTime(),
              color: colors[colorIdx],
              rawData: resData
            });
          }
        });
      }

      if (!promptsRes.error && promptsRes.data) {
        promptsRes.data.forEach((item: any) => {
          let parsedData = { question: "Bespoke Prompt", answer: item.prompt_text, explanation: "", app: item.tone || "Dating App" };
          try {
            // Check if stored as rich JSON
            if (item.prompt_text.startsWith("{")) {
              parsedData = JSON.parse(item.prompt_text);
            }
          } catch (e) {
            // fall back to raw text
          }

          const colorIdx = item.id.charCodeAt(0) % colors.length;

          combined.push({
            id: item.id,
            type: "saved_prompt",
            name: parsedData.question.toUpperCase(),
            subtitle: `Saved prompt for ${parsedData.app}`,
            vibe: parsedData.app.toUpperCase(),
            badge: "SAVED PROMPT",
            badgeColor: "bg-primary text-black",
            time: new Date(item.created_at).getTime(),
            color: colors[colorIdx],
            rawData: parsedData
          });
        });
      }

      // Sort combined array by timestamp descending
      combined.sort((a, b) => b.time - a.time);
      setItems(combined);
    } catch (err) {
      console.error("Failed to load history data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteItem = async (e: React.MouseEvent, item: HistoryItem) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this save file?")) return;

    try {
      const supabase = createClient();
      if (item.type === "saved_prompt") {
        const { error } = await supabase.from("saved_prompts").delete().eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("analyses").delete().eq("id", item.id);
        if (error) throw error;
      }
      
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      if (selectedItem?.id === item.id) {
        setSelectedItem(null);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete item.");
    }
  };

  const copyToClipboard = (text: string, index: number | null = null) => {
    navigator.clipboard.writeText(text);
    if (index !== null) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } else {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  // Filters
  const filteredItems = items.filter((item) => {
    // Tab filter
    if (activeTab === "chats" && item.type !== "chat_analysis") return false;
    if (activeTab === "profiles" && item.type !== "target_profile" && item.type !== "self_profile") return false;
    if (activeTab === "prompts" && item.type !== "saved_prompt") return false;

    // Search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query) ||
        item.vibe.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10 min-h-screen">
      <header className="space-y-4 border-b-4 border-black pb-8">
        <h1 className="text-4xl md:text-5xl font-pixel uppercase tracking-tight">SAVED FILES</h1>
        <p className="font-bold text-xl uppercase">Access your operational intelligence history</p>
        
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-black" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search save files by keyword..." 
              className="w-full bg-white brutal-border brutal-shadow-sm pl-12 pr-4 py-3 text-sm font-bold uppercase outline-none focus:bg-accent transition-all placeholder:text-gray-400"
            />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b-4 border-black pb-4">
        {[
          { id: "all", label: "All Files" },
          { id: "chats", label: "Wingman Chats" },
          { id: "profiles", label: "Profile Audits" },
          { id: "prompts", label: "Bespoke Prompts" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-4 py-2 text-xs md:text-sm font-bold uppercase brutal-border brutal-shadow-sm cursor-pointer transition-all ${
              activeTab === tab.id 
                ? "bg-primary text-black -translate-y-0.5" 
                : "bg-white hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center p-12 bg-white brutal-border brutal-shadow-sm font-bold uppercase animate-pulse">
            Syncing save files from databank...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center p-12 bg-white brutal-border brutal-shadow-sm font-bold uppercase">
            {searchQuery ? "No matching records found." : "No save files stored in this slot."}
          </div>
        ) : (
          filteredItems.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setSelectedItem(item)}
              className={`${item.color} brutal-border brutal-shadow-sm p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:-translate-y-1 transition-transform cursor-pointer group`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white brutal-border flex items-center justify-center flex-shrink-0">
                  {item.type === "chat_analysis" && <MessageSquare className="w-6 h-6 text-black" />}
                  {item.type === "target_profile" && <BookOpen className="w-6 h-6 text-black" />}
                  {item.type === "self_profile" && <Sparkles className="w-6 h-6 text-black" />}
                  {item.type === "saved_prompt" && <Info className="w-6 h-6 text-black" />}
                </div>
                <div>
                  <h4 className="font-bold text-xl mb-1 uppercase tracking-tight line-clamp-1">{item.name}</h4>
                  <p className="text-sm font-mono font-bold line-clamp-1 text-gray-700">{item.subtitle}</p>
                  <div className="flex items-center gap-2 mt-2 md:hidden">
                    <Clock className="w-4 h-4 text-black" />
                    <span className="text-xs font-bold uppercase">{formatTimeAgo(item.time)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 justify-between md:justify-end border-t border-black/10 md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-white brutal-border text-xs font-bold uppercase">{item.vibe}</span>
                  <span className={`px-3 py-1 brutal-border text-xs font-bold uppercase ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-2 text-black bg-white brutal-border px-2 py-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">{formatTimeAgo(item.time)}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteItem(e, item)}
                    className="p-1.5 bg-red-400 hover:bg-red-500 brutal-border brutal-shadow-sm cursor-pointer hover:scale-105 transition-transform"
                    title="Delete File"
                  >
                    <Trash2 className="w-4 h-4 text-black" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[999] overflow-y-auto">
          <div className="bg-white brutal-border brutal-shadow w-full max-w-3xl rounded-3xl overflow-hidden my-8 max-h-[85vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-black text-white p-6 flex justify-between items-center brutal-border-b">
              <div>
                <span className="text-[10px] font-pixel bg-primary text-black px-2 py-0.5 uppercase">
                  {selectedItem.badge}
                </span>
                <h3 className="font-bold font-pixel text-xl md:text-2xl mt-1 tracking-tight">{selectedItem.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="p-2 bg-primary hover:bg-accent text-black brutal-border cursor-pointer transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 font-mono text-sm leading-relaxed">
              
              {/* CHAT ANALYSIS DETAIL VIEW */}
              {selectedItem.type === "chat_analysis" && (
                <div className="space-y-6">
                  <div className="bg-accent brutal-border p-6 rounded-2xl">
                    <h4 className="font-bold text-lg border-b-2 border-black pb-2 mb-4 uppercase">Interest Level Bar</h4>
                    <div className="w-full h-8 brutal-border bg-gray-200 p-1 flex mb-2">
                      <div 
                        className="h-full bg-secondary border-r-4 border-black"
                        style={{ width: `${selectedItem.rawData.interestLevel || 75}%` }}
                      />
                    </div>
                    <div className="flex justify-between font-bold text-sm">
                      <span>RATING: {selectedItem.rawData.interestLabel || "HIGH"}</span>
                      <span>SCORE: {selectedItem.rawData.interestLevel || 75}/100</span>
                    </div>
                  </div>

                  <div className="bg-white brutal-border p-6 rounded-2xl">
                    <h4 className="font-bold text-lg border-b-2 border-black pb-2 mb-3 uppercase">Vibe Check Summary</h4>
                    <p className="font-bold leading-relaxed">{selectedItem.rawData.vibeSummary}</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold font-pixel text-base border-b-4 border-black pb-2 uppercase">Suggested Responses</h4>
                    {(selectedItem.rawData.replies || []).map((reply: any, idx: number) => (
                      <div key={idx} className="bg-gray-100 brutal-border p-4 rounded-xl relative group">
                        <span className="absolute -top-3 left-4 bg-black text-white px-2 py-0.5 text-[10px] font-bold uppercase">
                          {reply.type}
                        </span>
                        <p className="font-bold pr-16 mt-2">{reply.text}</p>
                        <button
                          onClick={() => copyToClipboard(reply.text, idx)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary brutal-border brutal-shadow-sm flex items-center justify-center cursor-pointer hover:bg-accent"
                          title="Copy reply text"
                        >
                          {copiedIndex === idx ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TARGET PROFILE DETAIL VIEW */}
              {selectedItem.type === "target_profile" && (
                <div className="space-y-6">
                  {/* Bio details */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gray-100 brutal-border p-4 rounded-xl">
                      <span className="text-[10px] font-bold text-gray-500 block uppercase">NAME</span>
                      <span className="font-bold text-lg">{selectedItem.rawData.targetName || "Unknown"}</span>
                    </div>
                    <div className="bg-gray-100 brutal-border p-4 rounded-xl">
                      <span className="text-[10px] font-bold text-gray-500 block uppercase">AGE</span>
                      <span className="font-bold text-lg">{selectedItem.rawData.age || "Unknown"}</span>
                    </div>
                    <div className="bg-gray-100 brutal-border p-4 rounded-xl">
                      <span className="text-[10px] font-bold text-gray-500 block uppercase">APP PLATFORM</span>
                      <span className="font-bold text-lg">{selectedItem.rawData.app || "Dating App"}</span>
                    </div>
                  </div>

                  {/* Personality */}
                  <div className="bg-pink-100 brutal-border p-6 rounded-2xl">
                    <h4 className="font-bold text-lg border-b-2 border-black pb-2 mb-3 uppercase">Personality: {selectedItem.rawData.personalityBreakdown?.type}</h4>
                    <p className="font-bold mb-4">{selectedItem.rawData.personalityBreakdown?.summary}</p>
                    <div className="flex flex-wrap gap-2">
                      {(selectedItem.rawData.personalityBreakdown?.traits || []).map((trait: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-white brutal-border text-xs font-bold uppercase">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Attachment style & Vibe Check */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-green-100 brutal-border p-6 rounded-2xl">
                      <h4 className="font-bold text-base border-b-2 border-black pb-2 mb-3 uppercase">Attachment Pattern</h4>
                      <span className="inline-block px-3 py-1 bg-black text-white text-xs font-bold uppercase mb-2">
                        {selectedItem.rawData.attachmentStyle?.style} ({selectedItem.rawData.attachmentStyle?.confidence || 80}% confidence)
                      </span>
                      <p className="font-bold text-xs">{selectedItem.rawData.attachmentStyle?.explanation}</p>
                    </div>

                    <div className="bg-yellow-100 brutal-border p-6 rounded-2xl">
                      <h4 className="font-bold text-base border-b-2 border-black pb-2 mb-3 uppercase">Vibe Parameters</h4>
                      <ul className="space-y-1 text-xs font-bold">
                        <li>VIBE CATEGORY: {selectedItem.rawData.vibeCheck?.overallVibe}</li>
                        <li>ENERGY LEVEL: {selectedItem.rawData.vibeCheck?.energyLevel}/10</li>
                        <li>OPENNESS SCORE: {selectedItem.rawData.vibeCheck?.opennessToConnection}/10</li>
                        <li>HUMOR PREFERENCE: {selectedItem.rawData.vibeCheck?.humorStyle}</li>
                      </ul>
                    </div>
                  </div>

                  {/* Red/Green flags */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white brutal-border p-6 rounded-2xl">
                      <h4 className="font-bold text-green-700 border-b-2 border-green-700 pb-2 mb-3 uppercase">🟢 Green Flags</h4>
                      <ul className="space-y-2 text-xs font-bold">
                        {(selectedItem.rawData.greenFlags || []).map((flag: string, i: number) => (
                          <li key={i} className="flex gap-2"><span>✔</span> <span>{flag}</span></li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white brutal-border p-6 rounded-2xl">
                      <h4 className="font-bold text-red-500 border-b-2 border-red-500 pb-2 mb-3 uppercase">🔴 Red Flags</h4>
                      <ul className="space-y-2 text-xs font-bold">
                        {(selectedItem.rawData.redFlags || []).map((flag: string, i: number) => (
                          <li key={i} className="flex gap-2"><span>⚠</span> <span>{flag}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Openers */}
                  <div className="bg-accent brutal-border p-6 rounded-2xl">
                    <h4 className="font-bold text-lg border-b-2 border-black pb-2 mb-4 uppercase">Tailored Conversation Starters</h4>
                    <div className="space-y-4">
                      {(selectedItem.rawData.conversationHooks || []).map((hookObj: any, i: number) => (
                        <div key={i} className="bg-white brutal-border p-4 rounded-xl relative group">
                          <p className="font-mono font-bold pr-16 bg-gray-100 p-2 brutal-border mb-2">"{hookObj.hook}"</p>
                          <p className="text-xs font-bold text-gray-600">💡 WHY IT WORKS: {hookObj.why}</p>
                          <button
                            onClick={() => copyToClipboard(hookObj.hook)}
                            className="absolute right-4 top-4 w-8 h-8 bg-primary brutal-border brutal-shadow-sm flex items-center justify-center cursor-pointer hover:bg-accent"
                          >
                            <Copy className="w-4 h-4 text-black" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Do/Avoid Strategy */}
                  <div className="bg-gray-100 brutal-border p-6 rounded-2xl">
                    <h4 className="font-bold text-lg border-b-2 border-black pb-2 mb-4 uppercase">Operational Strategies</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-xs font-bold">
                      <div>
                        <span className="text-green-700 uppercase block mb-2">DO THIS:</span>
                        <ul className="space-y-1.5">
                          {(selectedItem.rawData.approachStrategy?.doThis || []).map((item: string, idx: number) => (
                            <li key={idx}>➕ {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-red-500 uppercase block mb-2">AVOID THIS:</span>
                        <ul className="space-y-1.5">
                          {(selectedItem.rawData.approachStrategy?.avoidThis || []).map((item: string, idx: number) => (
                            <li key={idx}>➖ {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SELF PROFILE DETAIL VIEW */}
              {selectedItem.type === "self_profile" && (
                <div className="space-y-6">
                  {/* Top Stats */}
                  <div className="bg-black text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center brutal-border gap-4">
                    <div>
                      <h4 className="text-2xl font-pixel text-primary uppercase">GRADE: {selectedItem.rawData.grade || "A"}</h4>
                      <p className="font-bold text-gray-400 mt-2 uppercase">{selectedItem.rawData.summary}</p>
                    </div>
                    <div className="w-24 h-24 bg-primary brutal-border flex items-center justify-center flex-shrink-0 text-black">
                      <span className="font-pixel text-xl">{selectedItem.rawData.score}/100</span>
                    </div>
                  </div>

                  {/* Profile Elements Analysis */}
                  <div className="space-y-4">
                    <h4 className="font-bold font-pixel text-base border-b-4 border-black pb-2 uppercase">Core Audits</h4>
                    
                    {/* Bio */}
                    <div className="bg-white brutal-border p-5 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-md text-secondary uppercase">BIO STRATEGY</span>
                        <span className="px-2 py-0.5 bg-accent brutal-border text-xs font-bold uppercase">{selectedItem.rawData.bio?.score}/100</span>
                      </div>
                      <p className="text-xs font-bold mb-3">{selectedItem.rawData.bio?.feedback}</p>
                      <div className="bg-gray-100 p-3 brutal-border border-l-4 border-primary">
                        <span className="text-[10px] font-bold text-gray-500 block uppercase">SUGGESTED REWRITE:</span>
                        <p className="font-bold text-xs">"{selectedItem.rawData.bio?.rewrite}"</p>
                      </div>
                    </div>

                    {/* Photos */}
                    <div className="bg-white brutal-border p-5 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-md text-secondary uppercase">PHOTO AUDIT</span>
                        <span className="px-2 py-0.5 bg-accent brutal-border text-xs font-bold uppercase">{selectedItem.rawData.photos?.score}/100</span>
                      </div>
                      <p className="text-xs font-bold mb-2">{selectedItem.rawData.photos?.feedback}</p>
                      <ul className="space-y-1 text-xs font-bold">
                        {(selectedItem.rawData.photos?.tips || []).map((tip: string, idx: number) => (
                          <li key={idx}>📸 {tip}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Prompts */}
                    <div className="bg-white brutal-border p-5 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-md text-secondary uppercase">PROMPT FEEDBACK</span>
                        <span className="px-2 py-0.5 bg-accent brutal-border text-xs font-bold uppercase">{selectedItem.rawData.prompts?.score}/100</span>
                      </div>
                      <p className="text-xs font-bold mb-3">{selectedItem.rawData.prompts?.feedback}</p>
                      <div className="bg-gray-100 p-3 brutal-border border-l-4 border-secondary">
                        <span className="text-[10px] font-bold text-gray-500 block uppercase">OPTIMIZED ANSWER:</span>
                        <p className="font-bold text-xs">"{selectedItem.rawData.prompts?.rewrite}"</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="bg-accent brutal-border p-6 rounded-2xl">
                    <h4 className="font-bold text-lg border-b-2 border-black pb-2 mb-4 uppercase">Priority Action Items</h4>
                    <div className="space-y-3 font-bold text-xs">
                      {(selectedItem.rawData.actions || []).map((actionObj: any, i: number) => (
                        <div key={i} className="bg-white brutal-border p-3 rounded-lg flex items-start gap-2">
                          <span className={`px-2 py-0.5 text-[9px] uppercase brutal-border ${
                            actionObj.priority === 'high' ? 'bg-red-400' : 'bg-yellow-300'
                          }`}>
                            {actionObj.priority}
                          </span>
                          <div>
                            <p className="font-bold">{actionObj.action}</p>
                            <p className="text-gray-500 text-[10px] mt-1">IMPACT: {actionObj.impact}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SAVED PROMPT DETAIL VIEW */}
              {selectedItem.type === "saved_prompt" && (
                <div className="space-y-6">
                  <div className="bg-primary brutal-border p-6 rounded-2xl relative">
                    <span className="absolute -top-3 left-6 bg-black text-white px-3 py-1 font-bold text-xs uppercase">
                      {selectedItem.rawData.app} PROMPT
                    </span>
                    <div className="mt-4">
                      <span className="text-xs font-bold text-gray-600 block uppercase mb-1">PROMPT QUESTION</span>
                      <h3 className="font-bold text-xl leading-tight border-b-2 border-black pb-3">{selectedItem.rawData.question}</h3>
                    </div>
                  </div>

                  <div className="bg-white brutal-border p-6 rounded-2xl relative">
                    <span className="text-xs font-bold text-secondary block uppercase mb-2">BESPOKE RESPONSE</span>
                    <p className="font-mono font-bold text-base bg-gray-100 p-4 brutal-border">
                      {selectedItem.rawData.answer}
                    </p>
                    <button
                      onClick={() => copyToClipboard(selectedItem.rawData.answer)}
                      className="mt-4 w-full bg-accent brutal-border brutal-shadow-sm font-bold uppercase py-3 hover:-translate-y-1 transition-transform cursor-pointer flex items-center justify-center gap-2"
                    >
                      {copiedText ? <Check className="w-5 h-5 text-secondary" /> : <Copy className="w-5 h-5" />}
                      {copiedText ? "COPIED ANSWER!" : "COPY TO CLIPBOARD"}
                    </button>
                  </div>

                  {selectedItem.rawData.explanation && (
                    <div className="bg-yellow-100 brutal-border p-6 rounded-2xl">
                      <h4 className="font-bold text-base border-b-2 border-black pb-2 mb-2 uppercase">Attraction Psychology</h4>
                      <p className="font-bold text-xs">💡 {selectedItem.rawData.explanation}</p>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="bg-gray-100 p-4 border-t-4 border-black text-right flex justify-between items-center font-mono">
              <span className="text-[10px] font-bold text-gray-500 uppercase">
                SAVED: {new Date(selectedItem.time).toLocaleDateString()}
              </span>
              <button 
                onClick={() => setSelectedItem(null)}
                className="bg-black text-white px-6 py-2 font-bold uppercase brutal-border hover:bg-gray-800 cursor-pointer"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
