
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore";
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    const fetchAndSetUserProfile = async (firebaseUser: User) => {
      setIsProfileLoading(true);
      
      // 1. Check localStorage first
      const storedUsersRaw = localStorage.getItem('users');
      if (storedUsersRaw) {
          const allUsers = JSON.parse(storedUsersRaw);
          const localProfile = allUsers.find((p: UserProfile) => p.uid === firebaseUser.uid);
          if (localProfile) {
              setUserProfile(localProfile);
              setIsProfileLoading(false);
              return;
          }
      }

      // 2. If not in localStorage, check Firestore (for old accounts)
      const userDocRef = doc(firestore, "users", firebaseUser.uid);
      try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            const firestoreProfile = docSnap.data() as UserProfile;
            
            // Save to localStorage for future sessions
            const storedUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
            storedUsers.push(firestoreProfile);
            localStorage.setItem('users', JSON.stringify(storedUsers));

            setUserProfile(firestoreProfile);
        } else {
            // This case should ideally not happen if signup is working correctly
            setUserProfile(null);
        }
      } catch (error) {
        console.error("Error fetching user profile from Firestore:", error);
        setUserProfile(null);
      } finally {
        setIsProfileLoading(false);
      }
    };

    if (user) {
      fetchAndSetUserProfile(user);
    } else {
      setUserProfile(null);
      setIsProfileLoading(false);
    }
  }, [user, firestore]);
  
  const loading = isUserLoading || isProfileLoading;

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
