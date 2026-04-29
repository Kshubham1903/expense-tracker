import { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { useAuth } from './useAuth.jsx';
import { db, expensesCollection, hasFirebaseConfig } from '../services/firebase';
import {
  CATEGORY_OPTIONS,
  buildExpenseStats,
  downloadExpensesCsv,
  parseExpenseDate,
} from '../utils/expenses';

export function useExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mutating, setMutating] = useState(false);

  useEffect(() => {
    if (!hasFirebaseConfig) {
      console.error('Firebase config missing: check .env.local');
      setExpenses([]);
      setLoading(false);
      setError('Firebase environment variables not configured.');
      return undefined;
    }

    if (!db) {
      console.error('Firestore db not initialized');
      setExpenses([]);
      setLoading(false);
      setError('Firestore database failed to initialize.');
      return undefined;
    }

    if (!user) {
      setExpenses([]);
      setLoading(false);
      setError('');
      return undefined;
    }

    setLoading(true);
    setError('');

    const expensesRef = expensesCollection(user.uid);
    const expensesQuery = query(expensesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      expensesQuery,
      (snapshot) => {
        const rows = snapshot.docs.map((currentDoc) => ({ id: currentDoc.id, ...currentDoc.data() }));
        setExpenses(rows);
        setLoading(false);
        console.log('✓ Synced', rows.length, 'expenses from Firestore');
      },
      (nextError) => {
        console.error('Firestore listener error:', nextError.code, nextError.message);
        setError('Failed to load expenses: ' + nextError.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const addExpense = async ({ description, amount, category, expenseDate }) => {
    if (!user) {
      throw new Error('You must be signed in to add expenses.');
    }

    const cleanDescription = String(description || '').trim();
    const cleanCategory = CATEGORY_OPTIONS.includes(category) ? category : 'Other';
    const numericAmount = Number(amount);

    if (cleanDescription.length < 2 || cleanDescription.length > 80) {
      throw new Error('Description must be between 2 and 80 characters.');
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw new Error('Amount must be a valid number greater than zero.');
    }

    if (!expenseDate || Number.isNaN(parseExpenseDate(expenseDate).getTime())) {
      throw new Error('Please choose a valid expense date.');
    }

    const selectedDate = parseExpenseDate(expenseDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (selectedDate > today) {
      throw new Error('Expense date cannot be in the future.');
    }

    setMutating(true);

    // Add 15-second timeout to prevent infinite "Saving..." state
    const timeoutHandle = setTimeout(() => {
      setMutating(false);
      console.error('❌ CRITICAL: Firestore write timed out after 15 seconds. Possible causes:');
      console.error('  1. Firestore security rules denying write');
      console.error('  2. Network disconnected');
      console.error('  3. Firebase project not accessible');
      console.error('  Expense NOT saved. Try again.');
    }, 15000);

    try {
      console.log('📤 Step 1: Starting Firestore write for user:', user.uid);
      console.log('📤 Step 2: Expense data:', { description: cleanDescription, amount: numericAmount, category: cleanCategory });
      
      const collectionRef = expensesCollection(user.uid);
      console.log('📤 Step 3: Collection ref created');
      
      console.log('📤 Step 4: About to call addDoc()...');
      const docRef = await addDoc(collectionRef, {
        uid: user.uid,
        description: cleanDescription,
        amount: Number(numericAmount.toFixed(2)),
        category: cleanCategory,
        expenseDate,
        createdAt: serverTimestamp(),
      });
      
      clearTimeout(timeoutHandle);
      console.log('✅ SUCCESS: Expense saved to Firestore:', docRef.id);
    } catch (err) {
      clearTimeout(timeoutHandle);
      console.error('❌ Failed to add expense:', {
        code: err.code,
        message: err.message,
        userID: user.uid,
        timestamp: new Date().toISOString(),
      });
      setMutating(false);
      throw new Error(`Failed to save expense: ${err.message}`);
    }
  };

  const removeExpense = async (expenseId) => {
    if (!user) {
      throw new Error('You must be signed in to delete expenses.');
    }

    await deleteDoc(doc(expensesCollection(user.uid), expenseId));
  };

  const exportCsv = (rows = expenses) => {
    downloadExpensesCsv(rows);
  };

  const stats = useMemo(() => buildExpenseStats(expenses), [expenses]);

  return {
    expenses,
    loading,
    error,
    mutating,
    stats,
    addExpense,
    removeExpense,
    exportCsv,
    setError,
  };
}
