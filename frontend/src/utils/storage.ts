export enum StorageKey {
  Theme = "theme",
  Accent = "accent",
}

export function safeGetStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore write failures (private browsing, disabled storage).
  }
}

export function safeRemoveStorage(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore remove failures to keep UI usable.
  }
}
