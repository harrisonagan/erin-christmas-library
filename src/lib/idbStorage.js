/**
 * Lightweight IndexedDB helper for storing book pages, photo albums, and book metadata persistently in the browser.
 * Bypasses the 5MB localStorage limit so users can upload dozens of books and high-res Apple Photos safely.
 */

const DB_NAME = 'erin_christmas_library_db';
const DB_VERSION = 1;
const STORE_PAGES = 'book_pages';
const STORE_BOOKS = 'books_metadata';

function openDB() {
  return new Promise((resolve) => {
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

// ==========================================
// BOOKS METADATA & COVERS STORAGE (NO 5MB LIMIT)
// ==========================================

export async function saveBooksToIndexedDB(books) {
  try {
    const db = await openDB();
    if (!db) return false;
    const tx = db.transaction(STORE_BOOKS, 'readwrite');
    const store = tx.objectStore(STORE_BOOKS);
    // Store with a single master key
    await store.put({ id: 'all_books', list: books, updatedAt: Date.now() });
    return true;
  } catch (err) {
    console.warn('IndexedDB saveBooks error:', err);
    return false;
  }
}

export async function getBooksFromIndexedDB() {
  try {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_BOOKS, 'readonly');
      const store = tx.objectStore(STORE_BOOKS);
      const req = store.get('all_books');
      req.onsuccess = () => {
        resolve(req.result?.list || null);
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('IndexedDB getBooks error:', err);
    return null;
  }
}

// ==========================================
// BOOK PAGES & PHOTO ALBUMS STORAGE
// ==========================================

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
