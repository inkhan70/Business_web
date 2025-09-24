
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch user profile from localStorage
        const storedUsersRaw = localStorage.getItem('users');
        if (storedUsersRaw) {
          const storedUsers = JSON.parse(storedUsersRaw);
          const profile = storedUsers.find((p: UserProfile) => p.uid === user.uid);
          if (profile) {
            setUserProfile(profile);
          } else {
            console.log("No such user profile in localStorage!");
            setUserProfile(null);
          }
        } else {
            setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
