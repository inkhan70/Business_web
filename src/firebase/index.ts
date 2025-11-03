
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Define a type for the return value of getSdks
interface FirebaseSdks {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase(): FirebaseSdks {
  if (getApps().length === 0) {
    let firebaseApp;
    try {
      // Important! First, try to initialize with the config object.
      // This is the standard path for most web apps.
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e) {
      // If that fails, it might be in an environment like App Hosting.
      if (process.env.NODE_ENV === "production") {
        console.warn('Initialization with config failed, trying automatic initialization.', e);
      }
      // Fallback to automatic initialization for special environments.
      // This requires backend setup that is not standard for all projects.
      firebaseApp = initializeApp();
    }
    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs from the existing app instance.
  return getSdks(getApp());
}


export function getSdks(firebaseApp: FirebaseApp): FirebaseSdks {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
