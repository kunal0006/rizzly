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
      .from('admin_config')
      .select('*')
      .eq('key', 'ai_prompts')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    const prompts = data?.value ? JSON.parse(data.value) : {};
    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('Admin prompts GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { promptKey, content } = await request.json();
    if (!promptKey || content === undefined) {
      return NextResponse.json({ error: 'promptKey and content are required' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    // Get current prompts
    const { data: existing } = await supabase
      .from('admin_config')
      .select('value')
      .eq('key', 'ai_prompts')
      .single();

    const prompts = existing?.value ? JSON.parse(existing.value) : {};

    // Save version of old prompt if it existed
    if (prompts[promptKey]) {
      await supabase.from('prompt_versions').insert({
        prompt_key: promptKey,
        content: prompts[promptKey],
      });
    }

    // Update prompt
    prompts[promptKey] = content;

    await supabase
      .from('admin_config')
      .upsert(
        { key: 'ai_prompts', value: JSON.stringify(prompts), updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin prompts PUT error:', error);
    return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 });
  }
}
