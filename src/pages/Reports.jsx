import { useEffect, useMemo, useState } from 'react';
import { Download, Filter } from 'lucide-react';
import ExpenseCard from '../components/ExpenseCard';
import ResponsiveDatePicker from '../components/ResponsiveDatePicker';
import SummaryCard from '../components/SummaryCard';
import { useExpenses } from '../hooks/useExpenses';
import { formatMoney } from '../utils/expenses';

const PAGE_SIZE = 12;

export default function ReportsPage() {
  const { expenses, loading, exportCsv } = useExpenses();
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });
  const [page, setPage] = useState(1);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const isAfterStart = !filters.startDate || expense.expenseDate >= filters.startDate;
      const isBeforeEnd = !filters.endDate || expense.expenseDate <= filters.endDate;
      return isAfterStart && isBeforeEnd;
    });
  }, [expenses, filters]);

  const pageCount = Math.max(1, Math.ceil(filteredExpenses.length / PAGE_SIZE));

  const currentPageExpenses = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredExpenses.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredExpenses, page]);

  const totals = useMemo(
    () => ({
      count: filteredExpenses.length,
      total: filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    }),
    [filteredExpenses],
  );

  useEffect(() => {
    setPage(1);
  }, [filters.startDate, filters.endDate]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const updateFilter = (field) => (event) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }));
  };

  const goToPreviousPage = () => {
    setPage((current) => Math.max(1, current - 1));
  };

  const goToNextPage = () => {
    setPage((current) => Math.min(pageCount, current + 1));
  };

  return (
    <div className="space-y-5 overflow-x-hidden">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard label="Filtered total" value={formatMoney(totals.total)} hint="Based on chosen dates" />
        <SummaryCard label="Matched expenses" value={String(totals.count)} hint="Entries in view" tone="sage" />
        <SummaryCard label="Export ready" value="CSV" hint="One-click download" tone="blue" />
      </section>

      <section className="relative overflow-visible rounded-[1.5rem] border border-white/5 bg-surface/90 p-5 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.72rem] uppercase tracking-[0.28em] text-text-subtle">Reports</p>
            <h2 className="mt-2 text-lg font-semibold text-text-primary">Date filters and exports</h2>
          </div>

          <button
            type="button"
            onClick={() => exportCsv(filteredExpenses)}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/6 bg-white/[0.04] px-4 text-sm text-text-primary transition-colors duration-200 hover:bg-white/[0.07] sm:w-auto"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm text-text-secondary">From</span>
            <ResponsiveDatePicker
              value={filters.startDate}
              onChange={updateFilter('startDate')}
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-text-secondary">To</span>
            <ResponsiveDatePicker
              value={filters.endDate}
              onChange={updateFilter('endDate')}
            />
          </label>
        </div>

        <div className="mt-5 flex items-center gap-2 text-sm text-text-secondary">
          <Filter className="h-4 w-4" />
          Filters are applied locally to the authenticated user’s synced records.
        </div>
      </section>

      <section className="relative z-0 rounded-[1.5rem] border border-white/5 bg-surface/90 p-5 shadow-soft backdrop-blur">
        <h3 className="text-base font-semibold text-text-primary">Filtered list</h3>

        <div className="mt-4 space-y-3">
          {loading ? (
            <p className="text-sm text-text-secondary">Loading your expense history...</p>
          ) : currentPageExpenses.length ? (
            currentPageExpenses.map((expense, index) => (
              <div key={expense.id}>
                <ExpenseCard expense={expense} />
                {index < currentPageExpenses.length - 1 && <div className="luxury-separator my-3" />}
              </div>
            ))
          ) : (
            <p className="rounded-[1.25rem] border border-dashed border-white/8 bg-white/[0.02] px-5 py-8 text-center text-sm text-text-secondary">
              No expenses match the current date range.
            </p>
          )}
        </div>

        {filteredExpenses.length > PAGE_SIZE ? (
          <div className="mt-6 flex flex-col gap-3 border-t border-white/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-text-secondary">
              Page {page} of {pageCount} · Showing {currentPageExpenses.length} of {filteredExpenses.length} expenses
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPreviousPage}
                disabled={page === 1}
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/6 bg-white/[0.04] px-4 text-sm text-text-primary transition-colors duration-200 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={goToNextPage}
                disabled={page === pageCount}
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/6 bg-white/[0.04] px-4 text-sm text-text-primary transition-colors duration-200 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
