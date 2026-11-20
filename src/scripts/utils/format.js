export const currencyFormatter = (currency = 'PLN', locale = 'en-PL') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatMoney = (minorUnits, currency = 'PLN', locale = 'en-PL') =>
  currencyFormatter(currency, locale).format((Number(minorUnits) || 0) / 100);

export const formatDate = (value, locale = 'en-GB') => new Intl.DateTimeFormat(locale, {
  day: '2-digit', month: 'short', year: 'numeric'
}).format(new Date(`${value}T12:00:00`));

export const todayISO = () => { const date = new Date(); const pad = value => String(value).padStart(2, '0'); return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`; };
export const makeId = () => globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
export const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const toMinorUnits = value => {
  const normalized = String(value).trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) throw new Error('Enter a valid amount with up to two decimal places.');
  const [whole, fraction = ''] = normalized.split('.');
  const result = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(result) || result <= 0) throw new Error('Amount must be greater than zero and within the supported range.');
  return result;
};
