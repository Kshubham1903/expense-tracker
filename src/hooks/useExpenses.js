import { useEffect, useMemo, useState } from 'react';
import {
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { useAuth } from './useAuth.jsx';
import { balancesCollection, db, expensesCollection, hasFirebaseConfig, transactionsCollection } from '../services/firebase';
import {
  CATEGORY_OPTIONS,
  buildExpenseStats,
  downloadExpensesCsv,
  parseExpenseDate,
} from '../utils/expenses';
import { isAccountType, roundMoney, toTimestampFromDateInput } from '../utils/ledger';

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
    const expensesQuery = query(expensesRef, where('uid', '==', user.uid));

    const unsubscribe = onSnapshot(
      expensesQuery,
      (snapshot) => {
        const rows = snapshot.docs
          .map((currentDoc) => ({ id: currentDoc.id, ...currentDoc.data() }))
          .sort((left, right) => {
            const leftTime = left.createdAt?.toMillis ? left.createdAt.toMillis() : 0;
            const rightTime = right.createdAt?.toMillis ? right.createdAt.toMillis() : 0;
            return rightTime - leftTime;
          });
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

  const addExpense = async ({ description, amount, category, expenseDate, paymentMode }) => {
    if (!user) {
      throw new Error('You must be signed in to add expenses.');
    }

    const cleanDescription = String(description || '').trim();
    const cleanCategory = CATEGORY_OPTIONS.includes(category) ? category : 'Other';
    const cleanPaymentMode = isAccountType(paymentMode) ? paymentMode : 'bank';
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
      console.log('📤 Step 2: Expense data:', {
        description: cleanDescription,
        amount: numericAmount,
        category: cleanCategory,
        paymentMode: cleanPaymentMode,
      });

      console.log('📤 Step 3: About to call Firestore transaction...');
      const docRef = await runTransaction(db, async (transaction) => {
        const expenseRef = doc(expensesCollection(user.uid));
        const balanceRef = doc(balancesCollection(), `${user.uid}_${cleanPaymentMode}`);
        const transactionRef = doc(transactionsCollection());
        const balanceSnapshot = await transaction.get(balanceRef);
        const currentBalance = balanceSnapshot.exists() ? Number(balanceSnapshot.data().balance || 0) : 0;
        const nextBalance = roundMoney(currentBalance - numericAmount);

        if (nextBalance < 0) {
          throw new Error('This expense would overdraw the selected account.');
        }

        transaction.set(
          balanceRef,
          {
            uid: user.uid,
            type: cleanPaymentMode,
            balance: nextBalance,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );

        transaction.set(expenseRef, {
          uid: user.uid,
          description: cleanDescription,
          amount: roundMoney(numericAmount),
          category: cleanCategory,
          expenseDate,
          paymentMode: cleanPaymentMode,
          transactionId: transactionRef.id,
          createdAt: serverTimestamp(),
        });

        transaction.set(transactionRef, {
          uid: user.uid,
          type: cleanPaymentMode,
          mode: 'debit',
          amount: roundMoney(numericAmount),
          description: cleanDescription,
          date: toTimestampFromDateInput(expenseDate),
          createdAt: serverTimestamp(),
        });

        return expenseRef;
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
      throw new Error(`Failed to save expense: ${err.message}`);
    } finally {
      setMutating(false);
    }
  };

  const removeExpense = async (expenseId) => {
    if (!user) {
      throw new Error('You must be signed in to delete expenses.');
    }

    await runTransaction(db, async (transaction) => {
      const expenseRef = doc(expensesCollection(user.uid), expenseId);
      const expenseSnapshot = await transaction.get(expenseRef);

      if (!expenseSnapshot.exists()) {
        throw new Error('Expense not found.');
      }

      const expense = expenseSnapshot.data();
      const paymentMode = isAccountType(expense.paymentMode) ? expense.paymentMode : 'bank';
      const numericAmount = roundMoney(expense.amount);
      const balanceRef = doc(balancesCollection(), `${user.uid}_${paymentMode}`);
      const balanceSnapshot = await transaction.get(balanceRef);
      const currentBalance = balanceSnapshot.exists() ? Number(balanceSnapshot.data().balance || 0) : 0;
      const nextBalance = roundMoney(currentBalance + numericAmount);

      transaction.set(
        balanceRef,
        {
          uid: user.uid,
          type: paymentMode,
          balance: nextBalance,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      if (expense.transactionId) {
        transaction.delete(doc(transactionsCollection(), expense.transactionId));
      }

      transaction.delete(expenseRef);
    });
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
