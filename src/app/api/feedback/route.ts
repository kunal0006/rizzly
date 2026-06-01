import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { message, email, pageUrl } = await request.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message too long (max 2000 chars)' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from('feedback').insert({
      message: message.trim(),
      user_email: email || null,
      page_url: pageUrl || null,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
