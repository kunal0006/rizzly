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
      .select('*')
      .order('created_at', { ascending: false });

    const { data: allUsers, error } = await query;
    if (error) throw error;

    const userIds = allUsers?.map((u: any) => u.id) || [];
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

    // Fetch emails from Supabase Auth
    let emailMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const emailPromises = userIds.map(async (id: string) => {
        try {
          const { data } = await supabase.auth.admin.getUserById(id);
          if (data?.user?.email) {
            emailMap[id] = data.user.email;
          }
        } catch (e) {
          // Ignore individual fetch errors
        }
      });
      await Promise.all(emailPromises);
    }

    // Enrich all users with emails and analysis counts
    let enrichedUsers = (allUsers || []).map((u: any) => ({
      ...u,
      email: u.email || emailMap[u.id] || "No Email",
      api_calls: analysisCountMap[u.id] || 0,
    }));

    // Perform search in-memory
    if (search) {
      const searchLower = search.toLowerCase();
      enrichedUsers = enrichedUsers.filter(u => u.email.toLowerCase().includes(searchLower));
    }

    const total = enrichedUsers.length;
    const totalPages = Math.ceil(total / pageSize);
    
    // Paginate in-memory
    const paginatedUsers = enrichedUsers.slice(from, from + pageSize);

    return NextResponse.json({
      users: paginatedUsers,
      total,
      page,
      pageSize,
      totalPages,
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
