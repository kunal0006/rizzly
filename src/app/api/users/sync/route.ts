import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminSupabaseClient();

    // Check if user exists in public.users
    const { data: existingUser } = await adminSupabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!existingUser) {
      console.log(`Syncing user: creating public.users record for ${user.email} (${user.id})`);
      const { error: insertError } = await adminSupabase.from("users").insert({
        id: user.id,
        email: user.email!,
        plan_type: "free",
        free_uses_remaining: 1,
        token_balance: 10,
        subscription_tier: "Cub",
      });

      if (insertError) {
        console.error("Failed to insert synced user:", insertError);
        return NextResponse.json({ error: "Failed to create user record" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in sync-user route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
