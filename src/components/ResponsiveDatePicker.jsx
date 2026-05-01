import { CalendarDays, X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { createPortal } from 'react-dom';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

const displayFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const MOBILE_BREAKPOINT = 768; // Tailwind md breakpoint

function parseDateValue(value) {
  if (!value) {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function createChangeEvent(nextValue) {
  return {
    target: { value: nextValue },
    currentTarget: { value: nextValue },
  };
}

/**
 * ResponsiveDatePicker
 * Global date picker component that adapts to screen size:
 * - Mobile (≤768px): Opens as centered modal with overlay
 * - Desktop (>768px): Opens as dropdown below input
 */
export default function ResponsiveDatePicker({
  value = '',
  onChange,
  className = '',
  disabled = false,
  placeholder = 'Select date',
}) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= MOBILE_BREAKPOINT : false);
  const rootRef = useRef(null);
  const [portalStyle, setPortalStyle] = useState(null);
  const selectedDate = useMemo(() => parseDateValue(value), [value]);
  const [month, setMonth] = useState(() => selectedDate ?? new Date());

  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      setMonth(selectedDate);
    }
  }, [selectedDate]);

  // Position dropdown on desktop
  useLayoutEffect(() => {
    if (!open || !rootRef.current || isMobile) {
      setPortalStyle(null);
      return undefined;
    }

    const updatePosition = () => {
      const inputRect = rootRef.current?.getBoundingClientRect();

      if (!inputRect) {
        return;
      }

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const padding = 8;
      const edgePadding = 8;
      const estimatedCalendarHeight = 340;

      const spaceBelow = viewportHeight - inputRect.bottom;
      const spaceAbove = inputRect.top;

      const fitsBelow = spaceBelow >= estimatedCalendarHeight + padding + edgePadding;
      const fitsAbove = spaceAbove >= estimatedCalendarHeight + padding + edgePadding;

      let top;

      if (fitsBelow) {
        top = inputRect.bottom + padding;
      } else if (fitsAbove) {
        top = inputRect.top - estimatedCalendarHeight - padding;
      } else {
        top = inputRect.bottom + padding;
      }

      let left = inputRect.left;
      const calendarWidth = Math.min(inputRect.width, 288);

      if (left + calendarWidth + edgePadding > viewportWidth) {
        left = viewportWidth - calendarWidth - edgePadding;
      }

      if (left < edgePadding) {
        left = edgePadding;
      }

      if (top + estimatedCalendarHeight + edgePadding > viewportHeight) {
        top = viewportHeight - estimatedCalendarHeight - edgePadding;
      }

      if (top < edgePadding) {
        top = edgePadding;
      }

      setPortalStyle({
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        width: `${inputRect.width}px`,
        zIndex: 9999,
      });
    };

    updatePosition();

    const timer = setTimeout(() => {
      const portal = document.querySelector('[data-responsive-datepicker-portal]');
      if (portal) {
        const inputRect = rootRef.current?.getBoundingClientRect();
        if (inputRect) {
          const viewportHeight = window.innerHeight;
          const padding = 8;
          const edgePadding = 8;
          const portalHeight = portal.offsetHeight;
          const spaceBelow = viewportHeight - inputRect.bottom;
          const spaceAbove = inputRect.top;

          const fitsBelow = spaceBelow >= portalHeight + padding + edgePadding;
          const fitsAbove = spaceAbove >= portalHeight + padding + edgePadding;

          let top;

          if (fitsBelow) {
            top = inputRect.bottom + padding;
          } else if (fitsAbove) {
            top = inputRect.top - portalHeight - padding;
          } else {
            top = inputRect.bottom + padding;
          }

          if (top + portalHeight + edgePadding > viewportHeight) {
            top = viewportHeight - portalHeight - edgePadding;
          }

          if (top < edgePadding) {
            top = edgePadding;
          }

          setPortalStyle((prev) => ({
            ...prev,
            top: `${top}px`,
          }));
        }
      }
    }, 0);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, isMobile]);

  // Close on escape or outside click
  useEffect(() => {
    const handlePointerDown = (event) => {
      const target = event.target;

      if (
        (rootRef.current && rootRef.current.contains(target)) ||
        (target && typeof target.closest === 'function' && target.closest('[data-responsive-datepicker-portal]'))
      ) {
        return;
      }

      setOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelect = (nextDate) => {
    if (disabled) {
      return;
    }

    if (nextDate instanceof Date) {
      const nextValue = formatDateValue(nextDate);
      onChange?.(createChangeEvent(nextValue));
      setMonth(nextDate);
      setOpen(false);
    }
  };

  const handleClear = () => {
    if (disabled) {
      return;
    }

    onChange?.(createChangeEvent(''));
    setOpen(false);
  };

  const handleToday = () => {
    if (disabled) {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    onChange?.(createChangeEvent(formatDateValue(today)));
    setMonth(today);
    setOpen(false);
  };

  // Calendar content (shared between modal and dropdown)
  const CalendarContent = () => (
    <div className="w-full">
      <DayPicker
        mode="single"
        selected={selectedDate}
        month={month}
        onMonthChange={setMonth}
        onSelect={handleSelect}
        showOutsideDays
        captionLayout="buttons"
        classNames={{
          root: 'w-full',
          months: 'w-full',
          month: 'w-full',
          month_caption: 'mb-4 flex items-center justify-between px-1',
          caption_label: 'text-sm font-semibold text-white',
          nav: 'flex gap-1 items-center',
          nav_button: 'h-6 w-6 bg-transparent p-0',
          button_previous:
            'inline-flex h-6 w-6 items-center justify-center rounded-md border border-transparent text-gray-400 transition-all duration-150 hover:border-gray-600 hover:bg-gray-700 hover:text-white active:bg-gray-600',
          button_next:
            'inline-flex h-6 w-6 items-center justify-center rounded-md border border-transparent text-gray-400 transition-all duration-150 hover:border-gray-600 hover:bg-gray-700 hover:text-white active:bg-gray-600',
          chevron: 'h-4 w-4',
          weekdays: 'grid grid-cols-7 gap-2 mb-2',
          weekday: 'text-center text-xs font-semibold text-gray-500 py-2',
          month_grid: 'w-full',
          weeks: 'space-y-2',
          week: 'grid grid-cols-7 gap-2',
          day: 'relative p-0 text-center',
          day_button:
            'relative inline-flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium text-gray-300 transition-all duration-200 hover:bg-gray-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50 disabled:text-gray-600 disabled:opacity-40',
          outside: 'text-gray-500',
          disabled: 'text-gray-600 opacity-40 cursor-not-allowed',
          today: 'border border-yellow-500/50 bg-yellow-500/10 text-yellow-300 font-semibold',
          selected: 'bg-yellow-500 text-gray-900 font-semibold hover:bg-yellow-500',
          range_start: 'rounded-r-none',
          range_end: 'rounded-l-none',
          range_middle: 'bg-yellow-500/20 rounded-none',
        }}
      />

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-700/50 pt-3">
        <button
          type="button"
          onClick={handleToday}
          disabled={disabled}
          className="flex-1 rounded-md border border-gray-700 bg-gray-700/30 px-3 py-1.5 text-xs font-medium text-gray-300 transition-all duration-150 hover:bg-gray-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 active:bg-gray-600"
        >
          Today
        </button>

        <button
          type="button"
          onClick={handleClear}
          disabled={disabled || !value}
          className="flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-gray-700 bg-gray-700/30 px-3 py-1.5 text-xs font-medium text-gray-300 transition-all duration-150 hover:bg-gray-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 active:bg-gray-600"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>
    </div>
  );

  return (
    <div ref={rootRef} className={['relative w-full', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={[
          'flex h-[48px] w-full items-center justify-between gap-3 rounded-xl border border-gray-700 bg-[#121212] px-4 text-left text-white outline-none transition-all duration-150 focus:border-[#C6A75E] focus:outline-none',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        ].join(' ')}
      >
        <span className={[value ? 'text-white' : 'text-gray-500', 'min-w-0 flex-1 truncate text-sm'].join(' ')}>
          {selectedDate ? displayFormatter.format(selectedDate) : placeholder}
        </span>
        <CalendarDays className="h-4 w-4 shrink-0 text-[#C6A75E]" />
      </button>

      {/* MOBILE: Modal */}
      {open && isMobile && typeof document !== 'undefined'
        ? createPortal(
            <>
              {/* Overlay backdrop */}
              <div
                className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-opacity duration-200"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />

              {/* Modal content */}
              <div
                data-responsive-datepicker-portal
                className="fixed left-1/2 top-1/2 z-[9999] w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900 to-gray-800 p-6 shadow-2xl"
              >
                {/* Modal header with close button */}
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Select Date</h2>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Calendar */}
                <CalendarContent />
              </div>
            </>,
            document.body,
          )
        : null}

      {/* DESKTOP: Dropdown */}
      {open && !isMobile && portalStyle && typeof document !== 'undefined'
        ? createPortal(
            <div
              data-responsive-datepicker-portal
              className="pointer-events-auto min-w-72 rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-900 to-gray-800 p-4 shadow-2xl"
              style={{ ...portalStyle, minWidth: '288px', zIndex: 9999 }}
            >
              <CalendarContent />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
