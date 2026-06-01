-- ==========================================
-- RIZZLY ADMIN PANEL: Database Schema
-- Run this in your Supabase SQL Editor
-- ==========================================

-- Admin Config (key-value store for pricing, feature flags, announcements, prompts)
CREATE TABLE IF NOT EXISTS public.admin_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,  -- JSON stringified
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Prompt Version History
CREATE TABLE IF NOT EXISTS public.prompt_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_key TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Coupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'percentage',  -- 'percentage' | 'flat'
  discount_value NUMERIC NOT NULL,
  max_uses INT,  -- NULL = unlimited
  used_count INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  applicable_plan TEXT NOT NULL DEFAULT 'all',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Coupon Redemptions
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ DEFAULT now()
);

-- Feedback Inbox
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  page_url TEXT,
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- Seed initial admin_config values
-- ==========================================

-- Feature Flags
INSERT INTO public.admin_config (key, value) VALUES
  ('feature_flags', '{"profile_analyzer_enabled":true,"bio_generator_enabled":true,"maintenance_mode":false,"new_user_signups":true,"free_tier_api_calls_limit":5,"pro_tier_api_calls_limit":50}')
ON CONFLICT (key) DO NOTHING;

-- Default Pricing Plans
INSERT INTO public.admin_config (key, value) VALUES
  ('pricing_plans', '[{"id":"pack_50","name":"50 TOKENS","tokens":"50","price":49,"visible":true,"features":["50 tokens"]},{"id":"pack_150","name":"150 TOKENS","tokens":"150","price":129,"visible":true,"popular":true,"features":["150 tokens"]},{"id":"pack_500","name":"500 TOKENS","tokens":"500","price":349,"visible":true,"features":["500 tokens"]},{"id":"sub_scout","name":"SCOUT","tokens":"100/mo","price":99,"visible":true,"features":["100 tokens/month","Basic chat analysis","Email support"]},{"id":"sub_alpha","name":"ALPHA","tokens":"400/mo","price":299,"visible":true,"popular":true,"features":["400 tokens/month","Advanced analysis","Priority support","Profile optimizer"]},{"id":"sub_grizzly","name":"GRIZZLY+","tokens":"1200/mo","price":699,"visible":true,"features":["1200 tokens/month","All features","24/7 support","Early access"]},{"id":"sub_ultra_pro","name":"ULTRA PRO","tokens":"Unlimited","price":1999,"visible":true,"features":["Unlimited AI analyses","Target Profile Decoder","Smart Prompt Generator","Self Profile Optimizer","Priority AI Processing","Early Access to New Features"]}]')
ON CONFLICT (key) DO NOTHING;

-- Default AI Prompts
INSERT INTO public.admin_config (key, value) VALUES
  ('ai_prompts', '{}')
ON CONFLICT (key) DO NOTHING;

-- Announcement Banner
INSERT INTO public.admin_config (key, value) VALUES
  ('announcement', '{"enabled":false,"text":"","color":"info","ctaText":"","ctaUrl":"","expiresAt":null}')
ON CONFLICT (key) DO NOTHING;
