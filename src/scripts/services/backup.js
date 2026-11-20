import { validateState } from '../data/validators.js';
export function downloadBackup(state) {
  const payload = { ...state, backupCreatedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
  anchor.href = url; anchor.download = `ledger-backup-${new Date().toISOString().slice(0,10)}.json`; anchor.click(); URL.revokeObjectURL(url);
}
export async function parseBackup(file) {
  if (!file || file.size > 5 * 1024 * 1024) throw new Error('Choose a JSON backup smaller than 5 MB.');
  let parsed;
  try { parsed = JSON.parse(await file.text()); } catch { throw new Error('The selected file is not valid JSON.'); }
  delete parsed.backupCreatedAt; validateState(parsed); return parsed;
}
