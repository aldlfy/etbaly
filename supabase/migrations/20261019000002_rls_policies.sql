-- Migration: 20261019000002_rls_policies.sql
-- Description: Deny-by-default Row Level Security (RLS) policies for all ExamForge tables

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redeem_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.profiles;
CREATE POLICY "Users can view own profile or admins view all"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own name" ON public.profiles;
CREATE POLICY "Users can update own name"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- 2. Subscription Codes Policies (Admin only; regular users CANNOT read or write)
DROP POLICY IF EXISTS "Admins can view subscription codes" ON public.subscription_codes;
CREATE POLICY "Admins can view subscription codes"
    ON public.subscription_codes FOR SELECT
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert subscription codes" ON public.subscription_codes;
CREATE POLICY "Admins can insert subscription codes"
    ON public.subscription_codes FOR INSERT
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update subscription codes" ON public.subscription_codes;
CREATE POLICY "Admins can update subscription codes"
    ON public.subscription_codes FOR UPDATE
    USING (public.is_admin());

-- 3. Code Redemptions Policies
DROP POLICY IF EXISTS "Users can view own redemptions or admins view all" ON public.code_redemptions;
CREATE POLICY "Users can view own redemptions or admins view all"
    ON public.code_redemptions FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

-- 4. Subscriptions Policies
DROP POLICY IF EXISTS "Users can view own subscription or admins view all" ON public.subscriptions;
CREATE POLICY "Users can view own subscription or admins view all"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

-- 5. Redeem Attempts Policies (Admins only for audit; direct writes blocked)
DROP POLICY IF EXISTS "Admins can view redeem attempts" ON public.redeem_attempts;
CREATE POLICY "Admins can view redeem attempts"
    ON public.redeem_attempts FOR SELECT
    USING (public.is_admin());

-- 6. Admin Audit Logs Policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs"
    ON public.admin_audit_logs FOR SELECT
    USING (public.is_admin());
