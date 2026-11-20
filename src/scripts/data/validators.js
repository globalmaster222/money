const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export function validateState(state) {
  if (!isObject(state) || state.schemaVersion !== 1) throw new Error('Unsupported or invalid backup schema.');
  for (const key of ['transactions', 'categories', 'budgets']) if (!Array.isArray(state[key])) throw new Error(`Invalid ${key} collection.`);
  if (!isObject(state.settings) || !['dark', 'light'].includes(state.settings.theme) || !['PLN', 'EUR', 'USD'].includes(state.settings.currency) || state.settings.language !== 'en') throw new Error('Invalid settings.');
  const ids = new Set();
  for (const entity of [...state.categories, ...state.transactions, ...state.budgets]) {
    if (!isObject(entity) || typeof entity.id !== 'string' || !entity.id || ids.has(entity.id)) throw new Error('Every record must have a unique ID.');
    ids.add(entity.id);
  }
  for (const category of state.categories) {
    if (!['income', 'expense'].includes(category.type) || typeof category.name !== 'string' || !category.name.trim() || !/^#[0-9a-f]{6}$/i.test(category.color) || typeof category.icon !== 'string') throw new Error('A category contains invalid data.');
  }
  const categories = new Map(state.categories.map(item => [item.id, item]));
  for (const transaction of state.transactions) {
    if (!['income', 'expense'].includes(transaction.type) || !Number.isSafeInteger(transaction.amount) || transaction.amount <= 0) throw new Error('A transaction contains an invalid type or amount.');
    if (typeof transaction.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(transaction.date) || Number.isNaN(Date.parse(`${transaction.date}T00:00:00Z`)) || new Date(`${transaction.date}T00:00:00Z`).toISOString().slice(0, 10) !== transaction.date) throw new Error('A transaction contains an invalid date.');
    const linked = categories.get(transaction.categoryId);
    if (!linked) throw new Error('A transaction references a missing category.');
    if (linked.type !== transaction.type) throw new Error('A transaction category type does not match.');
  }
  for (const budget of state.budgets) if (!Number.isSafeInteger(budget.amount) || budget.amount <= 0 || !categories.has(budget.categoryId)) throw new Error('A budget contains invalid data.');
  return true;
}
