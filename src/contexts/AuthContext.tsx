"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { doc } from "firebase/firestore";
import { useUser, useFirestore, useAuth } from '@/firebase';

export interface UserProfile {
    uid: string;
    email: string;
    businessName: string;
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    if (user && firestore) {
      setProfileLoading(true);
      const userDocRef = doc(firestore, "users", user.uid);
      
      // Using a local onSnapshot listener for the profile
      const unsubscribe = require('firebase/firestore').onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          setUserProfile(null);
        }
        setProfileLoading(false);
      }, (error) => {
        console.error("Error fetching user profile:", error);
        setUserProfile(null);
        setProfileLoading(false);
      });

      return () => unsubscribe();
    } else {
      setUserProfile(null);
      setProfileLoading(false);
    }
  }, [user, firestore]);
  
  const loading = isUserLoading || profileLoading;

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
