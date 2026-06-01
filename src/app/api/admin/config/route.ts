import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Key parameter is required' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from('admin_config')
      .select('*')
      .eq('key', key)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({ config: data || null });
  } catch (error) {
    console.error('Admin config GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key, value } = await request.json();

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    const { data, error } = await supabase
      .from('admin_config')
      .upsert(
        { key, value: stringValue, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ config: data });
  } catch (error) {
    console.error('Admin config PUT error:', error);
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}
