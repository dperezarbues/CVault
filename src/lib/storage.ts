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
  saves: 'cvault-saves',
  onboarded: 'cvault-onboarded',
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

export function getItem(key: string): string | null {
  try {
    return store().getItem(key)
  } catch {
    return null
  }
}

export function setItem(key: string, value: string): void {
  try {
    store().setItem(key, value)
  } catch {}
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {}
  try {
    sessionStorage.removeItem(key)
  } catch {}
}

export function isPrivateMode(): boolean {
  try {
    return !!sessionStorage.getItem(PRIVATE_FLAG)
  } catch {
    return false
  }
}

export function enablePrivateMode(): void {
  try {
    sessionStorage.setItem(PRIVATE_FLAG, '1')
  } catch {}
}

export function disablePrivateMode(): void {
  try {
    sessionStorage.removeItem(PRIVATE_FLAG)
  } catch {}
}

export function clearAllData(): void {
  Object.values(KEYS).forEach((k) => {
    try {
      localStorage.removeItem(k)
    } catch {}
    try {
      sessionStorage.removeItem(k)
    } catch {}
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
    } catch {}
    try {
      sessionStorage.removeItem(k)
    } catch {}
  })
}
