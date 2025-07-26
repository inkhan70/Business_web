
'use client';

import { useEffect, useState } from 'react';

export function Wallpaper() {
  const [wallpaperUrl, setWallpaperUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleStorageChange = () => {
      const url = localStorage.getItem('app_wallpaper');
      setWallpaperUrl(url);
    };

    // Initial load
    handleStorageChange();

    // Listen for changes from other tabs
    window.addEventListener('storage', handleStorageChange);

    // Custom event to handle changes in the same tab
    window.addEventListener('wallpaperChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('wallpaperChange', handleStorageChange);
    };
  }, []);

  if (!wallpaperUrl) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[-1] bg-cover bg-center"
      style={{ backgroundImage: `url(${wallpaperUrl})` }}
    />
  );
}

// Override localStorage.setItem to dispatch an event
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  originalSetItem.apply(this, [key, value]);
  if (key === 'app_wallpaper') {
    window.dispatchEvent(new Event('wallpaperChange'));
  }
};
// Override localStorage.removeItem to dispatch an event
const originalRemoveItem = localStorage.removeItem;
localStorage.removeItem = function(key) {
    originalRemoveItem.apply(this, [key]);
    if (key === 'app_wallpaper') {
        window.dispatchEvent(new Event('wallpaperChange'));
    }
}
