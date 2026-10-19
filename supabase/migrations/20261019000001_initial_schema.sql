-- Migration: 20261019000001_initial_schema.sql
-- Description: Core tables, profiles, extensions, and helper functions for ExamForge

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Function and trigger to auto-create profile on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to check if the current caller is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. Subscription Codes Table (Never stores plaintext codes, only SHA-256 hash)
CREATE TABLE IF NOT EXISTS public.subscription_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code_hash TEXT NOT NULL UNIQUE,
    code_prefix TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'pro' CHECK (plan IN ('pro', 'school', 'lifetime')),
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    max_uses INTEGER NOT NULL DEFAULT 1 CHECK (max_uses > 0),
    uses_count INTEGER NOT NULL DEFAULT 0 CHECK (uses_count >= 0),
    expires_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'depleted')),
    note TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_codes_hash ON public.subscription_codes(code_hash);
CREATE INDEX IF NOT EXISTS idx_subscription_codes_status ON public.subscription_codes(status);

-- 3. Code Redemptions Table
CREATE TABLE IF NOT EXISTS public.code_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code_id UUID NOT NULL REFERENCES public.subscription_codes(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_code_redemption UNIQUE (code_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_code_redemptions_user ON public.code_redemptions(user_id);

-- 4. Subscriptions Table (Source of truth for user entitlement)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'school', 'lifetime')),
    starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ends_at TIMESTAMPTZ,
    source_code_id UUID REFERENCES public.subscription_codes(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Rate Limiting Attempts Table (Mitigates brute-force guessing)
CREATE TABLE IF NOT EXISTS public.redeem_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    success BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_redeem_attempts_user_time ON public.redeem_attempts(user_id, attempted_at);

-- 6. Admin Audit Logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
