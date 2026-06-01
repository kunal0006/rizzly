import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from('admin_config')
      .select('value')
      .eq('key', 'announcement')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data?.value) {
      return NextResponse.json({ announcement: null });
    }

    const announcement = JSON.parse(data.value);

    // Check if expired
    if (announcement.expiresAt && new Date(announcement.expiresAt) < new Date()) {
      return NextResponse.json({ announcement: null });
    }

    if (!announcement.enabled) {
      return NextResponse.json({ announcement: null });
    }

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error('Announcement fetch error:', error);
    return NextResponse.json({ announcement: null });
  }
}
