/**
 * Lightweight IndexedDB helper for storing book pages and photo albums persistently in the browser.
 * Bypasses the 5MB localStorage limit so users can upload dozens of high-res Apple Photos safely.
 */

const DB_NAME = 'erin_christmas_library_db';
const DB_VERSION = 1;
const STORE_PAGES = 'book_pages';
const STORE_BOOKS = 'books_metadata';

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => resolve(null);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_PAGES)) {
        db.createObjectStore(STORE_PAGES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_BOOKS)) {
        db.createObjectStore(STORE_BOOKS, { keyPath: 'id' });
      }
    };
  });
}

export async function savePagesForBook(bookId, pages) {
  try {
    const db = await openDB();
    if (!db) return false;
    const tx = db.transaction(STORE_PAGES, 'readwrite');
    const store = tx.objectStore(STORE_PAGES);
    await store.put({ id: bookId, pages, updatedAt: Date.now() });
    return true;
  } catch (err) {
    console.warn('IndexedDB savePages error:', err);
    return false;
  }
}

export async function getPagesForBook(bookId) {
  try {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_PAGES, 'readonly');
      const store = tx.objectStore(STORE_PAGES);
      const req = store.get(bookId);
      req.onsuccess = () => {
        resolve(req.result?.pages || null);
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('IndexedDB getPages error:', err);
    return null;
  }
}
