
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Wallpaper() {
  const pathname = usePathname();
  const [wallpaperUrl, setWallpaperUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleStorageChange = () => {
      const key = `wallpaper_${pathname}`;
      const url = localStorage.getItem(key);
      setWallpaperUrl(url);
    };

    // Initial load
    handleStorageChange();

    // Listen for direct storage changes (e.g., from other tabs or our admin page)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname]); // Re-run effect if the page path changes


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
