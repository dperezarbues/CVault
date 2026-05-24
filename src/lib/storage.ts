// Unified storage abstraction for CVault.
// In normal mode  → localStorage  (persists across sessions)
// In private mode → sessionStorage (auto-clears when tab closes)
//
// Private mode flag is stored in sessionStorage itself — it lives only for the
// current tab and is never written to localStorage.

const PRIVATE_FLAG = 'cvault-private'

export const KEYS = {
  cvs: 'cvault-cvs',
  currentCv: 'cvault-current-cv',
  styleOverrides: 'cvault-style-overrides',
  layoutOverrides: 'cvault-layout-overrides',
  saves: 'cvault-saves',
  onboarded: 'cvault-onboarded',
  supportPrompted: 'cvault-support-prompted',
} as const

function store(): Storage {
  if (typeof window === 'undefined')
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    }
  try {
    return sessionStorage.getItem(PRIVATE_FLAG) ? sessionStorage : localStorage
  } catch {
    return localStorage
  }
}

const devWarn = (fn: string, err: unknown) => {
  if (process.env.NODE_ENV === 'development') console.warn(`[storage] ${fn}:`, err)
}

/** Reads a value from the active storage (localStorage or sessionStorage in private mode). */
export function getItem(key: string): string | null {
  try {
    return store().getItem(key)
  } catch (err) {
    devWarn('getItem', err)
    return null
  }
}

/** Writes a value to the active storage. Silently fails if storage is unavailable (e.g. quota exceeded). */
export function setItem(key: string, value: string): void {
  try {
    store().setItem(key, value)
  } catch (err) {
    devWarn('setItem', err)
  }
}

/** Removes a key from both localStorage and sessionStorage to ensure no stale data remains. */
export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (err) {
    devWarn('removeItem(localStorage)', err)
  }
  try {
    sessionStorage.removeItem(key)
  } catch (err) {
    devWarn('removeItem(sessionStorage)', err)
  }
}

/** Returns true if the current tab is in private mode (session-only storage). */
export function isPrivateMode(): boolean {
  try {
    return !!sessionStorage.getItem(PRIVATE_FLAG)
  } catch (err) {
    devWarn('isPrivateMode', err)
    return false
  }
}

/** Activates private mode for the current tab — all data is stored in sessionStorage. */
export function enablePrivateMode(): void {
  try {
    sessionStorage.setItem(PRIVATE_FLAG, '1')
  } catch (err) {
    devWarn('enablePrivateMode', err)
  }
}

/** Deactivates private mode for the current tab. */
export function disablePrivateMode(): void {
  try {
    sessionStorage.removeItem(PRIVATE_FLAG)
  } catch (err) {
    devWarn('disablePrivateMode', err)
  }
}

/** Removes all CVault data from both localStorage and sessionStorage, including legacy keys. */
export function clearAllData(): void {
  Object.values(KEYS).forEach((k) => {
    try {
      localStorage.removeItem(k)
    } catch (err) {
      devWarn('clearAllData(localStorage)', err)
    }
    try {
      sessionStorage.removeItem(k)
    } catch (err) {
      devWarn('clearAllData(sessionStorage)', err)
    }
  })
  // Also clear the old cv-web-* keys from before the rename
  const legacyKeys = [
    'cv-web-cvs',
    'cv-web-current-cv',
    'cv-web-style-overrides',
    'cv-web-saves',
    'cv-web-onboarded',
  ]
  legacyKeys.forEach((k) => {
    try {
      localStorage.removeItem(k)
    } catch (err) {
      devWarn('clearAllData(legacy/localStorage)', err)
    }
    try {
      sessionStorage.removeItem(k)
    } catch (err) {
      devWarn('clearAllData(legacy/sessionStorage)', err)
    }
  })
}
