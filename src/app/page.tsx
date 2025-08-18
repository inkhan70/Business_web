
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdBanner } from '@/components/AdBanner';
import { Wallpaper } from '@/components/Wallpaper';
import { WallpaperManager } from '@/components/WallpaperManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/businesses?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <Wallpaper />
      <AdBanner />
      <div className="flex flex-col">
        <section className="relative container mx-auto px-4 py-20 md:py-32">
          <WallpaperManager />
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col items-start text-left">
              <h1 className="text-4xl md:text-6xl font-extrabold font-headline leading-tight tracking-tighter text-primary">
                {t('home.title')}
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground my-8">
                {t('home.description')}
              </p>
              
              <form onSubmit={handleSearch} className="w-full max-w-md mb-8">
                <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                   <Input 
                      type="search"
                      placeholder={t('header.search_placeholder')}
                      className="pl-10 text-base py-6 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                   />
                   <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
                    Search
                   </Button>
                </div>
              </form>

              <p className="max-w-xl text-sm text-muted-foreground mb-8">
                {t('home.sub_description_1')}{' '}
                <Link href="/signup" className="text-primary underline hover:opacity-80">
                  {t('home.sign_up')}
                </Link>{' '}
                {t('home.sub_description_2')}, {t('home.or')}{' '}
                <Link href="/signin" className="text-primary underline hover:opacity-80">
                  {t('home.sign_in')}
                </Link>{' '}
                {t('home.sub_description_3')}.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Button size="lg" asChild variant="shine">
                  <Link href="/categories">
                    {t('home.explore_categories')} <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                 <Button size="lg" variant="secondary" asChild>
                  <Link href="/signup">
                    {t('home.get_started')}
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <Image 
                src="https://placehold.co/600x400.png"
                alt="City illustration with shops and people"
                width={600}
                height={400}
                className="rounded-xl shadow-2xl"
                data-ai-hint="city shops"
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
