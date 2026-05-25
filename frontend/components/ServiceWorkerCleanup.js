'use client';

import { useEffect } from 'react';

/** Stale service workers can serve HTML for RSC chunks and cause enqueueModel errors. */
export default function ServiceWorkerCleanup() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(reg => reg.unregister());
    });
  }, []);

  return null;
}
