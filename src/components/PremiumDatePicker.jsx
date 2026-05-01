import { CalendarDays, X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { createPortal } from 'react-dom';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

const displayFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

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

export default function PremiumDatePicker({ value = '', onChange, className = '', disabled = false, placeholder = 'Select date' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const [portalStyle, setPortalStyle] = useState(null);
  const selectedDate = useMemo(() => parseDateValue(value), [value]);
  const [month, setMonth] = useState(() => selectedDate ?? new Date());

  useEffect(() => {
    if (selectedDate) {
      setMonth(selectedDate);
    }
  }, [selectedDate]);

  useLayoutEffect(() => {
    if (!open || !rootRef.current) {
      setPortalStyle(null);
      return undefined;
    }

    const updatePosition = () => {
      const rect = rootRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      setPortalStyle({
        position: 'fixed',
        left: `${rect.left}px`,
        top: `${rect.bottom + 8}px`,
        width: `${rect.width}px`,
      });
    };

    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      const target = event.target;
      // If click is inside the input root or the portal popover, ignore
      if (
        (rootRef.current && rootRef.current.contains(target)) ||
        (target && typeof target.closest === 'function' && target.closest('[data-datepicker-portal]'))
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

      {open && portalStyle && typeof document !== 'undefined'
        ? createPortal(
            <div
              data-datepicker-portal
              className="z-[999] overflow-visible rounded-xl border border-gray-700 bg-[#161616] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
              style={portalStyle}
            >
              <DayPicker
                mode="single"
                selected={selectedDate}
                month={month}
                onMonthChange={setMonth}
                onSelect={handleSelect}
                showOutsideDays
                captionLayout="buttons"
                classNames={{
                  root: 'w-full text-white',
                  months: 'w-full',
                  month: 'w-full space-y-3',
                  month_caption: 'relative flex items-center justify-center pb-2',
                  caption_label: 'text-sm font-medium tracking-wide text-white',
                  nav: 'flex items-center justify-between',
                  button_previous:
                    'inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-gray-300 transition-all duration-150 hover:border-gray-700 hover:bg-[#1f1f1f] hover:text-white',
                  button_next:
                    'inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-gray-300 transition-all duration-150 hover:border-gray-700 hover:bg-[#1f1f1f] hover:text-white',
                  chevron: 'h-4 w-4',
                  weekdays: 'grid grid-cols-7 gap-1 px-1 pt-2 text-[0.75rem] uppercase tracking-[0.2em] text-gray-400',
                  weekday: 'flex items-center justify-center py-2',
                  month_grid: 'w-full border-collapse',
                  weeks: 'space-y-1',
                  week: 'grid grid-cols-7 gap-1',
                  day: 'h-10 w-full',
                  day_button:
                    'flex h-10 w-full items-center justify-center rounded-lg text-sm text-gray-300 transition-all duration-150 ease-out hover:bg-[#1f1f1f] hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6A75E]/50',
                  outside: 'text-gray-600',
                  disabled: 'text-gray-600 opacity-40',
                  today: 'border border-[#C6A75E]',
                  selected: 'bg-[#C6A75E] text-black hover:bg-[#C6A75E] hover:text-black rounded-lg',
                }}
              />

              <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-700 pt-3">
                <button
                  type="button"
                  onClick={handleToday}
                  disabled={disabled}
                  className="inline-flex min-h-9 items-center justify-center rounded-lg border border-gray-700 px-3 text-xs text-gray-200 transition-colors duration-150 hover:bg-[#1f1f1f] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Today
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  disabled={disabled || !value}
                  className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-gray-700 px-3 text-xs text-gray-200 transition-colors duration-150 hover:bg-[#1f1f1f] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}