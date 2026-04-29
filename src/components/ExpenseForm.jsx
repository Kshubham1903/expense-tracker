import { useState } from 'react';
import { CirclePlus } from 'lucide-react';
import { CATEGORY_OPTIONS } from '../utils/expenses';
import { ACCOUNT_OPTIONS } from '../utils/ledger';

const initialState = {
  description: '',
  amount: '',
  category: 'Food',
  paymentMode: 'bank',
  expenseDate: new Date().toISOString().slice(0, 10),
};

export default function ExpenseForm({ onSubmit, mutating }) {
  const [formState, setFormState] = useState(initialState);
  const [error, setError] = useState('');

  const updateField = (field) => (event) => {
    setFormState((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await onSubmit(formState);
      setFormState(initialState);
    } catch (nextError) {
      setError(nextError.message);
    }
  };

  return (
    <section className="rounded-[1.5rem] border border-white/5 bg-surface/90 p-5 shadow-soft backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.28em] text-text-subtle">Add expense</p>
          <h2 className="mt-2 text-lg font-semibold text-text-primary">Capture a new expense</h2>
        </div>

        <div className="rounded-full border border-white/6 bg-white/[0.04] px-3 py-1 text-xs text-text-secondary">
          44px touch targets
        </div>
      </div>

      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm text-text-secondary">Description</span>
          <input
            value={formState.description}
            onChange={updateField('description')}
            placeholder="Dinner with clients"
            className="min-h-12 w-full rounded-2xl border border-white/6 bg-elevated px-4 text-sm text-text-primary outline-none transition-colors duration-200 placeholder:text-text-subtle focus:border-accent-sage/60"
            maxLength={80}
          />
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
            placeholder="42.00"
            className="min-h-12 w-full rounded-2xl border border-white/6 bg-elevated px-4 text-sm text-text-primary outline-none transition-colors duration-200 placeholder:text-text-subtle focus:border-accent-sage/60"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm text-text-secondary">Date</span>
          <input
            type="date"
            value={formState.expenseDate}
            onChange={updateField('expenseDate')}
            className="min-h-12 w-full rounded-2xl border border-white/6 bg-elevated px-4 text-sm text-text-primary outline-none transition-colors duration-200 focus:border-accent-sage/60"
          />
        </label>

        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm text-text-secondary">Category</span>
          <select
            value={formState.category}
            onChange={updateField('category')}
            className="min-h-12 w-full rounded-2xl border border-white/6 bg-elevated px-4 text-sm text-text-primary outline-none transition-colors duration-200 focus:border-accent-sage/60"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm text-text-secondary">Payment mode</span>
          <select
            value={formState.paymentMode}
            onChange={updateField('paymentMode')}
            className="min-h-12 w-full rounded-2xl border border-white/6 bg-elevated px-4 text-sm text-text-primary outline-none transition-colors duration-200 focus:border-accent-sage/60"
          >
            {ACCOUNT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {error ? <p className="sm:col-span-2 text-sm text-[#c9a7a4]">{error}</p> : null}

        <button
          type="submit"
          disabled={mutating}
          className="sm:col-span-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#e8ecef] px-4 text-sm font-semibold text-[#0f1419] transition-colors duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          <CirclePlus className="h-4 w-4" />
          {mutating ? 'Saving...' : 'Add expense'}
        </button>
      </form>
    </section>
  );
}
