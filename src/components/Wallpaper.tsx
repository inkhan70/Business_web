
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

interface WallpaperData {
  url: string;
}

export function Wallpaper() {
  const pathname = usePathname();
  const firestore = useFirestore();
  const docId = encodeURIComponent(pathname);
  const wallpaperDocRef = useMemoFirebase(() => doc(firestore, 'appearance', docId), [firestore, docId]);
  
  const { data: wallpaperData, isLoading } = useDoc<WallpaperData>(wallpaperDocRef);

  const [wallpaperUrl, setWallpaperUrl] = useState<string | null>(null);

  useEffect(() => {
    if (wallpaperData) {
      setWallpaperUrl(wallpaperData.url);
    } else {
      setWallpaperUrl(null);
    }
  }, [wallpaperData]);


  if (isLoading || !wallpaperUrl) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[-1] bg-cover bg-center transition-all duration-500"
      style={{ backgroundImage: `url(${wallpaperUrl})` }}
    />
  );
}
