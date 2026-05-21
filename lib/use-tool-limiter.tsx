'use client';

import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/lib/i18n';

const DONATION_SEED = 42;
const DONATION_KEY = 'global-donation-count';

function getDailyKey(toolKey: string): string {
  return `${toolKey}-${new Date().toISOString().slice(0, 10)}`;
}

export function getDailyCount(toolKey: string): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(getDailyKey(toolKey)) || '0');
}

export function incrementDailyCount(toolKey: string): number {
  const key = getDailyKey(toolKey);
  const n = parseInt(localStorage.getItem(key) || '0') + 1;
  localStorage.setItem(key, String(n));
  return n;
}

export function resetDailyCount(toolKey: string): void {
  localStorage.setItem(getDailyKey(toolKey), '0');
}

function getDonationCount(): number {
  if (typeof window === 'undefined') return DONATION_SEED;
  const v = localStorage.getItem(DONATION_KEY);
  return v ? parseInt(v) : DONATION_SEED;
}

function incrementDonationCount(): number {
  const n = getDonationCount() + 1;
  localStorage.setItem(DONATION_KEY, String(n));
  return n;
}

interface ToolLimiterOptions {
  toolKey: string;
  freeLimit?: number;
}

export function useToolLimiter({ toolKey, freeLimit = 5 }: ToolLimiterOptions) {
  const { t } = useI18n();
  const [showPaywall, setShowPaywall] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const [donationCount, setDonationCount] = useState(DONATION_SEED);

  useEffect(() => {
    setDailyCount(getDailyCount(toolKey));
    setDonationCount(getDonationCount());
  }, [toolKey]);

  const checkLimit = useCallback((): boolean => {
    if (getDailyCount(toolKey) >= freeLimit) {
      setShowPaywall(true);
      return false;
    }
    return true;
  }, [toolKey, freeLimit]);

  const markUsed = useCallback(() => {
    const n = incrementDailyCount(toolKey);
    setDailyCount(n);
    return n;
  }, [toolKey]);

  const handleDonate = useCallback(() => {
    resetDailyCount(toolKey);
    setDailyCount(0);
    setShowPaywall(false);
    incrementDonationCount();
    setDonationCount(getDonationCount());
  }, [toolKey]);

  return {
    showPaywall,
    setShowPaywall,
    dailyCount,
    donationCount,
    freeLimit,
    checkLimit,
    markUsed,
    handleDonate,
    toolKey,
    t,
  };
}

export function PaywallModal({ limiter }: { limiter: ReturnType<typeof useToolLimiter> }) {
  const { showPaywall, setShowPaywall, freeLimit, donationCount, handleDonate, t, toolKey } = limiter;

  if (!showPaywall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowPaywall(false)}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 text-center space-y-4" onClick={e => e.stopPropagation()}>
        <div className="text-5xl">😅</div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('paywall.title')}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('paywall.desc').replace('{limit}', String(freeLimit))}
        </p>

        <div className="mx-auto w-64 h-64 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600">
          <img src="/qr-donate.jpg" alt="donate QR" className="w-full h-full object-contain" />
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500">
          {t('paywall.tip')}
        </p>

        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
          {t('paywall.count').replace('{n}', String(donationCount))}
        </p>

        <button
          onClick={handleDonate}
          className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {t('paywall.btn')}
        </button>
      </div>
    </div>
  );
}
