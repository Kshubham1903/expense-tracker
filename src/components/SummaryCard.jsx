import { memo } from 'react';

function SummaryCard({ label, value, hint, tone = 'neutral' }) {
  const toneClasses = {
    neutral: 'border-white/5 bg-white/[0.03]',
    sage: 'border-accent-sage/20 bg-[rgba(124,154,146,0.08)]',
    blue: 'border-accent-blue/20 bg-[rgba(122,143,163,0.08)]',
  };

  return (
    <section className={`rounded-[1.5rem] border p-4 ${toneClasses[tone] || toneClasses.neutral}`}>
      <p className="text-xs uppercase tracking-[0.26em] text-text-subtle">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">{value}</p>
      <p className="mt-2 text-sm text-text-secondary">{hint}</p>
    </section>
  );
}

export default memo(SummaryCard);
