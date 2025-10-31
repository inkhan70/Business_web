
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    try {
      // Important! First, try to initialize with the config object.
      // This is the standard path for web apps.
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e) {
      // If that fails, it might be in an environment like App Hosting.
      // In production, we can warn if the primary method fails.
      if (process.env.NODE_ENV === "production") {
        console.warn('Initialization with config failed, trying automatic initialization.', e);
      }
      // Fallback to automatic initialization for environments like App Hosting.
      firebaseApp = initializeApp();
    }

    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}


export function getSdks(firebaseApp: FirebaseApp) {
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
