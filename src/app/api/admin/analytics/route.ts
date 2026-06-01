import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminSupabaseClient();

    // Daily API calls over last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentAnalyses } = await supabase
      .from('analyses')
      .select('created_at, analysis_type')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // Group by day
    const dailyCalls: Record<string, number> = {};
    const featureUsage: Record<string, number> = {};
    const hourlyUsage: Record<number, number> = {};

    (recentAnalyses || []).forEach((a: any) => {
      const date = new Date(a.created_at);
      const dayKey = date.toISOString().split('T')[0];
      dailyCalls[dayKey] = (dailyCalls[dayKey] || 0) + 1;

      const type = a.analysis_type || 'unknown';
      featureUsage[type] = (featureUsage[type] || 0) + 1;

      const hour = date.getHours();
      hourlyUsage[hour] = (hourlyUsage[hour] || 0) + 1;
    });

    // Fill in missing days
    const dailyData: Array<{ date: string; calls: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyData.push({ date: key, calls: dailyCalls[key] || 0 });
    }

    // Feature usage data
    const featureLabels: Record<string, string> = {
      chat_analysis: 'Chat Analyzer',
      target_profile: 'Target Analyzer',
      self_profile: 'Profile Optimizer',
    };
    const featureData = Object.entries(featureUsage).map(([key, count]) => ({
      name: featureLabels[key] || key,
      value: count,
    }));

    // User distribution by plan
    const { data: users } = await supabase.from('users').select('plan_type');
    const planDist: Record<string, number> = { free: 0, pro: 0, ultra_pro: 0 };
    (users || []).forEach((u: any) => {
      const plan = u.plan_type || 'free';
      if (plan in planDist) planDist[plan]++;
    });
    const planDistData = Object.entries(planDist).map(([name, value]) => ({ name, value }));

    // Most active hour
    let maxHour = 0;
    let maxHourCount = 0;
    Object.entries(hourlyUsage).forEach(([hour, count]) => {
      if (count > maxHourCount) {
        maxHour = parseInt(hour);
        maxHourCount = count;
      }
    });

    // Average calls per user
    const totalCalls = (recentAnalyses || []).length;
    const totalUsers = (users || []).length;
    const avgCallsPerUser = totalUsers > 0 ? (totalCalls / totalUsers).toFixed(1) : '0';

    return NextResponse.json({
      dailyData,
      featureData,
      planDistData,
      metrics: {
        avgCallsPerUser,
        mostActiveHour: `${maxHour}:00 - ${maxHour + 1}:00`,
        totalCalls30d: totalCalls,
      },
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
