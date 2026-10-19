import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface UserEntitlement {
  plan: 'free' | 'pro' | 'school' | 'lifetime';
  isActive: boolean;
  role: 'user' | 'admin';
  endsAt: string | null;
  daysLeft: number;
}

interface GeneratedCodeItem {
  code: string;
  code_prefix: string;
  plan: string;
  duration_days: number;
  note?: string;
}

export interface AdminStats {
  total_users: number;
  total_codes: number;
  active_codes: number;
  total_redemptions: number;
  active_subscriptions: number;
}

interface AuthState {
  user: User | null;
  role: 'user' | 'admin';
  entitlement: UserEntitlement;
  isLoading: boolean;
  initAuth: () => Promise<void>;
  fetchEntitlement: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  redeemCode: (code: string) => Promise<{ success: boolean; message: string }>;
  adminGenerateCodes: (
    plan: string,
    durationDays: number,
    count: number,
    note?: string
  ) => Promise<{ success: boolean; codes?: GeneratedCodeItem[]; error?: string }>;
  adminRevokeCode: (codePrefix: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  adminGetStats: () => Promise<{ success: boolean; stats?: AdminStats; error?: string }>;
  signOut: () => Promise<void>;
}

const defaultEntitlement: UserEntitlement = {
  plan: 'free',
  isActive: false,
  role: 'user',
  endsAt: null,
  daysLeft: 0,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: 'user',
  entitlement: defaultEntitlement,
  isLoading: true,

  initAuth: async () => {
    try {
      set({ isLoading: true });
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        set({ user: session.user });
        await get().fetchEntitlement();
      } else {
        set({ user: null, entitlement: defaultEntitlement });
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          set({ user: session.user });
          await get().fetchEntitlement();
        } else {
          set({ user: null, entitlement: defaultEntitlement });
        }
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchEntitlement: async () => {
    try {
      const { data, error } = await supabase.rpc('get_my_entitlement');
      if (error) {
        console.warn('Could not fetch entitlement:', error.message);
        return;
      }
      if (data) {
        set({
          role: data.role || 'user',
          entitlement: {
            plan: data.plan || 'free',
            isActive: Boolean(data.is_active),
            role: data.role || 'user',
            endsAt: data.ends_at || null,
            daysLeft: data.days_left || 0,
          },
        });
      }
    } catch (err) {
      console.warn('Network error checking entitlement:', err);
    }
  },

  redeemCode: async (code: string) => {
    try {
      const { data, error } = await supabase.rpc('redeem_code', { p_code: code });
      if (error) {
        return { success: false, message: error.message };
      }
      // Re-verify entitlement after successful redemption
      await get().fetchEntitlement();
      return { success: true, message: data?.message || 'تم التفعيل بنجاح' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء محاولة التفعيل';
      return { success: false, message: msg };
    }
  },

  signInWithEmail: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      set({ user: data.user });
      await get().fetchEntitlement();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'فشل تسجيل الدخول' };
    }
  },

  signUpWithEmail: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { success: false, error: error.message };
      set({ user: data.user });
      await get().fetchEntitlement();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'فشل إنشاء الحساب' };
    }
  },

  adminGenerateCodes: async (plan, durationDays, count, note) => {
    try {
      const { data, error } = await supabase.rpc('admin_generate_codes', {
        p_plan: plan,
        p_duration_days: durationDays,
        p_count: count,
        p_note: note,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, codes: data as GeneratedCodeItem[] };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'فشل توليد الرموز' };
    }
  },

  adminRevokeCode: async (codePrefix, reason) => {
    try {
      const { error } = await supabase.rpc('admin_revoke_code', {
        p_code_prefix: codePrefix,
        p_reason: reason,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'فشل إبطال الرمز' };
    }
  },

  adminGetStats: async () => {
    try {
      const { data, error } = await supabase.rpc('admin_stats');
      if (error) return { success: false, error: error.message };
      return { success: true, stats: data as AdminStats };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'فشل جلب الإحصائيات' };
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, role: 'user', entitlement: defaultEntitlement });
  },
}));
