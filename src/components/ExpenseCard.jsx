import { memo } from 'react';
import { Trash2 } from 'lucide-react';
import { formatDate, formatMoney } from '../utils/expenses';
import { getAccountLabel } from '../utils/ledger';

function ExpenseCard({ expense, onDelete }) {
  return (
    <article className="group rounded-[1.25rem] border border-white/5 bg-white/[0.03] px-4 py-4 transition-colors duration-200 hover:bg-white/[0.05]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-text-primary">{expense.description}</h3>
            <span className="rounded-full border border-white/6 bg-white/[0.04] px-2.5 py-1 text-[0.7rem] text-text-secondary">
              {expense.category}
            </span>
            <span className="rounded-full border border-luxury-gold/20 bg-luxury-gold/10 px-2.5 py-1 text-[0.7rem] text-luxury-gold">
              {getAccountLabel(expense.paymentMode || 'bank')}
            </span>
          </div>
          <p className="mt-2 text-xs text-text-subtle">{formatDate(expense.expenseDate)}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-text-primary">{formatMoney(expense.amount)}</p>
            <p className="text-xs text-text-subtle">Cloud synced</p>
          </div>

          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(expense.id)}
              className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-white/6 bg-transparent text-text-subtle opacity-100 transition-colors duration-200 hover:bg-white/8 hover:text-text-primary"
              aria-label={`Delete ${expense.description}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default memo(ExpenseCard);
