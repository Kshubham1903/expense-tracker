import { useState, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * LimitedExpenseList
 * Optimized transaction display component that:
 * - Limits rendered transactions to a fixed number
 * - Uses scrollable container to prevent page expansion
 * - Provides navigation to full transaction view
 * - Improves performance and UX across all pages
 */
export default function LimitedExpenseList({
  expenses,
  loading,
  error,
  renderItem,
  itemSeparator = true,
  limit = 10,
  viewAllLink = '/reports',
  viewAllLabel = 'View all expenses',
  emptyState = null,
  className = '',
}) {
  const navigate = useNavigate();
  const [showScrollHint, setShowScrollHint] = useState(false);

  // Limit to most recent N expenses
  const limitedExpenses = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];
    return expenses.slice(0, limit);
  }, [expenses, limit]);

  const hasMore = expenses && expenses.length > limit;

  // Detect if container is scrollable
  const handleScroll = (e) => {
    const element = e.currentTarget;
    const isScrollable = element.scrollHeight > element.clientHeight;
    setShowScrollHint(isScrollable && element.scrollTop === 0);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, idx) => (
          <div key={idx} className="animate-pulse">
            <div className="h-16 rounded-luxury bg-gray-800/30" />
            {idx < 2 && <div className="luxury-separator my-3" />}
          </div>
        ))}
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return emptyState;
  }

  return (
    <div className={className}>
      {/* Scrollable Container */}
      <div
        className="relative max-h-[600px] overflow-y-auto pr-2 space-y-3 rounded-lg"
        onScroll={handleScroll}
      >
        {/* Scroll hint (shows when more items exist above) */}
        {showScrollHint && hasMore && (
          <div className="sticky top-0 z-10 -mx-2 px-2 py-1 text-center">
            <div className="inline-flex items-center gap-1 rounded-full bg-luxury-gold/10 px-2 py-1 text-[0.7rem] text-luxury-gold/70">
              ↑ Scroll to see more
            </div>
          </div>
        )}

        {/* Rendered Items */}
        {limitedExpenses.map((item, idx) => (
          <div key={item.id || idx}>
            {renderItem(item)}
            {itemSeparator && idx < limitedExpenses.length - 1 && (
              <div className="luxury-separator my-3" />
            )}
          </div>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="mt-4 rounded-luxury border border-state-error/30 bg-state-error/10 p-3 text-sm text-state-error">
          {error}
        </div>
      )}

      {/* View All Button (shows when more items exist) */}
      {hasMore && (
        <button
          type="button"
          onClick={() => navigate(viewAllLink)}
          className="mt-4 w-full rounded-luxury border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-text-primary transition-all duration-200 hover:bg-white/[0.08] hover:border-white/20 flex items-center justify-center gap-2"
        >
          {viewAllLabel}
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
