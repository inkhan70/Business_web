
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { doc } from "firebase/firestore";
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';

export interface UserProfile {
    uid: string;
    email: string;
    businessName: string;
    fullName?: string;
    role: string;
    category: string;
    address: string;
    city: string;
    state: string;
    createdAt: string; // Keep as string to match what's in Firestore
    isAdmin?: boolean;
    purchaseHistory?: string[];
    ghostCoins?: number;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "users", user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (profileError) {
      console.error("Error fetching user profile:", profileError);
    }
  }, [profileError]);
  
  const loading = isUserLoading || (user && isProfileLoading);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
