import { useMemo, useState } from 'react';
import { Download, Filter } from 'lucide-react';
import ExpenseCard from '../components/ExpenseCard';
import SummaryCard from '../components/SummaryCard';
import { useExpenses } from '../hooks/useExpenses';
import { formatMoney } from '../utils/expenses';

export default function ReportsPage() {
  const { expenses, loading, exportCsv } = useExpenses();
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const isAfterStart = !filters.startDate || expense.expenseDate >= filters.startDate;
      const isBeforeEnd = !filters.endDate || expense.expenseDate <= filters.endDate;
      return isAfterStart && isBeforeEnd;
    });
  }, [expenses, filters]);

  const totals = useMemo(
    () => ({
      count: filteredExpenses.length,
      total: filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    }),
    [filteredExpenses],
  );

  const updateFilter = (field) => (event) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }));
  };

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard label="Filtered total" value={formatMoney(totals.total)} hint="Based on chosen dates" />
        <SummaryCard label="Matched expenses" value={String(totals.count)} hint="Entries in view" tone="sage" />
        <SummaryCard label="Export ready" value="CSV" hint="One-click download" tone="blue" />
      </section>

      <section className="rounded-[1.5rem] border border-white/5 bg-surface/90 p-5 shadow-soft backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[0.72rem] uppercase tracking-[0.28em] text-text-subtle">Reports</p>
            <h2 className="mt-2 text-lg font-semibold text-text-primary">Date filters and exports</h2>
          </div>

          <button
            type="button"
            onClick={() => exportCsv(filteredExpenses)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/6 bg-white/[0.04] px-4 text-sm text-text-primary transition-colors duration-200 hover:bg-white/[0.07]"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm text-text-secondary">From</span>
            <input
              type="date"
              value={filters.startDate}
              onChange={updateFilter('startDate')}
              className="min-h-12 w-full rounded-2xl border border-white/6 bg-elevated px-4 text-sm text-text-primary outline-none transition-colors duration-200 focus:border-accent-sage/60"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-text-secondary">To</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={updateFilter('endDate')}
              className="min-h-12 w-full rounded-2xl border border-white/6 bg-elevated px-4 text-sm text-text-primary outline-none transition-colors duration-200 focus:border-accent-sage/60"
            />
          </label>
        </div>

        <div className="mt-5 flex items-center gap-2 text-sm text-text-secondary">
          <Filter className="h-4 w-4" />
          Filters are applied locally to the authenticated user’s synced records.
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-white/5 bg-surface/90 p-5 shadow-soft backdrop-blur">
        <h3 className="text-base font-semibold text-text-primary">Filtered list</h3>

        <div className="mt-4 space-y-3">
          {loading ? (
            <p className="text-sm text-text-secondary">Loading your expense history...</p>
          ) : filteredExpenses.length ? (
            filteredExpenses.map((expense) => <ExpenseCard key={expense.id} expense={expense} />)
          ) : (
            <p className="rounded-[1.25rem] border border-dashed border-white/8 bg-white/[0.02] px-5 py-8 text-center text-sm text-text-secondary">
              No expenses match the current date range.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
