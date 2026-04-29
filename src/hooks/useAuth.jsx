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
import { setDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, enableLocalPersistence, hasFirebaseConfig, db } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profileName, setProfileName] = useState('');
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

      unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
        try {
          if (nextUser && db && hasFirebaseConfig) {
            try {
              const userDoc = await getDoc(doc(db, 'users', nextUser.uid));
              const nameFromDb = userDoc.exists() ? userDoc.data().name : '';
              setProfileName(nameFromDb || '');
            } catch (err) {
              console.error('Failed to fetch user profile name:', err);
              setProfileName('');
            }
          } else {
            setProfileName('');
          }
        } finally {
          setUser(nextUser);
          setLoading(false);
        }
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
    
    try {
      // Step 1: Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const u = userCredential.user;

      // Step 2: Verify user exists in Firestore
      if (!db) {
        throw new Error('Firestore not initialized.');
      }

      const userDocRef = doc(db, 'users', u.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      // STRICT RULE: User must exist in Firestore to login
      if (!userDocSnapshot.exists()) {
        console.warn(`❌ Login blocked: User not registered: ${u.email}`);
        await signOut(auth);
        throw new Error('Account not registered. Please sign up first.');
      }

      console.log(`✅ Login allowed: User found in Firestore: ${u.email}`);
      
      // Load profile name for UI
      try {
        const nameFromDb = userDocSnapshot.data().name || '';
        setProfileName(nameFromDb);
      } catch (err) {
        console.warn('Could not read profile name:', err);
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      throw err;
    }
  };

  const signUp = async (email, password) => {
    if (!auth) {
      throw new Error('Firebase is not configured.');
    }

    setError('');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const u = userCredential.user;

      // CREATE user document in Firestore on successful signup
      if (db && u) {
        try {
          await setDoc(doc(db, 'users', u.uid), {
            uid: u.uid,
            name: u.displayName || email.split('@')[0],
            email: u.email || '',
            createdAt: serverTimestamp(),
          });
          console.log(`✅ User registered: ${u.email}`);
        } catch (writeErr) {
          console.error('Failed to create user profile:', writeErr);
          throw new Error('Account created but registration incomplete. Please try again.');
        }
      }
    } catch (err) {
      console.error('Sign-up error:', err);
      throw err;
    }
  };

  const googleSignUp = async () => {
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

      if (!db) {
        throw new Error('Firestore not initialized.');
      }

      const userDocRef = doc(db, 'users', u.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      // If user already exists, just allow signup (they're already registered)
      if (userDocSnapshot.exists()) {
        console.log(`✅ Google signup: User already registered: ${u.email}`);
        try {
          const nameFromDb = userDocSnapshot.data().name || '';
          setProfileName(nameFromDb);
        } catch (err) {
          console.warn('Could not read profile name:', err);
        }
        return result.user;
      }

      // New user → create Firestore record
      console.log(`📝 Google signup: Creating new user: ${u.email}`);
      try {
        await setDoc(userDocRef, {
          uid: u.uid,
          name: u.displayName || u.email.split('@')[0],
          email: u.email || '',
          createdAt: serverTimestamp(),
        });
        console.log(`✅ Google user registered: ${u.email}`);
        setProfileName(u.displayName || u.email.split('@')[0]);
      } catch (writeErr) {
        console.error('Failed to create Google user profile:', writeErr);
        await signOut(auth);
        throw new Error('Failed to register user. Please try again.');
      }

      return result.user;
    } catch (err) {
      console.error('Google sign-up error:', err);
      setError(err.message || 'Google sign-up failed.');
      throw err;
    } finally {
      setGoogleLoading(false);
    }
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

      if (!db) {
        throw new Error('Firestore not initialized.');
      }

      const userDocRef = doc(db, 'users', u.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      // STRICT RULE: User must exist in Firestore to login
      if (!userDocSnapshot.exists()) {
        console.warn(`❌ Google login blocked: User not registered: ${u.email}`);
        await signOut(auth);
        throw new Error('Account not registered. Please sign up with Google first.');
      }

      // User is registered, allow login
      console.log(`✅ Google login allowed for existing user: ${u.email}`);
      
      try {
        const nameFromDb = userDocSnapshot.data().name || '';
        setProfileName(nameFromDb);
      } catch (err) {
        console.warn('Could not read profile name:', err);
      }

      return result.user;
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Google sign-in failed.');
      throw err;
    } finally {
      setGoogleLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      // Prefer auth displayName, then Firestore profileName, then email
      displayName: (user && user.displayName) || profileName || (user && user.email) || '',
      loading,
      error,
      setError,
      signIn,
      signUp,
      googleSignIn,
      googleSignUp,
      googleLoading,
      logout,
      sendResetLink,
      firebaseReady: hasFirebaseConfig,
    }),
    [user, loading, error, googleLoading, profileName],
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
