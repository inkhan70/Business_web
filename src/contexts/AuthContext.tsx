"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc } from "firebase/firestore";
import { auth } from '@/lib/firebase';
import { useDoc, useFirestore } from '@/firebase';

export interface UserProfile {
    uid: string;
    email: string;
    businessName: string;
    role: string;
    category: string;
    address: string;
    city: string;
    state: string;
    createdAt: Date;
    isAdmin?: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const firestore = useFirestore();

  const userDocRef = user ? doc(firestore, "users", user.uid) : null;
  const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loading = authLoading || (user ? profileLoading : false);

  return (
    <AuthContext.Provider value={{ user, userProfile: userProfile || null, loading }}>
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
