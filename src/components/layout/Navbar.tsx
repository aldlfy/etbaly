import { useTranslation } from 'react-i18next';
import { Moon, Sun, Globe, Wifi, WifiOff, Sparkles, Hash } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { useDirection } from '@/hooks/useDirection';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface NavbarProps {
  onOpenAccountModal?: () => void;
}

export function Navbar({ onOpenAccountModal }: NavbarProps = {}) {
  const { t } = useTranslation();
  const { theme, toggleTheme, digitStyle, toggleDigitStyle } = useSettingsStore();
  const { isOnline } = useOfflineStatus();
  const { toggleLanguage, isRtl } = useDirection();
  const { entitlement } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                ExamForge
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-800/40 font-semibold">
                اطبعلي
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t('app.subtitle')}
            </p>
          </div>
        </div>

        {/* Global Controls & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Online/Offline Status Indicator */}
          <div className="hidden sm:flex items-center">
            {isOnline ? (
              <Badge variant="success" className="gap-1 font-medium">
                <Wifi className="w-3.5 h-3.5" />
                <span>{t('common.online')}</span>
              </Badge>
            ) : (
              <Badge variant="warning" className="gap-1 font-medium animate-pulse">
                <WifiOff className="w-3.5 h-3.5" />
                <span>{t('common.offline')}</span>
              </Badge>
            )}
          </div>

          {/* Subscription Tier Badge */}
          <div className="hidden md:flex items-center">
            <button
              type="button"
              onClick={onOpenAccountModal}
              title="إدارة الحساب والاشتراك"
              className="cursor-pointer transition-transform hover:scale-105"
            >
              <Badge
                variant={entitlement.isActive ? 'primary' : 'neutral'}
                className="gap-1 font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {entitlement.isActive
                    ? t(`subscription.${entitlement.plan}`)
                    : t('subscription.free')}
                </span>
              </Badge>
            </button>
          </div>

          {/* Digit Style Switcher (١٢٣ / 123) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDigitStyle}
            title={digitStyle === 'eastern' ? t('common.easternDigits') : t('common.westernDigits')}
            className="text-xs font-bold px-2.5 py-1.5"
          >
            <Hash className="w-4 h-4 me-1 opacity-70" />
            <span>{digitStyle === 'eastern' ? '١٢٣' : '123'}</span>
          </Button>

          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            title={t('common.language')}
            className="text-xs font-medium px-2.5 py-1.5"
          >
            <Globe className="w-4 h-4 me-1 opacity-70" />
            <span>{isRtl ? 'EN' : 'عربي'}</span>
          </Button>

          {/* Dark/Light Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            title={theme === 'dark' ? t('common.lightTheme') : t('common.darkTheme')}
            className="p-2"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
