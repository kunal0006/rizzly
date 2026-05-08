const STORAGE_KEY = "rizzly_token_balance";
const INITIAL_TOKENS = 10;
const TOKENS_PER_ANALYSIS = 5;

export function getTokenBalance(): number {
  if (typeof window === "undefined") return INITIAL_TOKENS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) {
    // First-time user: grant 10 free tokens
    localStorage.setItem(STORAGE_KEY, String(INITIAL_TOKENS));
    return INITIAL_TOKENS;
  }
  return parseInt(stored, 10);
}

export function deductTokens(): boolean {
  const balance = getTokenBalance();
  if (balance < TOKENS_PER_ANALYSIS) return false;
  const newBalance = balance - TOKENS_PER_ANALYSIS;
  localStorage.setItem(STORAGE_KEY, String(newBalance));
  return true;
}

export function refundTokens(): void {
  const balance = getTokenBalance();
  const newBalance = balance + TOKENS_PER_ANALYSIS;
  localStorage.setItem(STORAGE_KEY, String(newBalance));
}

export function addTokens(amount: number): void {
  const balance = getTokenBalance();
  localStorage.setItem(STORAGE_KEY, String(balance + amount));
}
