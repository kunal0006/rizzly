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
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ coupons: data || [] });
  } catch (error) {
    console.error('Coupons GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code, discount_type, discount_value, max_uses, expires_at, applicable_plan } = body;

    if (!code || !discount_type || discount_value === undefined) {
      return NextResponse.json({ error: 'code, discount_type, and discount_value are required' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        code: code.toUpperCase(),
        discount_type,
        discount_value,
        max_uses: max_uses || null,
        expires_at: expires_at || null,
        applicable_plan: applicable_plan || 'all',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ coupon: data });
  } catch (error) {
    console.error('Coupons POST error:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...updates } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Coupon id is required' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from('coupons')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Coupons PUT error:', error);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Coupon id is required' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from('coupons').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Coupons DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
