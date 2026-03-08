'use client';

import { firebaseConfig, validateConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

export function initializeFirebase() {
  // Validate config first to provide better error messages in dev
  const isValid = validateConfig();
  
  if (!getApps().length) {
    let firebaseApp: FirebaseApp;
    try {
      // Priority 1: Try automatic initialization (for App Hosting)
      firebaseApp = initializeApp();
      console.log('Firebase initialized automatically');
    } catch (e) {
      // Priority 2: Fallback to config object from .env
      if (isValid) {
        firebaseApp = initializeApp(firebaseConfig);
        console.log('Firebase initialized via config object');
      } else {
        console.warn('Firebase configuration is invalid. SDK services will not be available.');
        // Create a dummy app to prevent the SDK from crashing entirely
        firebaseApp = initializeApp({ apiKey: 'dummy', projectId: 'dummy', appId: 'dummy' });
      }
    }

    return getSdks(firebaseApp);
  }

  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  try {
    return {
      firebaseApp,
      auth: getAuth(firebaseApp),
      firestore: getFirestore(firebaseApp)
    };
  } catch (error) {
    console.error('Error getting Firebase SDKs:', error);
    return {
      firebaseApp,
      auth: null as any,
      firestore: null as any
    };
  }
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
