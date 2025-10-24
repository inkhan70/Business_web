"use client";

import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { FirebaseClientProvider } from '@/firebase';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <FirebaseClientProvider>
            <AuthProvider>
              <LanguageProvider>
                <CartProvider>
                  {children}
                </CartProvider>
              </LanguageProvider>
            </AuthProvider>
        </FirebaseClientProvider>
    );
}
