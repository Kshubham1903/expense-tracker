import { useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot, query, runTransaction, serverTimestamp, where } from 'firebase/firestore';
import { useAuth } from './useAuth.jsx';
import { balancesCollection, db, hasFirebaseConfig, transactionsCollection } from '../services/firebase';
import { isAccountType, isTransactionMode, roundMoney, toTimestampFromDateInput } from '../utils/ledger';

const emptyBalanceMap = () => ({ bank: 0, upi: 0, cash: 0 });

export function useBalances() {
  const { user } = useAuth();
  const [balanceDocs, setBalanceDocs] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mutating, setMutating] = useState(false);

  useEffect(() => {
    if (!hasFirebaseConfig) {
      setBalanceDocs([]);
      setTransactions([]);
      setLoading(false);
      setError('Firebase environment variables not configured.');
      return undefined;
    }

    if (!db) {
      setBalanceDocs([]);
      setTransactions([]);
      setLoading(false);
      setError('Firestore database failed to initialize.');
      return undefined;
    }

    if (!user) {
      setBalanceDocs([]);
      setTransactions([]);
      setLoading(false);
      setError('');
      return undefined;
    }

    setLoading(true);
    setError('');

    const balancesQuery = query(balancesCollection(), where('uid', '==', user.uid));
    const transactionsQuery = query(transactionsCollection(), where('uid', '==', user.uid));

    let balancesReady = false;
    let transactionsReady = false;

    const markReady = (section) => {
      if (section === 'balances') {
        balancesReady = true;
      } else {
        transactionsReady = true;
      }

      if (balancesReady && transactionsReady) {
        setLoading(false);
      }
    };

    const unsubscribeBalances = onSnapshot(
      balancesQuery,
      (snapshot) => {
        setBalanceDocs(snapshot.docs.map((currentDoc) => ({ id: currentDoc.id, ...currentDoc.data() })));
        markReady('balances');
      },
      (nextError) => {
        setError(`Failed to load balances: ${nextError.message}`);
        setLoading(false);
      },
    );

    const unsubscribeTransactions = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        setTransactions(snapshot.docs.map((currentDoc) => ({ id: currentDoc.id, ...currentDoc.data() })));
        markReady('transactions');
      },
      (nextError) => {
        setError(`Failed to load transactions: ${nextError.message}`);
        setLoading(false);
      },
    );

    return () => {
      unsubscribeBalances();
      unsubscribeTransactions();
    };
  }, [user]);

  const balancesByType = useMemo(() => {
    const nextBalances = emptyBalanceMap();

    for (const docRow of balanceDocs) {
      if (isAccountType(docRow.type)) {
        nextBalances[docRow.type] = roundMoney(docRow.balance);
      }
    }

    return nextBalances;
  }, [balanceDocs]);

  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort((left, right) => {
        const leftTime = left.date?.toMillis ? left.date.toMillis() : 0;
        const rightTime = right.date?.toMillis ? right.date.toMillis() : 0;
        return rightTime - leftTime;
      }),
    [transactions],
  );

  const addTransaction = async ({ type, mode, amount, description, date }) => {
    if (!user) {
      throw new Error('You must be signed in to manage balances.');
    }

    if (!isAccountType(type)) {
      throw new Error('Please select a valid account.');
    }

    if (!isTransactionMode(mode)) {
      throw new Error('Please select credit or debit.');
    }

    const cleanDescription = String(description || '').trim();
    const numericAmount = Number(amount);

    if (cleanDescription.length < 2 || cleanDescription.length > 120) {
      throw new Error('Description must be between 2 and 120 characters.');
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw new Error('Amount must be greater than zero.');
    }

    if (!date || Number.isNaN(new Date(`${date}T00:00:00`).getTime())) {
      throw new Error('Please choose a valid date.');
    }

    setMutating(true);

    try {
      await runTransaction(db, async (transaction) => {
        const balanceRef = doc(balancesCollection(), `${user.uid}_${type}`);
        const transactionRef = doc(transactionsCollection());
        const balanceSnapshot = await transaction.get(balanceRef);
        const currentBalance = balanceSnapshot.exists() ? Number(balanceSnapshot.data().balance || 0) : 0;
        const delta = mode === 'credit' ? numericAmount : -numericAmount;
        const nextBalance = roundMoney(currentBalance + delta);

        if (nextBalance < 0) {
          throw new Error('This debit would create a negative balance.');
        }

        transaction.set(
          balanceRef,
          {
            uid: user.uid,
            type,
            balance: nextBalance,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );

        transaction.set(transactionRef, {
          uid: user.uid,
          type,
          mode,
          amount: roundMoney(numericAmount),
          description: cleanDescription,
          date: toTimestampFromDateInput(date),
          createdAt: serverTimestamp(),
        });
      });
    } finally {
      setMutating(false);
    }
  };

  return {
    balances: balancesByType,
    transactions: sortedTransactions,
    loading,
    error,
    mutating,
    setError,
    addTransaction,
  };
}