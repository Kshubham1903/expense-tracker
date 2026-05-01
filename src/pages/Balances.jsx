import { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, PlusCircle, Trash2 } from 'lucide-react';
import { useBalances } from '../hooks/useBalances';
import { ACCOUNT_OPTIONS, TRANSACTION_MODE_OPTIONS, getAccountLabel, getTransactionModeLabel } from '../utils/ledger';
import { formatDate, formatMoney } from '../utils/expenses';
import PremiumSelect from '../components/PremiumSelect';
import LimitedExpenseList from '../components/LimitedExpenseList';
import ResponsiveDatePicker from '../components/ResponsiveDatePicker';

const accountFilters = [{ value: 'all', label: 'All accounts' }, ...ACCOUNT_OPTIONS];

function BalanceCard({ label, value, hint }) {
  return (
    <section className="rounded-[1.5rem] border border-white/5 bg-surface/90 p-5 shadow-soft backdrop-blur">
      <p className="text-[0.72rem] uppercase tracking-[0.28em] text-text-subtle">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-luxury-gold">{value}</p>
      <p className="mt-2 text-sm text-text-secondary">{hint}</p>
    </section>
  );
}

export default function BalancesPage() {
  const { balances, transactions, loading, error, mutating, addTransaction, deleteTransaction, setError } = useBalances();
  const [filter, setFilter] = useState('all');
  const [deletingId, setDeletingId] = useState('');
  const [formState, setFormState] = useState({
    type: 'bank',
    mode: 'credit',
    amount: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [formError, setFormError] = useState('');

  const filteredTransactions = useMemo(
    () => transactions.filter((transaction) => filter === 'all' || transaction.type === filter),
    [transactions, filter],
  );

  const totalManagedBalance = useMemo(
    () => Object.values(balances).reduce((sum, value) => sum + Number(value || 0), 0),
    [balances],
  );

  const updateField = (field) => (event) => {
    setFormState((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    try {
      await addTransaction(formState);
      setFormState((current) => ({
        ...current,
        amount: '',
        description: '',
        date: new Date().toISOString().slice(0, 10),
      }));
    } catch (nextError) {
      setFormError(nextError.message);
    }
  };

  const handleDelete = async (transactionId) => {
    const confirmed = window.confirm('Are you sure you want to delete this transaction?');

    if (!confirmed) {
      return;
    }

    setDeletingId(transactionId);
    setError('');

    try {
      await deleteTransaction(transactionId);
    } catch (nextError) {
      setError('Failed to delete transaction');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BalanceCard label="Bank Balance" value={formatMoney(balances.bank)} hint="Dedicated bank account" />
        <BalanceCard label="UPI Lite Balance" value={formatMoney(balances.upi)} hint="Instant mobile spending" />
        <BalanceCard label="Cash Balance" value={formatMoney(balances.cash)} hint={`Total managed: ${formatMoney(totalManagedBalance)}`} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.5rem] border border-white/5 bg-surface/90 p-4 shadow-soft backdrop-blur sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.28em] text-text-subtle">Transaction Entry</p>
              <h2 className="mt-2 break-words text-lg font-semibold text-text-primary">Add money or spend from an account</h2>
            </div>
            <div className="hidden rounded-full border border-white/6 bg-white/[0.04] px-3 py-1 text-xs text-text-secondary sm:block">
              44px touch targets
            </div>
          </div>

          <form className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <label>
              <span className="mb-2 block text-sm text-text-secondary">Select account</span>
              <PremiumSelect
                value={formState.type}
                onChange={updateField('type')}
              >
                {ACCOUNT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </PremiumSelect>
            </label>

            <label>
              <span className="mb-2 block text-sm text-text-secondary">Type</span>
              <PremiumSelect
                value={formState.mode}
                onChange={updateField('mode')}
              >
                {TRANSACTION_MODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </PremiumSelect>
            </label>

            <label>
              <span className="mb-2 block text-sm text-text-secondary">Amount</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={formState.amount}
                onChange={updateField('amount')}
                placeholder="500.00"
                className="h-[48px] w-full rounded-xl border border-gray-700 bg-[#121212] px-4 text-sm text-white placeholder-gray-500 outline-none transition-all duration-150 focus:border-[#C6A75E]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-text-secondary">Date</span>
              <ResponsiveDatePicker
                value={formState.date}
                onChange={updateField('date')}
              />
            </label>

            <label className="md:col-span-2">
              <span className="mb-2 block text-sm text-text-secondary">Description</span>
              <input
                value={formState.description}
                onChange={updateField('description')}
                placeholder="Salary deposit, groceries, fuel, and more"
                className="h-[48px] w-full rounded-xl border border-gray-700 bg-[#121212] px-4 text-sm text-white placeholder-gray-500 outline-none transition-all duration-150 focus:border-[#C6A75E]"
                maxLength={120}
              />
            </label>

            {formError ? <p className="md:col-span-2 text-sm text-[#c9a7a4]">{formError}</p> : null}

            <button
              type="submit"
              disabled={mutating}
              className="h-[48px] w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#e8ecef] px-4 text-sm font-semibold text-[#0f1419] transition-all duration-150 hover:bg-white disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
            >
              <PlusCircle className="h-4 w-4" />
              {mutating ? 'Saving...' : 'Add Transaction'}
            </button>
          </form>
        </div>

        <div className="rounded-[1.5rem] border border-white/5 bg-surface/90 p-4 shadow-soft backdrop-blur sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.28em] text-text-subtle">History</p>
              <h2 className="mt-2 text-lg font-semibold text-text-primary">Account transactions</h2>
            </div>

            <label className="w-full min-w-0 sm:w-auto sm:min-w-[11rem]">
              <span className="sr-only">Filter by account</span>
              <PremiumSelect
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                {accountFilters.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </PremiumSelect>
            </label>
          </div>

          <div className="mt-5">
            <LimitedExpenseList
              expenses={filteredTransactions}
              loading={loading}
              error={error}
              limit={10}
              viewAllLink="/balances"
              viewAllLabel="View all transactions"
              itemSeparator={false}
              renderItem={(transaction) => (
                <article className="group rounded-[1.25rem] border border-white/5 bg-white/[0.03] px-4 py-4 transition-colors duration-200 hover:bg-white/[0.05]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate break-words text-sm font-semibold text-text-primary">{transaction.description}</h3>
                        <span className="rounded-full border border-white/6 bg-white/[0.04] px-2.5 py-1 text-[0.7rem] text-text-secondary">
                          {getAccountLabel(transaction.type)}
                        </span>
                        <span
                          className={[
                            'rounded-full px-2.5 py-1 text-[0.7rem]',
                            transaction.mode === 'credit'
                              ? 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                              : 'border border-rose-400/20 bg-rose-400/10 text-rose-300',
                          ].join(' ')}
                        >
                          {getTransactionModeLabel(transaction.mode)}
                        </span>
                      </div>
                      <p className="mt-2 break-words text-xs text-text-subtle">{formatDate(transaction.date)}</p>
                    </div>

                    <div className="flex items-start gap-2 text-right">
                      <div className="min-w-0">
                        <p className={[transaction.mode === 'credit' ? 'text-emerald-300' : 'text-rose-300', 'whitespace-nowrap text-sm'].join(' ')}>
                          {transaction.mode === 'credit' ? <ArrowUpRight className="inline h-4 w-4" /> : <ArrowDownLeft className="inline h-4 w-4" />} {formatMoney(transaction.amount)}
                        </p>
                        <p className="break-words text-xs text-text-subtle">{transaction.mode === 'credit' ? 'Added to balance' : 'Spent from balance'}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(transaction.id)}
                        disabled={deletingId === transaction.id || mutating}
                        aria-label={`Delete transaction ${transaction.description}`}
                        className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-full text-text-subtle opacity-100 transition-colors duration-200 hover:bg-white/5 hover:text-text-primary md:opacity-0 md:group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              )}
              emptyState={
                <div className="rounded-[1.25rem] border border-dashed border-white/8 bg-white/[0.02] px-5 py-8 text-center text-sm text-text-secondary">
                  No transactions in this filter yet.
                </div>
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function LoadingRows() {
  return Array.from({ length: 3 }, (_, index) => (
    <div key={index} className="animate-pulse rounded-[1.25rem] border border-white/5 bg-white/[0.02] px-4 py-4">
      <div className="h-4 w-3/4 rounded-full bg-white/6" />
      <div className="mt-3 h-3 w-1/3 rounded-full bg-white/6" />
    </div>
  ));
}