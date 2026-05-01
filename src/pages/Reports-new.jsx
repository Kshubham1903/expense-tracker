import { useMemo, useState } from 'react';
import { Download, Filter, Calendar } from 'lucide-react';
import ExpenseCard from '../components/ExpenseCard';
import PremiumDatePicker from '../components/PremiumDatePicker';
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
    <div className="min-h-screen bg-gradient-luxury px-6 py-8 md:px-12">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <p className="text-luxury-gold text-xs font-medium tracking-widest uppercase">Reports & Analysis</p>
          <h1 className="text-4xl md:text-5xl font-light text-text-primary mt-2">Expense reports</h1>
          <p className="text-text-secondary mt-4 max-w-md">Filter by date range and download detailed expense reports in CSV format</p>
        </div>

        {/* Summary Cards */}
        <section className="grid gap-5 mb-12 md:grid-cols-3">
          <SummaryCard 
            label="Filtered total" 
            value={formatMoney(totals.total)} 
            hint="Based on date range" 
            tone="primary"
          />
          <SummaryCard 
            label="Matched entries" 
            value={String(totals.count)} 
            hint="Expenses shown" 
            tone="secondary"
          />
          <SummaryCard 
            label="Export" 
            value="Ready" 
            hint="One-click CSV download" 
            tone="tertiary"
          />
        </section>

        {/* Filters Section */}
        <div className="card-luxury-elevated p-6 md:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-luxury-gold text-xs font-medium tracking-widest uppercase">Filters</p>
              <h2 className="text-2xl font-light text-text-primary mt-2">Date range</h2>
            </div>
            <button
              type="button"
              onClick={() => exportCsv(filteredExpenses)}
              className="btn-luxury-primary py-2 px-4 text-sm flex items-center gap-2 whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            <label>
              <span className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wider">From date</span>
              <PremiumDatePicker
                value={filters.startDate}
                onChange={updateFilter('startDate')}
              />
            </label>

            <label>
              <span className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wider">To date</span>
              <PremiumDatePicker
                value={filters.endDate}
                onChange={updateFilter('endDate')}
              />
            </label>
          </div>

          <div className="flex items-center gap-2 text-text-subtle text-xs">
            <Filter className="w-4 h-4 flex-shrink-0" />
            Filters are applied to your personal, synced expense records
          </div>
        </div>

        {/* Filtered Results */}
        <div className="card-luxury-elevated p-6 md:p-8">
          <div className="mb-6">
            <p className="text-luxury-gold text-xs font-medium tracking-widest uppercase">Results</p>
            <h2 className="text-2xl font-light text-text-primary mt-2">
              {loading ? 'Loading...' : `${totals.count} expense${totals.count !== 1 ? 's' : ''}`}
            </h2>
          </div>

          <div className="space-y-1">
            {loading ? (
              <LoadingRows />
            ) : filteredExpenses.length ? (
              <>
                {filteredExpenses.map((expense, idx) => (
                  <div key={expense.id}>
                    <ExpenseCard expense={expense} readonly />
                    {idx < filteredExpenses.length - 1 && <div className="luxury-separator my-3" />}
                  </div>
                ))}
              </>
            ) : (
              <EmptyResults />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function LoadingRows() {
  return Array.from({ length: 3 }, (_, idx) => (
    <div key={idx} className="animate-pulse">
      <div className="h-16 rounded-luxury bg-gray-800/30"></div>
      {idx < 2 && <div className="luxury-separator my-3" />}
    </div>
  ));
}

function EmptyResults() {
  return (
    <div className="rounded-luxury border border-dashed border-gray-700 bg-gray-800/10 px-6 py-12 text-center">
      <Calendar className="w-8 h-8 text-text-subtle mx-auto mb-3 opacity-50" />
      <p className="text-text-primary font-medium">No expenses in this range</p>
      <p className="text-text-subtle text-sm mt-2">Try adjusting your date filter to see more results</p>
    </div>
  );
}
