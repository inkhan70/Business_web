
"use client";

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-secondary">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-headline font-bold">business_web</h3>
            <p className="text-sm text-muted-foreground">{t('footer.tagline')}</p>
          </div>
          <div className="flex space-x-6 text-sm">
            <Link href="#" className="text-muted-foreground hover:text-foreground">{t('footer.about')}</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">{t('footer.contact')}</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">{t('footer.privacy')}</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">{t('footer.terms')}</Link>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-4 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} business_web. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
