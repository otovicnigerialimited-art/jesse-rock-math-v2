let inMemoryStorage: Record<string, string> = {};

function isStorageAvailable() {
  try {
    const test = '__storage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

const isAvailable = typeof window !== 'undefined' && isStorageAvailable();

export const safeStorage = {
  getItem(key: string): string | null {
    if (isAvailable) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        return inMemoryStorage[key] || null;
      }
    }
    return inMemoryStorage[key] || null;
  },
  setItem(key: string, value: string): void {
    if (isAvailable) {
      try {
        window.localStorage.setItem(key, value);
      } catch (e) {
        inMemoryStorage[key] = value;
      }
    } else {
      inMemoryStorage[key] = value;
    }
  },
  removeItem(key: string): void {
    if (isAvailable) {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        delete inMemoryStorage[key];
      }
    } else {
      delete inMemoryStorage[key];
    }
  },
  clear(): void {
    if (isAvailable) {
      try {
        window.localStorage.clear();
      } catch (e) {
        inMemoryStorage = {};
      }
    } else {
      inMemoryStorage = {};
    }
  }
};
