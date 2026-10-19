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

interface AuthState {
  user: User | null;
  role: 'user' | 'admin';
  entitlement: UserEntitlement;
  isLoading: boolean;
  initAuth: () => Promise<void>;
  fetchEntitlement: () => Promise<void>;
  redeemCode: (code: string) => Promise<{ success: boolean; message: string }>;
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

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, role: 'user', entitlement: defaultEntitlement });
  },
}));
