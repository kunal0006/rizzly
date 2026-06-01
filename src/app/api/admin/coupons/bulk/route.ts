import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

function generateCode(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'RIZZLY';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { count, discount_type, discount_value, max_uses, expires_at, applicable_plan } = await request.json();

    if (!count || count < 1 || count > 100) {
      return NextResponse.json({ error: 'Count must be between 1 and 100' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const codes: Array<Record<string, any>> = [];

    for (let i = 0; i < count; i++) {
      codes.push({
        code: generateCode(),
        discount_type: discount_type || 'percentage',
        discount_value: discount_value || 10,
        max_uses: max_uses || null,
        expires_at: expires_at || null,
        applicable_plan: applicable_plan || 'all',
      });
    }

    const { data, error } = await supabase.from('coupons').insert(codes).select();
    if (error) throw error;

    return NextResponse.json({ coupons: data, count: data?.length || 0 });
  } catch (error) {
    console.error('Bulk coupon error:', error);
    return NextResponse.json({ error: 'Failed to generate coupons' }, { status: 500 });
  }
}
