import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface PlatformInfo {
  isAndroid: boolean;
  isIOS: boolean;
  isDesktop: boolean;
  isInAppBrowser: boolean;
  inAppName?: string;
  browserName: string;
}

export function getPlatformInfo(): PlatformInfo {
  if (typeof window === 'undefined') {
    return {
      isAndroid: false,
      isIOS: false,
      isDesktop: true,
      isInAppBrowser: false,
      browserName: 'Desktop',
    };
  }

  const ua = window.navigator.userAgent.toLowerCase();

  // In-App browser detection
  const isWhatsApp = ua.includes('whatsapp');
  const isInstagram = ua.includes('instagram');
  const isFacebook = ua.includes('fbav') || ua.includes('fban') || ua.includes('fb_iab');
  const isTikTok = ua.includes('tiktok') || ua.includes('musical_ly');
  const isTelegram = ua.includes('telegram');
  const isLine = ua.includes('line');
  const isInAppBrowser = isWhatsApp || isInstagram || isFacebook || isTikTok || isTelegram || isLine;

  let inAppName: string | undefined;
  if (isWhatsApp) inAppName = 'WhatsApp';
  else if (isInstagram) inAppName = 'Instagram';
  else if (isFacebook) inAppName = 'Facebook';
  else if (isTikTok) inAppName = 'TikTok';
  else if (isTelegram) inAppName = 'Telegram';
  else if (isLine) inAppName = 'Line';

  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);
  const isDesktop = !isIOS && !isAndroid;

  let browserName = 'Navegador';
  if (ua.includes('samsungbrowser')) browserName = 'Samsung Internet';
  else if (ua.includes('edg/') || ua.includes('edge/')) browserName = 'Microsoft Edge';
  else if (ua.includes('chrome') && !ua.includes('edg')) browserName = 'Google Chrome';
  else if (ua.includes('safari') && !ua.includes('chrome')) browserName = 'Apple Safari';
  else if (ua.includes('firefox')) browserName = 'Mozilla Firefox';

  return {
    isAndroid,
    isIOS,
    isDesktop,
    isInAppBrowser,
    inAppName,
    browserName,
  };
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && (window as any).__pwaInstallPrompt) {
      return (window as any).__pwaInstallPrompt;
    }
    return null;
  });
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<PlatformInfo>(getPlatformInfo());

  useEffect(() => {
    setPlatform(getPlatformInfo());

    // Detect standalone mode (already installed or running as PWA)
    const isStandalone =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://'));
    setIsInstalled(isStandalone);

    if (typeof window !== 'undefined' && (window as any).__pwaInstallPrompt && !deferredPrompt) {
      setDeferredPrompt((window as any).__pwaInstallPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__pwaInstallPrompt = e;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      if (typeof window !== 'undefined') {
        (window as any).__pwaInstallPrompt = null;
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deferredPrompt]);

  const install = async () => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
    } catch (err) {
      console.warn('PWA install prompt error:', err);
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS: platform.isIOS,
    platform,
    install,
  };
}
