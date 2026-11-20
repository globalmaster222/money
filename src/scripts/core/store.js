import { LocalStorageAdapter } from '../data/storage.js';
import { validateState } from '../data/validators.js';
import { makeId, todayISO } from '../utils/format.js';

export class FinanceStore {
  #adapter; #state; #listeners = new Set();
  constructor(adapter = new LocalStorageAdapter()) { this.#adapter = adapter; this.#state = adapter.read(); }
  getState() { return structuredClone(this.#state); }
  subscribe(listener) { this.#listeners.add(listener); return () => this.#listeners.delete(listener); }
  #commit(next) {
    next.meta = { ...next.meta, updatedAt: new Date().toISOString() };
    validateState(next);
    this.#adapter.write(next); // Persist before publishing state to avoid UI/storage divergence.
    this.#state = next;
    for (const listener of this.#listeners) listener(this.getState());
  }
  addTransaction(input) {
    const category = this.#state.categories.find(item => item.id === input.categoryId);
    if (!category || category.type !== input.type) throw new Error('Choose a category matching the transaction type.');
    if (!Number.isSafeInteger(input.amount) || input.amount <= 0) throw new Error('Amount must be a positive integer in grosz.');
    const now = new Date().toISOString();
    const transaction = { id: makeId(), type: input.type, amount: input.amount, categoryId: input.categoryId, description: String(input.description ?? '').trim().slice(0, 120), date: input.date || todayISO(), createdAt: now, updatedAt: now };
    this.#commit({ ...this.#state, transactions: [transaction, ...this.#state.transactions] }); return transaction;
  }
  updateTransaction(id, input) {
    const existing = this.#state.transactions.find(item => item.id === id); if (!existing) throw new Error('Transaction not found.');
    const category = this.#state.categories.find(item => item.id === input.categoryId);
    if (!category || category.type !== input.type || !Number.isSafeInteger(input.amount) || input.amount <= 0) throw new Error('Invalid transaction details.');
    const transactions = this.#state.transactions.map(item => item.id === id ? { ...item, ...input, description: String(input.description ?? '').trim().slice(0, 120), updatedAt: new Date().toISOString() } : item);
    this.#commit({ ...this.#state, transactions });
  }
  deleteTransaction(id) { this.#commit({ ...this.#state, transactions: this.#state.transactions.filter(item => item.id !== id) }); }
  addCategory(input) {
    const name = String(input.name ?? '').trim();
    if (!name || !['income', 'expense'].includes(input.type)) throw new Error('Enter a category name and valid type.');
    if (this.#state.categories.some(item => item.type === input.type && item.name.toLowerCase() === name.toLowerCase())) throw new Error('This category already exists.');
    const category = { id: makeId(), name: name.slice(0, 32), type: input.type, color: input.color || '#8CBAA0', icon: input.icon || '•', createdAt: new Date().toISOString() };
    this.#commit({ ...this.#state, categories: [...this.#state.categories, category] }); return category;
  }
  deleteCategory(id) {
    if (this.#state.transactions.some(item => item.categoryId === id) || this.#state.budgets.some(item => item.categoryId === id)) throw new Error('This category is in use. Reassign its transactions and budgets before deleting it.');
    this.#commit({ ...this.#state, categories: this.#state.categories.filter(item => item.id !== id) });
  }
  updateSettings(settings) { this.#commit({ ...this.#state, settings: { ...this.#state.settings, ...settings } }); }
  importState(imported) { validateState(imported); this.#commit(structuredClone(imported)); }
  exportState() { return { ...this.getState(), backupCreatedAt: new Date().toISOString() }; }
}
