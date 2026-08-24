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

    if (error || !data) {
      return NextResponse.json({ tokenBalance: 0 });
    }

    return NextResponse.json({ tokenBalance: data.token_balance ?? 0 });
  } catch (error) {
    console.error("Balance fetch error:", error);
    return NextResponse.json({ tokenBalance: 0 });
  }
}
