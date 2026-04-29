import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, enableLocalPersistence, hasFirebaseConfig, db } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let unsubscribe = () => {};

    if (!auth || !hasFirebaseConfig) {
      setError('Add Firebase environment variables to enable sign-in and cloud sync.');
      setLoading(false);
      return unsubscribe;
    }

    const initAuth = async () => {
      await enableLocalPersistence();

      unsubscribe = onAuthStateChanged(auth, (nextUser) => {
        setUser(nextUser);
        setLoading(false);
      });
    };

    initAuth();

    return () => unsubscribe();
  }, []);


  const signIn = async (email, password) => {
    if (!auth) {
      throw new Error('Firebase is not configured.');
    }

    setError('');
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const signUp = async (email, password) => {
    if (!auth) {
      throw new Error('Firebase is not configured.');
    }

    setError('');
    await createUserWithEmailAndPassword(auth, email.trim(), password);
  };

  const sendResetLink = async (email) => {
    if (!auth) {
      throw new Error('Firebase is not configured.');
    }

    await sendPasswordResetEmail(auth, email.trim());
  };

  const logout = async () => {
    if (!auth) {
      return;
    }

    await signOut(auth);
  };

  const [googleLoading, setGoogleLoading] = useState(false);

  const googleSignIn = async () => {
    if (!auth || !hasFirebaseConfig) {
      throw new Error('Firebase is not configured.');
    }

    setError('');
    setGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(auth, provider);
      const u = result.user;

      if (db && u) {
        try {
          await setDoc(doc(db, 'users', u.uid), { uid: u.uid, name: u.displayName || '', email: u.email || '' }, { merge: true });
        } catch (writeErr) {
          // non-fatal: profile write failed, but user is still signed in
          console.error('Failed to write user profile:', writeErr);
        }
      }

      return result.user;
    } catch (err) {
      console.error('Google sign-in error', err);
      setError('Login failed, please try again.');
      throw err;
    } finally {
      setGoogleLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      setError,
      signIn,
      signUp,
      googleSignIn,
      googleLoading,
      logout,
      sendResetLink,
      firebaseReady: hasFirebaseConfig,
    }),
    [user, loading, error, googleLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}
