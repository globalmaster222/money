import { createDefaultState } from './defaults.js';
import { validateState } from './validators.js';

const STORAGE_KEY = 'ledger.app-state';
export class StorageError extends Error { constructor(message, cause) { super(message, { cause }); this.name = 'StorageError'; } }
export class LocalStorageAdapter {
  read() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createDefaultState();
      const parsed = JSON.parse(raw);
      try { validateState(parsed); } catch (error) { throw new StorageError('Saved data failed integrity checks. It has not been overwritten.', error); }
      return parsed;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new StorageError('Saved data could not be read safely. Export or recover a valid backup before continuing.', error);
      }
      if (error instanceof StorageError) throw error;
      throw new StorageError('Local storage is unavailable.', error);
    }
  }
  write(nextState) {
    validateState(nextState);
    try {
      const serialized = JSON.stringify(nextState);
      // One root key makes the state replacement a single storage operation.
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      const message = error?.name === 'QuotaExceededError' ? 'Storage is full. Export a backup and remove some browser data.' : 'Your changes could not be saved. Existing saved data was left untouched.';
      throw new StorageError(message, error);
    }
  }
  clear() { localStorage.removeItem(STORAGE_KEY); }
}
