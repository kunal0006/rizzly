export type ChatHistoryItem = {
  id: string;
  name: string;
  match: string;
  time: number;
  vibe: string;
  preview: string;
  color: string;
};

const STORAGE_KEY = "rizzly_history";

export function saveAnalysisToHistory(analysis: any) {
  if (typeof window === "undefined") return;

  const existing = getHistory();
  
  // Create a fun fake name since we don't know who they are talking to
  const adjectives = ["MYSTERIOUS", "CUTE", "FUNNY", "SPICY", "CHILL"];
  const name = `${adjectives[Math.floor(Math.random() * adjectives.length)]} MATCH`;

  // Get first word of vibe summary as 'vibe' if possible
  const vibe = analysis.vibeSummary ? analysis.vibeSummary.split(' ')[0].replace(/[^a-zA-Z]/g, '') : "UNKNOWN";
  
  // Pick a random background color for the card
  const colors = ["bg-white", "bg-gray-200", "bg-pink-100", "bg-green-100"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  const newItem: ChatHistoryItem = {
    id: Math.random().toString(36).substring(7),
    name: name,
    match: analysis.interestLabel?.toUpperCase() || "MID",
    time: Date.now(),
    vibe: vibe.toUpperCase().substring(0, 8), // Keep it short
    preview: analysis.replies?.[0]?.text || "No reply generated",
    color: color,
  };

  const updated = [newItem, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getHistory(): ChatHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return "JUST NOW";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}M AGO`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}H AGO`;
  const days = Math.floor(hours / 24);
  return `${days}D AGO`;
}
