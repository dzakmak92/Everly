/**
 * Blob storage for timeline photos/videos. Full-resolution media is too big for
 * AsyncStorage/localStorage, so on web we keep the blobs in IndexedDB (large
 * quota) and store only a tiny thumbnail data-URL in the app state. On native
 * this is a no-op for now (media falls back to the stored thumbnail; a future
 * build can wire expo-file-system).
 */
const DB_NAME = 'everly-media';
const STORE = 'blobs';

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null);
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => { const db = req.result; if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
}

export async function putMedia(id: string, blob: Blob): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

/** Returns an object URL for the stored blob (caller should revoke it), or null. */
export async function getMediaURL(id: string): Promise<string | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readonly');
    const rq = tx.objectStore(STORE).get(id);
    rq.onsuccess = () => { const b = rq.result as Blob | undefined; resolve(b ? URL.createObjectURL(b) : null); };
    rq.onerror = () => resolve(null);
  });
}

/** Returns the stored blob as a base64 data-URL (for embedding in an exported
 *  document), or null if missing. Self-contained — safe across windows. */
export async function getMediaDataURL(id: string): Promise<string | null> {
  const db = await openDb();
  if (!db) return null;
  const blob = await new Promise<Blob | null>((resolve) => {
    const tx = db.transaction(STORE, 'readonly');
    const rq = tx.objectStore(STORE).get(id);
    rq.onsuccess = () => resolve((rq.result as Blob | undefined) ?? null);
    rq.onerror = () => resolve(null);
  });
  if (!blob) return null;
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(typeof r.result === 'string' ? r.result : null);
    r.onerror = () => resolve(null);
    r.readAsDataURL(blob);
  });
}

export async function deleteMedia(id: string): Promise<void> {
  const db = await openDb();
  if (!db) return;
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).delete(id);
}
