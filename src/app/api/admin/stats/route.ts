import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminSupabaseClient();

    // Total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Users by plan
    const { data: planData } = await supabase
      .from('users')
      .select('plan_type');

    const planCounts = {
      free: 0,
      pro: 0,
      ultra_pro: 0,
    };
    planData?.forEach((u: any) => {
      const plan = u.plan_type || 'free';
      if (plan in planCounts) planCounts[plan as keyof typeof planCounts]++;
    });

    // Total analyses (API calls proxy)
    const { count: totalAnalyses } = await supabase
      .from('analyses')
      .select('*', { count: 'exact', head: true });

    // Today's analyses
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayAnalyses } = await supabase
      .from('analyses')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // This week's analyses
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: weekAnalyses } = await supabase
      .from('analyses')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString());

    // Revenue from transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount_inr, status')
      .eq('status', 'paid');

    const totalRevenue = transactions?.reduce((sum: number, t: any) => sum + Number(t.amount_inr || 0), 0) || 0;

    // Recent signups (last 5)
    const { data: recentSignups } = await supabase
      .from('users')
      .select('id, email, plan_type, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    // System health checks
    const systemHealth = {
      gemini_api: !!process.env.GEMINI_API_KEY,
      supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      razorpay: !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET,
      upstash: !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN,
      posthog: !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
      admin_auth: !!process.env.ADMIN_EMAIL && !!process.env.ADMIN_PASSWORD && !!process.env.ADMIN_JWT_SECRET,
    };

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      planCounts,
      totalAnalyses: totalAnalyses || 0,
      todayAnalyses: todayAnalyses || 0,
      weekAnalyses: weekAnalyses || 0,
      totalRevenue,
      recentSignups: recentSignups || [],
      systemHealth,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
