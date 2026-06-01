import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const search = searchParams.get('search') || '';

    const supabase = createAdminSupabaseClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search) {
      query = query.ilike('email', `%${search}%`);
    }

    const { data: users, error, count } = await query;
    if (error) throw error;

    // Get analysis counts per user
    const userIds = users?.map((u: any) => u.id) || [];
    let analysisCountMap: Record<string, number> = {};

    if (userIds.length > 0) {
      const { data: analyses } = await supabase
        .from('analyses')
        .select('user_id')
        .in('user_id', userIds);

      if (analyses) {
        analyses.forEach((a: any) => {
          analysisCountMap[a.user_id] = (analysisCountMap[a.user_id] || 0) + 1;
        });
      }
    }

    const enrichedUsers = (users || []).map((u: any) => ({
      ...u,
      api_calls: analysisCountMap[u.id] || 0,
    }));

    return NextResponse.json({
      users: enrichedUsers,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });
  } catch (error) {
    console.error('Admin users GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, planType } = await request.json();
    if (!userId || !planType) {
      return NextResponse.json({ error: 'userId and planType are required' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from('users')
      .update({ plan_type: planType })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin users PUT error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
