import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminSupabaseClient();
    const { data: users, error } = await supabase
      .from('users')
      .select('email, plan_type, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Build CSV
    const headers = ['Email', 'Plan', 'Signup Date'];
    const rows = (users || []).map((u: any) => [
      u.email,
      u.plan_type || 'free',
      new Date(u.created_at).toISOString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((r: string[]) => r.map((v: string) => `"${v}"`).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=rizzly-users.csv',
      },
    });
  } catch (error) {
    console.error('User export error:', error);
    return NextResponse.json({ error: 'Failed to export users' }, { status: 500 });
  }
}
