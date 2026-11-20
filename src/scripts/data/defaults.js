import { makeId, todayISO } from '../utils/format.js';

const category = (name, type, color, icon) => ({ id: makeId(), name, type, color, icon, createdAt: new Date().toISOString() });
export const createDefaultState = () => {
  const categories = [
    category('Salary', 'income', '#78D6A2', '↗'), category('Freelance', 'income', '#78B7E8', '✳'),
    category('Food & groceries', 'expense', '#F0B66C', '◈'), category('Transport', 'expense', '#83B7E8', '↗'),
    category('Housing', 'expense', '#B59BE8', '⌂'), category('Shopping', 'expense', '#E58EA2', '◇'),
    category('Entertainment', 'expense', '#D4A1E8', '♫'), category('Health', 'expense', '#83C8C2', '＋')
  ];
  return { schemaVersion: 1, transactions: [], categories, budgets: [], settings: { theme: 'dark', currency: 'PLN', language: 'en', dateFormat: 'en-GB' }, meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } };
};
