import { Timestamp } from 'firebase/firestore';

export const ACCOUNT_TYPES = ['bank', 'upi', 'cash'];

export const ACCOUNT_OPTIONS = [
  { value: 'bank', label: 'Bank Account' },
  { value: 'upi', label: 'UPI Lite' },
  { value: 'cash', label: 'Cash' },
];

export const TRANSACTION_MODE_OPTIONS = [
  { value: 'credit', label: 'Credit' },
  { value: 'debit', label: 'Debit' },
];

export const ACCOUNT_LABELS = ACCOUNT_OPTIONS.reduce((labels, option) => {
  labels[option.value] = option.label;
  return labels;
}, {});

export function isAccountType(value) {
  return ACCOUNT_TYPES.includes(value);
}

export function isTransactionMode(value) {
  return value === 'credit' || value === 'debit';
}

export function getAccountLabel(value) {
  return ACCOUNT_LABELS[value] || 'Account';
}

export function getTransactionModeLabel(value) {
  return value === 'credit' ? 'Credit' : 'Debit';
}

export function toTimestampFromDateInput(value) {
  const date = new Date(`${value}T00:00:00`);
  return Timestamp.fromDate(date);
}

export function toDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === 'function') {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function roundMoney(value) {
  return Number(Number(value || 0).toFixed(2));
}