// Web version of takeStore.ts. Browsers give recordings as short-lived blob: URLs,
// so quick takes are copied into IndexedDB and referred to as "idb:<id>".

const DB = 'nerve-takes';
const STORE = 'takes';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, work: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const req = work(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const urls = new Map<string, string>();

async function blobFor(uri: string): Promise<Blob> {
  if (uri.startsWith('idb:')) {
    const blob = await run<Blob | undefined>('readonly', (s) => s.get(uri.slice(4)));
    if (!blob) throw new Error('This take is no longer saved in this browser.');
    return blob;
  }
  return (await fetch(uri)).blob();
}

export async function keep(uri: string): Promise<string> {
  try {
    const blob = await blobFor(uri);
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await run('readwrite', (s) => s.put(blob, id));
    urls.set(`idb:${id}`, uri);
    return `idb:${id}`;
  } catch {
    return uri;
  }
}

export function remove(uri: string) {
  const url = urls.get(uri);
  if (url) URL.revokeObjectURL(url);
  urls.delete(uri);
  if (uri.startsWith('idb:')) run('readwrite', (s) => s.delete(uri.slice(4))).catch(() => {});
}

export async function playable(uri: string): Promise<string> {
  if (!uri.startsWith('idb:')) return uri;
  const known = urls.get(uri);
  if (known) return known;
  const url = URL.createObjectURL(await blobFor(uri));
  urls.set(uri, url);
  return url;
}

export async function readRecording(uri: string, kind: 'voice' | 'video') {
  const blob = await blobFor(uri);
  const type = (blob.type || (kind === 'voice' ? 'audio/webm' : 'video/webm')).split(';')[0];
  const ext = type.endsWith('mp4') ? (kind === 'voice' ? 'm4a' : 'mp4') : type.endsWith('ogg') ? 'ogg' : type.endsWith('wav') ? 'wav' : 'webm';
  return { body: blob, ext, type };
}
