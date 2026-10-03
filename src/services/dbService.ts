import { invoke } from "@tauri-apps/api/core";

/**
 * Encrypted global database (SQLite backend on Rust side; values are
 * AES-256-GCM encrypted at rest with a master key generated on first run
 * and stored next to the SQLite file).
 *
 * True once `db.init()` has resolved successfully. UI stores can read this to
 * decide whether to skip the blocking `db.get` at module-eval time (kept for
 * startup speed) and only mirror writes.
 */
let dbReady = false;

export const isDbReady = () => dbReady;

interface DbResult<T> {
  ok: boolean;
  value: T | null;
  error?: string;
}

type PlainDb = Pick<
  typeof globalThis,
  "fetch"
> &
  Record<string, unknown>;

const isTauri = () => {
  const w = window as unknown as { __TAURI__?: unknown; __TAURI_INTERNALS__?: unknown };
  return (
    typeof w !== "undefined" &&
    (Boolean(w.__TAURI__) || Boolean(w.__TAURI_INTERNALS__))
  );
};

/**
 * Build a zustand-compatible `StorageLike` that persists to:
 *  - primary: encrypted global db (single key per store)
 *  - fallback: localStorage (fast + survives `db_init` failure / browser mode)
 *
 * Both stores work even when the db is not initialised yet: the very first
 * synchronous `getItem()` returns the localStorage copy (or `null` so the
 * zustand default kicks in), and the db write races against first paint.
 *
 * Backward-compat: if the legacy key `castoverlay-app:v1` (from the old
 * plaintext localStorage store) still exists, restore it by reading the
 * platform key and re-encrypting it under the v2 encrypted key path.
 */
export function createEncryptedStorage(prefix: string) {
  const legacyKey = "castoverlay-app";
  const storageKey = `${prefix}:v1`;
  const legacyStorageKey = "castoverlay-app:v1";

  // Once-per-module-level migration: copy legacy plaintext data into the
  // encrypted db so existing user data is not lost.
  let migrateDone = false;
  const migrateFromLegacy = () => {
    if (migrateDone) return;
    migrateDone = true;
    try {
      const raw = localStorage.getItem(legacyKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { state?: unknown };
      const platformState = parsed.state?.[storageKey];
      if (platformState == null) return;
      // Best-effort: re-persist under the encrypted db (async).
      void db.set(storageKey, platformState).catch(() => {});
    } catch {
      /* corrupt legacy payload – ignore */
    }
  };

  return {
    getItem: async (): Promise<string | null> => {
      if (!isTauri()) {
        return localStorage.getItem(storageKey);
      }
      migrateFromLegacy();
      try {
        const raw = await db.get<string>(storageKey);
        if (raw != null) {
          // Double-encode so downstream JSON.parse gets a top-level object,
          // matching the zustand persist contract.
          return raw;
        }
        // Fall back to localStorage for the first render / db failure.
        return localStorage.getItem(storageKey);
      } catch (err) {
        console.error("[dbService] storage.getItem failed", err);
        return localStorage.getItem(storageKey);
      }
    },
    setItem: async (value: string): Promise<void> => {
      // Mirror in localStorage for startup-speed (sync, no crypto involved).
      try {
        localStorage.setItem(storageKey, value);
      } catch {
        /* quota or non-pointing context – ignore */
      }
      if (!isTauri()) return;
      try {
        await db.set(storageKey, value);
      } catch (err) {
        console.error("[dbService] storage.setItem failed", err);
      }
    },
    removeItem: async (): Promise<void> => {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        /* ignore */
      }
      try {
        await db.del(storageKey);
      } catch {
        /* ignore */
      }
    },
  };
}

export const db = {
  init: async (): Promise<boolean> => {
    if (!isTauri()) return false;
    try {
      await invoke("db_init");
      dbReady = true;
      return true;
    } catch (err) {
      console.error("[dbService] init failed", err);
      return false;
    }
  },

  get: async <T = unknown>(key: string): Promise<T | null> => {
    if (!isTauri()) return null;
    try {
      const v = await invoke<string | null>("db_get", { key });
      if (v == null) return null;
      try {
        return JSON.parse(v) as T;
      } catch {
        return v as unknown as T;
      }
    } catch (err) {
      console.error("[dbService] get failed", key, err);
      return null;
    }
  },

  set: async (key: string, value: unknown): Promise<boolean> => {
    if (!isTauri()) return false;
    try {
      const json = typeof value === "string" ? value : JSON.stringify(value);
      await invoke("db_set", { key, value: json });
      return true;
    } catch (err) {
      console.error("[dbService] set failed", key, err);
      return false;
    }
  },

  del: async (key: string): Promise<boolean> => {
    if (!isTauri()) return false;
    try {
      await invoke("db_delete", { key });
      return true;
    } catch (err) {
      console.error("[dbService] delete failed", key, err);
      return false;
    }
  },

  keys: async (prefix?: string): Promise<string[]> => {
    if (!isTauri()) return [];
    try {
      const ks = await invoke<string[]>("db_keys", { prefix: prefix ?? null });
      return ks ?? [];
    } catch (err) {
      console.error("[dbService] keys failed", err);
      return [];
    }
  },

  hashPassword: async (pw: string): Promise<string> => {
    if (!isTauri()) return `sha256-insecure:${pw.length}`;
    try {
      return await invoke<string>("db_hash_password", { password: pw });
    } catch (err) {
      console.error("[dbService] hash failed", err);
      return `sha256-insecure:${pw.length}`;
    }
  },

  verifyPassword: async (pw: string, hash: string): Promise<boolean> => {
    if (!isTauri()) return false;
    try {
      return await invoke<boolean>("db_verify_password", { password: pw, hash });
    } catch (err) {
      console.error("[dbService] verify failed", err);
      return false;
    }
  },
};

export { isTauri };
export type { DbResult, PlainDb };