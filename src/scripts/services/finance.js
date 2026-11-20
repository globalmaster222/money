export function calculateSummary(transactions) {
  return transactions.reduce((summary, transaction) => {
    if (transaction.type === 'income') summary.income += transaction.amount;
    else summary.expenses += transaction.amount;
    summary.balance = summary.income - summary.expenses;
    return summary;
  }, { income: 0, expenses: 0, balance: 0 });
}
export function getMonthlyTotals(transactions, month = new Date().toISOString().slice(0, 7)) {
  return calculateSummary(transactions.filter(item => item.date.startsWith(month)));
}
export function getExpenseBreakdown(transactions, categories) {
  const totals = new Map();
  for (const item of transactions) if (item.type === 'expense') totals.set(item.categoryId, (totals.get(item.categoryId) || 0) + item.amount);
  return [...totals].map(([categoryId, amount]) => ({ category: categories.find(item => item.id === categoryId), amount })).filter(item => item.category).sort((a,b) => b.amount-a.amount);
}
