import { useMemo } from 'react';
import ExpenseCard from '../components/ExpenseCard';
import ExpenseForm from '../components/ExpenseForm';
import SummaryCard from '../components/SummaryCard';
import { useExpenses } from '../hooks/useExpenses';
import { formatMoney } from '../utils/expenses';
import { TrendingUp, Download, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const { expenses, loading, error, mutating, stats, addExpense, removeExpense, exportCsv } = useExpenses();

  const chartMax = useMemo(
    () => Math.max(...stats.lastSevenDays.map((day) => day.amount), 1),
    [stats.lastSevenDays],
  );

  return (
    <div className="min-h-screen bg-gradient-luxury px-6 py-8 md:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <p className="text-luxury-gold text-xs font-medium tracking-widest uppercase">Financial Dashboard</p>
          <h1 className="text-4xl md:text-5xl font-light text-text-primary mt-2">Your spending overview</h1>
          <p className="text-text-secondary mt-4 max-w-md">Track and analyze your expenses in real-time with synced cloud storage</p>
        </div>

        {/* Summary Cards Grid - Asymmetric Layout */}
        <section className="grid gap-5 mb-12">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="md:col-span-1">
              <SummaryCard
                label="Total spent"
                value={formatMoney(stats.totalSpent)}
                hint={`${stats.expenseCount} recorded`}
                tone="primary"
              />
            </div>
            <div className="md:col-span-1">
              <SummaryCard
                label="This month"
                value={formatMoney(stats.monthlySpent)}
                hint="Current period"
                tone="secondary"
              />
            </div>
            <div className="md:col-span-1">
              <SummaryCard
                label="Average expense"
                value={formatMoney(stats.averageExpense)}
                hint={stats.topCategory ? `Top: ${stats.topCategory.name}` : 'No data yet'}
                tone="tertiary"
              />
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Expense List */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Add Expense Section */}
            <div className="card-luxury-elevated p-6 md:p-8">
              <div className="mb-6">
                <p className="text-luxury-gold text-xs font-medium tracking-widest uppercase">Add Entry</p>
                <h2 className="text-2xl font-light text-text-primary mt-2">New expense</h2>
              </div>
              <ExpenseForm onSubmit={addExpense} mutating={mutating} />
            </div>

            {/* Recent Expenses */}
            <div className="card-luxury-elevated p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-luxury-gold text-xs font-medium tracking-widest uppercase">Activity</p>
                  <h2 className="text-2xl font-light text-text-primary mt-2">Recent expenses</h2>
                </div>
                <button
                  type="button"
                  onClick={() => exportCsv(expenses)}
                  className="btn-luxury-secondary py-2 px-4 text-sm flex items-center gap-2 whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>

              <div className="space-y-1">
                {loading ? (
                  <LoadingRows />
                ) : expenses.length ? (
                  <>
                    {expenses.map((expense, idx) => (
                      <div key={expense.id}>
                        <ExpenseCard expense={expense} onDelete={removeExpense} />
                        {idx < expenses.length - 1 && <div className="luxury-separator my-3" />}
                      </div>
                    ))}
                  </>
                ) : (
                  <EmptyExpenses />
                )}
              </div>

              {error && (
                <div className="mt-6 rounded-luxury border border-state-error/30 bg-state-error/10 p-4 text-sm text-state-error">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Chart & Insights */}
          <div className="space-y-6">
            
            {/* 7-Day Chart */}
            <div className="card-luxury-elevated p-6">
              <div className="mb-6">
                <p className="text-luxury-gold text-xs font-medium tracking-widest uppercase">Analytics</p>
                <h3 className="text-xl font-light text-text-primary mt-2">Last 7 days</h3>
              </div>

              <div className="flex h-48 items-end gap-1.5 px-1">
                {stats.lastSevenDays.map((day) => {
                  const height = `${Math.max((day.amount / chartMax) * 100, day.amount > 0 ? 12 : 4)}%`;

                  return (
                    <div key={day.key} className="flex flex-1 flex-col items-center justify-end gap-2">
                      <div className="w-full">
                        <div
                          className="w-full rounded-t-md bg-gradient-to-t from-luxury-gold to-luxury-gold-light transition-all duration-200 hover:opacity-80"
                          style={{ height }}
                        />
                      </div>
                      <div className="text-center w-full">
                        <p className="text-text-subtle text-xs font-medium">{day.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info Card */}
            <div className="card-luxury p-6 border-luxury-gold/20">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-luxury-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-text-primary font-medium text-sm">Premium design</p>
                  <p className="text-text-subtle text-xs mt-1">Built for clarity and simplicity. Real-time cloud sync keeps everything current.</p>
                </div>
              </div>
            </div>

          </div>
        </section>

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

function EmptyExpenses() {
  return (
    <div className="rounded-luxury border border-dashed border-gray-700 bg-gray-800/10 px-6 py-12 text-center">
      <Calendar className="w-8 h-8 text-text-subtle mx-auto mb-3 opacity-50" />
      <p className="text-text-primary font-medium">No expenses recorded yet</p>
      <p className="text-text-subtle text-sm mt-2">Add your first expense above to see your dashboard populate</p>
    </div>
  );
}
