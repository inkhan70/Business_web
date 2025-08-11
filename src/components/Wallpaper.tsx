
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Wallpaper() {
  const pathname = usePathname();
  const [wallpaperUrl, setWallpaperUrl] = useState<string | null>(null);

  useEffect(() => {
    // Only run this component in production to avoid dev server loops
    if (process.env.NODE_ENV !== 'production') {
        return;
    }

    const handleStorageChange = () => {
      const key = `wallpaper_${pathname}`;
      const url = localStorage.getItem(key);
      setWallpaperUrl(url);
    };

    // Initial load
    handleStorageChange();

    // Listen for our custom event
    window.addEventListener('wallpaperChange', handleStorageChange);
    // Also listen for direct storage changes (e.g., from other tabs)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('wallpaperChange', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname]); // Re-run effect if the page path changes

  // Override localStorage methods to dispatch a custom event
  useEffect(() => {
    // Only run this component in production
    if (process.env.NODE_ENV !== 'production') {
        return;
    }
      
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      const isWallpaperKey = key.startsWith('wallpaper_');
      originalSetItem.apply(this, [key, value]);
      if (isWallpaperKey) {
        window.dispatchEvent(new Event('wallpaperChange'));
      }
    };

    const originalRemoveItem = localStorage.removeItem;
    localStorage.removeItem = function(key) {
        const isWallpaperKey = key.startsWith('wallpaper_');
        originalRemoveItem.apply(this, [key]);
        if (isWallpaperKey) {
            window.dispatchEvent(new Event('wallpaperChange'));
        }
    }
    
    return () => {
      // Restore original functions on cleanup
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
    };
  }, []);

  if (!wallpaperUrl || process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[-1] bg-cover bg-center"
      style={{ backgroundImage: `url(${wallpaperUrl})` }}
    />
  );
}
