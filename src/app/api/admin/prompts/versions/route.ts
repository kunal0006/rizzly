import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const promptKey = searchParams.get('promptKey');

    if (!promptKey) {
      return NextResponse.json({ error: 'promptKey is required' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from('prompt_versions')
      .select('*')
      .eq('prompt_key', promptKey)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    return NextResponse.json({ versions: data || [] });
  } catch (error) {
    console.error('Prompt versions GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { promptKey, content } = await request.json();
    if (!promptKey || !content) {
      return NextResponse.json({ error: 'promptKey and content are required' }, { status: 400 });
    }

    // Restore a version — update the current prompt in admin_config
    const supabase = createAdminSupabaseClient();
    const { data: existing } = await supabase
      .from('admin_config')
      .select('value')
      .eq('key', 'ai_prompts')
      .single();

    const prompts = existing?.value ? JSON.parse(existing.value) : {};

    // Save current version before restoring
    if (prompts[promptKey]) {
      await supabase.from('prompt_versions').insert({
        prompt_key: promptKey,
        content: prompts[promptKey],
      });
    }

    prompts[promptKey] = content;

    await supabase
      .from('admin_config')
      .upsert(
        { key: 'ai_prompts', value: JSON.stringify(prompts), updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Prompt version restore error:', error);
    return NextResponse.json({ error: 'Failed to restore version' }, { status: 500 });
  }
}
