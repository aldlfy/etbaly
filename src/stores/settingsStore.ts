import { create } from 'zustand';

export type Theme = 'dark' | 'light';
export type DigitStyle = 'eastern' | 'western';
export type AppFont = 'cairo' | 'amiri' | 'tajawal' | 'noto';

interface SettingsState {
  theme: Theme;
  digitStyle: DigitStyle;
  baseFont: AppFont;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setDigitStyle: (style: DigitStyle) => void;
  toggleDigitStyle: () => void;
  setBaseFont: (font: AppFont) => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('examforge_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: getInitialTheme(),
  digitStyle: 'eastern',
  baseFont: 'cairo',

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('examforge_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme });
  },

  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  setDigitStyle: (digitStyle) => {
    set({ digitStyle });
  },

  toggleDigitStyle: () => {
    const next = get().digitStyle === 'eastern' ? 'western' : 'eastern';
    set({ digitStyle: next });
  },

  setBaseFont: (baseFont) => {
    set({ baseFont });
  },
}));
