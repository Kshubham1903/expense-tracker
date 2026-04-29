import { initializeApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth';
import { collection, getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
};

export const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);

export const app = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

export async function enableLocalPersistence() {
  if (!auth) {
    return;
  }

  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log('Auth persistence enabled');
  } catch (err) {
    console.warn('Auth persistence failed (may be normal in incognito):', err.code);
  }

  if (db) {
    try {
      await enableIndexedDbPersistence(db);
      console.log('Firestore offline persistence enabled');
    } catch (err) {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open; offline persistence disabled');
      } else if (err.code !== 'already-enabled') {
        console.warn('Firestore persistence not available:', err.code);
      }
    }
  }
}

export function expensesCollection(userId) {
  if (!db) {
    throw new Error('Firebase is not configured.');
  }

  return collection(db, 'users', userId, 'expenses');
}
