'use client';

import { useEffect } from 'react';

/**
 * GitHub Pages 的專案站台位於 /<repo>/ 之下。
 * 註冊 '/sw.js' 在該環境會 404，整個離線與推播功能都不會啟動。
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator)
    ) {
      return;
    }

    const isEnabled =
      process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PUBLIC_ENABLE_SW === 'true';

    if (!isEnabled) return;

    navigator.serviceWorker
      .register(`${BASE_PATH}/sw.js`, { scope: `${BASE_PATH}/` })
      .then((registration) => {
        console.log('[SW] Registered, scope:', registration.scope);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'activated' &&
              navigator.serviceWorker.controller
            ) {
              console.log('[SW] New version available — refresh to update.');
            }
          });
        });
      })
      .catch((error) => {
        console.error('[SW] Registration failed:', error);
      });
  }, []);

  return null;
}
