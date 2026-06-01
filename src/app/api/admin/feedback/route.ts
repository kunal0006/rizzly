import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ feedback: data || [] });
  } catch (error) {
    console.error('Feedback GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...updates } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Feedback id is required' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from('feedback').update(updates).eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback PUT error:', error);
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 });
  }
}
