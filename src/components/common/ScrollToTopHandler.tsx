'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

export function ScrollToTopHandler() {
  const pathname = usePathname();

  React.useEffect(() => {
    // 1. Disable browser's native scroll restoration on refresh/reload
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // 2. Immediately scroll to top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Overcome any delayed scroll restoration by browser engines
    const r1 = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
    const t1 = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 0);
    const t2 = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 50);

    // 3. Reset scroll position on beforeunload and pageshow
    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
    };

    const handlePageShow = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('load', handlePageShow);

    return () => {
      cancelAnimationFrame(r1);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('load', handlePageShow);
    };
  }, []);

  // Scroll to top on route / page transitions
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
