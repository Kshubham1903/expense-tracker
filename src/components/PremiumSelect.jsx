import { ChevronDown } from 'lucide-react';
import { Children, isValidElement, useEffect, useId, useMemo, useRef, useState } from 'react';

function getOptionValue(option) {
  return option.props.value;
}

function getOptionLabel(option) {
  if (typeof option.props.children === 'string' || typeof option.props.children === 'number') {
    return String(option.props.children);
  }

  return String(option.props.value ?? '');
}

export default function PremiumSelect({ className = '', children, value, onChange, disabled = false, ...props }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listboxId = useId();

  const options = useMemo(
    () =>
      Children.toArray(children)
        .filter(isValidElement)
        .map((child) => ({
          value: getOptionValue(child),
          label: getOptionLabel(child),
        })),
    [children],
  );

  const selectedOption = options.find((option) => String(option.value) === String(value)) ?? options[0] ?? null;

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
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

  const handleSelect = (nextValue) => {
    if (disabled) {
      return;
    }

    if (typeof onChange === 'function') {
      onChange({
        target: { value: nextValue },
        currentTarget: { value: nextValue },
      });
    }

    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={[
          'flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-gray-700 bg-[#121212] px-4 py-3 text-left text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition-all duration-150 ease-out focus:border-[#C6A75E] focus:outline-none',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
          className,
        ].join(' ')}
      >
        <span className="min-w-0 flex-1 truncate text-sm">{selectedOption?.label ?? ''}</span>
        <ChevronDown className={['h-4 w-4 shrink-0 text-[#C6A75E] transition-transform duration-150', open ? 'rotate-180' : 'rotate-0'].join(' ')} />
      </button>

      <div
        id={listboxId}
        role="listbox"
        aria-hidden={!open}
        className={[
          'absolute left-0 right-0 top-full z-50 mt-2 origin-top overflow-hidden rounded-xl border border-gray-700 bg-[#161616] shadow-[0_18px_40px_rgba(0,0,0,0.55)] transition-all duration-150 ease-out',
          open ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0',
        ].join(' ')}
      >
        <div className="max-h-64 overflow-y-auto py-2">
          {options.map((option) => {
            const selected = String(option.value) === String(value);

            return (
              <button
                key={String(option.value)}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => handleSelect(option.value)}
                className={[
                  'w-full px-4 py-2 text-left text-sm transition-all duration-150 ease-out',
                  selected ? 'bg-[#1f1f1f] text-[#C6A75E]' : 'text-gray-200 hover:bg-[#1f1f1f] hover:text-white',
                ].join(' ')}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}