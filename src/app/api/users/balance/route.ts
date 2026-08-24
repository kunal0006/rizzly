import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("users")
      .select("token_balance")
      .eq("id", user.id)
      .single();

    // Distinguish a genuine "not found" from a DB/network error.
    // Never silently return 0 on a lookup failure — the caller should know.
    if (error) {
      console.error("Balance lookup error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch token balance." },
        { status: 500 }
      );
    }

    return NextResponse.json({ tokenBalance: data?.token_balance ?? 0 });
  } catch (error) {
    console.error("Balance fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch token balance." },
      { status: 500 }
    );
  }
}
