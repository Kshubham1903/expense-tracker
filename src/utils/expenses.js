export const CATEGORY_OPTIONS = [
  'Food',
  'Transport',
  'Housing',
  'Bills',
  'Health',
  'Subscriptions',
  'Work',
  'Other',
];

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export function formatMoney(value) {
  return currencyFormatter.format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) {
    return 'Unknown date';
  }

  const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? 'Unknown date' : shortDateFormatter.format(date);
}

export function parseExpenseDate(value) {
  return new Date(`${value}T00:00:00`);
}

function escapeCsvValue(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

export function downloadExpensesCsv(expenses, filename = 'expenses.csv') {
  const header = ['Date', 'Description', 'Category', 'Amount', 'Created At'];
  const rows = expenses.map((expense) => [
    expense.expenseDate,
    expense.description,
    expense.category,
    Number(expense.amount || 0).toFixed(2),
    expense.createdAt?.toDate ? expense.createdAt.toDate().toISOString() : '',
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function buildExpenseStats(expenses) {
  const totalSpent = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const expenseCount = expenses.length;

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthlySpent = expenses.reduce((sum, expense) => {
    if (!expense.expenseDate) {
      return sum;
    }

    return expense.expenseDate.startsWith(monthKey) ? sum + Number(expense.amount || 0) : sum;
  }, 0);

  const averageExpense = expenseCount ? totalSpent / expenseCount : 0;

  const categoryTotals = expenses.reduce((totals, expense) => {
    const current = Number(expense.amount || 0);
    totals[expense.category] = (totals[expense.category] || 0) + current;
    return totals;
  }, {});

  const topCategoryEntry = Object.entries(categoryTotals).sort((left, right) => right[1] - left[1])[0];
  const topCategory = topCategoryEntry ? { name: topCategoryEntry[0], amount: topCategoryEntry[1] } : null;

  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    date.setHours(0, 0, 0, 0);
    const key = date.toISOString().slice(0, 10);

    const amount = expenses.reduce((sum, expense) => {
      return expense.expenseDate === key ? sum + Number(expense.amount || 0) : sum;
    }, 0);

    return {
      key,
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      amount,
    };
  });

  return {
    totalSpent,
    monthlySpent,
    averageExpense,
    expenseCount,
    topCategory,
    lastSevenDays,
  };
}
