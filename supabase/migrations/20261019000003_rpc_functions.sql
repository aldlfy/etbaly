-- Migration: 20261019000003_rpc_functions.sql
-- Description: Postgres SECURITY DEFINER stored procedures for code redemption, entitlement, and admin management

-- 1. Helper to normalize activation codes: uppercase, alphanumeric only
CREATE OR REPLACE FUNCTION public.normalize_code(raw_code TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN UPPER(REGEXP_REPLACE(COALESCE(raw_code, ''), '[^A-Za-z0-9]', '', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Code Redemption RPC (Atomic, Rate-Limited, Duration-Stacking)
CREATE OR REPLACE FUNCTION public.redeem_code(p_code TEXT)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_normalized_code TEXT;
    v_hash TEXT;
    v_recent_failures INTEGER;
    v_code_record RECORD;
    v_existing_sub RECORD;
    v_new_ends_at TIMESTAMPTZ;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'المستخدم غير مسجل الدخول' USING ERRCODE = '42501';
    END IF;

    -- Normalize input
    v_normalized_code := public.normalize_code(p_code);
    IF LENGTH(v_normalized_code) < 8 THEN
        RAISE EXCEPTION 'صيغة رمز التفعيل غير صحيحة' USING ERRCODE = 'P0001';
    END IF;

    -- Rate limiting check: max 5 failed attempts in the last 60 minutes
    SELECT COUNT(*) INTO v_recent_failures
    FROM public.redeem_attempts
    WHERE user_id = v_user_id
      AND success = false
      AND attempted_at > (now() - interval '1 hour');

    IF v_recent_failures >= 5 THEN
        RAISE EXCEPTION 'تم تجاوز الحد المسموح من المحاولات الخاطئة. يرجى المحاولة بعد ساعة.' USING ERRCODE = 'P0002';
    END IF;

    -- Compute SHA-256 hash
    v_hash := encode(digest(v_normalized_code, 'sha256'), 'hex');

    -- Look up the code with row locking
    SELECT * INTO v_code_record
    FROM public.subscription_codes
    WHERE code_hash = v_hash
    FOR UPDATE;

    -- Generic failure check to prevent enumeration
    IF v_code_record.id IS NULL
       OR v_code_record.status <> 'active'
       OR v_code_record.uses_count >= v_code_record.max_uses
       OR (v_code_record.expires_at IS NOT NULL AND v_code_record.expires_at <= now())
    THEN
        INSERT INTO public.redeem_attempts (user_id, success)
        VALUES (v_user_id, false);
        RAISE EXCEPTION 'رمز التفعيل غير صالح أو منتهي الصلاحية' USING ERRCODE = 'P0001';
    END IF;

    -- Check if this user has already used this specific code
    IF EXISTS (
        SELECT 1 FROM public.code_redemptions
        WHERE code_id = v_code_record.id AND user_id = v_user_id
    ) THEN
        INSERT INTO public.redeem_attempts (user_id, success)
        VALUES (v_user_id, false);
        RAISE EXCEPTION 'تم استخدام هذا الرمز مسبقاً من قبل هذا الحساب' USING ERRCODE = 'P0003';
    END IF;

    -- Update code usage
    UPDATE public.subscription_codes
    SET uses_count = uses_count + 1,
        status = CASE WHEN uses_count + 1 >= max_uses THEN 'depleted' ELSE 'active' END
    WHERE id = v_code_record.id;

    -- Record redemption
    INSERT INTO public.code_redemptions (code_id, user_id)
    VALUES (v_code_record.id, v_user_id);

    -- Check current subscription to stack duration or start new
    SELECT * INTO v_existing_sub
    FROM public.subscriptions
    WHERE user_id = v_user_id;

    IF v_existing_sub.user_id IS NOT NULL AND v_existing_sub.ends_at IS NOT NULL AND v_existing_sub.ends_at > now() THEN
        -- Stack onto existing active subscription
        v_new_ends_at := v_existing_sub.ends_at + (v_code_record.duration_days || ' days')::interval;
    ELSE
        -- Start fresh subscription
        v_new_ends_at := now() + (v_code_record.duration_days || ' days')::interval;
    END IF;

    -- Upsert subscription
    INSERT INTO public.subscriptions (user_id, plan, starts_at, ends_at, source_code_id, updated_at)
    VALUES (v_user_id, v_code_record.plan, now(), v_new_ends_at, v_code_record.id, now())
    ON CONFLICT (user_id) DO UPDATE
    SET plan = EXCLUDED.plan,
        ends_at = EXCLUDED.ends_at,
        source_code_id = EXCLUDED.source_code_id,
        updated_at = now();

    -- Log successful attempt
    INSERT INTO public.redeem_attempts (user_id, success)
    VALUES (v_user_id, true);

    RETURN jsonb_build_object(
        'success', true,
        'plan', v_code_record.plan,
        'ends_at', v_new_ends_at,
        'duration_days_added', v_code_record.duration_days,
        'message', 'تم تفعيل الاشتراك بنجاح'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Entitlement Query RPC
CREATE OR REPLACE FUNCTION public.get_my_entitlement()
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_role TEXT := 'user';
    v_sub RECORD;
    v_is_active BOOLEAN := false;
    v_days_left INTEGER := 0;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'plan', 'free',
            'is_active', false,
            'role', 'user',
            'ends_at', null,
            'days_left', 0
        );
    END IF;

    -- Get user role
    SELECT COALESCE(role, 'user') INTO v_role
    FROM public.profiles
    WHERE id = v_user_id;

    -- If admin, automatically granted pro access with admin role
    IF v_role = 'admin' THEN
        RETURN jsonb_build_object(
            'plan', 'pro',
            'is_active', true,
            'role', 'admin',
            'ends_at', null,
            'days_left', 9999
        );
    END IF;

    -- Get subscription
    SELECT * INTO v_sub
    FROM public.subscriptions
    WHERE user_id = v_user_id;

    IF v_sub.user_id IS NOT NULL THEN
        IF v_sub.plan = 'lifetime' THEN
            v_is_active := true;
            v_days_left := 99999;
        ELSIF v_sub.ends_at IS NOT NULL AND v_sub.ends_at > now() THEN
            v_is_active := true;
            v_days_left := GREATEST(0, CEIL(EXTRACT(EPOCH FROM (v_sub.ends_at - now())) / 86400)::INTEGER);
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'plan', CASE WHEN v_is_active THEN v_sub.plan ELSE 'free' END,
        'is_active', v_is_active,
        'role', v_role,
        'ends_at', CASE WHEN v_is_active THEN v_sub.ends_at ELSE null END,
        'days_left', v_days_left
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 4. Admin Code Batch Generator
CREATE OR REPLACE FUNCTION public.admin_generate_codes(
    p_plan TEXT DEFAULT 'pro',
    p_duration_days INTEGER DEFAULT 30,
    p_count INTEGER DEFAULT 1,
    p_max_uses INTEGER DEFAULT 1,
    p_expires_at TIMESTAMPTZ DEFAULT NULL,
    p_note TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_admin_id UUID;
    v_alphabet TEXT := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    v_alpha_len INTEGER := 32;
    v_result JSONB := '[]'::JSONB;
    v_part1 TEXT;
    v_part2 TEXT;
    v_part3 TEXT;
    v_code TEXT;
    v_normalized TEXT;
    v_hash TEXT;
    v_prefix TEXT;
    i INTEGER;
    j INTEGER;
BEGIN
    v_admin_id := auth.uid();
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'صلاحيات المشرف مطلوبة لهذا الإجراء' USING ERRCODE = '42501';
    END IF;

    IF p_count < 1 OR p_count > 500 THEN
        RAISE EXCEPTION 'عدد الرموز يجب أن يكون بين 1 و 500' USING ERRCODE = 'P0001';
    END IF;

    FOR i IN 1..p_count LOOP
        -- Generate 3 segments of 4 chars
        v_part1 := '';
        FOR j IN 1..4 LOOP
            v_part1 := v_part1 || substr(v_alphabet, 1 + floor(random() * v_alpha_len)::int, 1);
        END LOOP;

        v_part2 := '';
        FOR j IN 1..4 LOOP
            v_part2 := v_part2 || substr(v_alphabet, 1 + floor(random() * v_alpha_len)::int, 1);
        END LOOP;

        v_part3 := '';
        FOR j IN 1..4 LOOP
            v_part3 := v_part3 || substr(v_alphabet, 1 + floor(random() * v_alpha_len)::int, 1);
        END LOOP;

        v_code := v_part1 || '-' || v_part2 || '-' || v_part3;
        v_normalized := v_part1 || v_part2 || v_part3;
        v_hash := encode(digest(v_normalized, 'sha256'), 'hex');
        v_prefix := v_part1 || '-****-****';

        INSERT INTO public.subscription_codes (
            code_hash,
            code_prefix,
            plan,
            duration_days,
            max_uses,
            expires_at,
            note,
            created_by
        ) VALUES (
            v_hash,
            v_prefix,
            p_plan,
            p_duration_days,
            p_max_uses,
            p_expires_at,
            p_note,
            v_admin_id
        );

        v_result := v_result || jsonb_build_object(
            'code', v_code,
            'prefix', v_prefix,
            'plan', p_plan,
            'duration_days', p_duration_days,
            'max_uses', p_max_uses
        );
    END LOOP;

    -- Audit log
    INSERT INTO public.admin_audit_logs (admin_id, action, details)
    VALUES (
        v_admin_id,
        'GENERATE_CODES',
        jsonb_build_object('count', p_count, 'plan', p_plan, 'duration_days', p_duration_days, 'note', p_note)
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Admin Revoke Code
CREATE OR REPLACE FUNCTION public.admin_revoke_code(p_code_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'صلاحيات المشرف مطلوبة لهذا الإجراء' USING ERRCODE = '42501';
    END IF;

    UPDATE public.subscription_codes
    SET status = 'revoked'
    WHERE id = p_code_id;

    INSERT INTO public.admin_audit_logs (admin_id, action, details)
    VALUES (auth.uid(), 'REVOKE_CODE', jsonb_build_object('code_id', p_code_id));

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Admin Statistics Summary
CREATE OR REPLACE FUNCTION public.admin_stats()
RETURNS JSONB AS $$
DECLARE
    v_total_users INTEGER := 0;
    v_active_subs INTEGER := 0;
    v_total_codes INTEGER := 0;
    v_active_codes INTEGER := 0;
    v_redeemed_count INTEGER := 0;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'صلاحيات المشرف مطلوبة لهذا الإجراء' USING ERRCODE = '42501';
    END IF;

    SELECT COUNT(*) INTO v_total_users FROM public.profiles;
    SELECT COUNT(*) INTO v_active_subs FROM public.subscriptions WHERE ends_at > now() OR plan = 'lifetime';
    SELECT COUNT(*) INTO v_total_codes FROM public.subscription_codes;
    SELECT COUNT(*) INTO v_active_codes FROM public.subscription_codes WHERE status = 'active';
    SELECT COUNT(*) INTO v_redeemed_count FROM public.code_redemptions;

    RETURN jsonb_build_object(
        'total_users', v_total_users,
        'active_subscriptions', v_active_subs,
        'total_codes_issued', v_total_codes,
        'active_codes', v_active_codes,
        'total_redemptions', v_redeemed_count
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
