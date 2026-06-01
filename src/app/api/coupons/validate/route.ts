import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !data) {
      return NextResponse.json({ valid: false, error: 'Invalid coupon code' }, { status: 404 });
    }

    // Check active
    if (!data.is_active) {
      return NextResponse.json({ valid: false, error: 'Coupon is not active' });
    }

    // Check expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Coupon has expired' });
    }

    // Check max uses
    if (data.max_uses !== null && data.used_count >= data.max_uses) {
      return NextResponse.json({ valid: false, error: 'Coupon has been fully redeemed' });
    }

    return NextResponse.json({
      valid: true,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      applicable_plan: data.applicable_plan,
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}
