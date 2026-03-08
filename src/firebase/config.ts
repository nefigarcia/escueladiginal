
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Validates that the core Firebase configuration keys are present.
 * This helps catch missing .env variables early.
 */
export function validateConfig() {
  const missing = [];
  if (!firebaseConfig.apiKey) missing.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!firebaseConfig.projectId) missing.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!firebaseConfig.appId) missing.push('NEXT_PUBLIC_FIREBASE_APP_ID');
  
  if (missing.length > 0) {
    console.error('Missing Firebase configuration variables:', missing.join(', '));
    console.log('Ensure you have a .env file with NEXT_PUBLIC_FIREBASE_* variables and restart the dev server.');
    return false;
  }
  return true;
}
