/**
 * Google Firebase Cloud Integration
 * Provides permanent, resilient cloud storage via Google Cloud Firestore & Firebase Storage.
 * Syncs in real-time across all family devices (Erin's phone, your phone, iPad, Mac).
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  getDocs,
  enableIndexedDbPersistence 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

// Default built-in Firebase configuration for Erin's Christmas Library
const BUILTIN_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCXYPszHhNfFMPdt26XNKL69E4uF17QJSU",
  authDomain: "erins-christmas-library.firebaseapp.com",
  projectId: "erins-christmas-library",
  storageBucket: "erins-christmas-library.firebasestorage.app",
  messagingSenderId: "721482968668",
  appId: "1:721482968668:web:bcaeaae2aaeb3046110099",
  measurementId: "G-BSBNXKL34N"
};

// Default / fallback Firebase config from environment, localStorage, or built-in
function getFirebaseConfig() {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('erin_firebase_config');
    if (custom) {
      try {
        const parsed = JSON.parse(custom);
        if (parsed.projectId) return parsed;
      } catch (e) {}
    }
  }

  // Environment variables override
  if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || BUILTIN_FIREBASE_CONFIG.apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || BUILTIN_FIREBASE_CONFIG.messagingSenderId,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || BUILTIN_FIREBASE_CONFIG.appId,
    };
  }

  return BUILTIN_FIREBASE_CONFIG;
}

let app = null;
let db = null;
let storage = null;

export function isFirebaseConfigured() {
  const config = getFirebaseConfig();
  return Boolean(config && config.projectId);
}

export function initFirebase() {
  if (db && storage) return { app, db, storage };
  const config = getFirebaseConfig();
  if (!config) return { app: null, db: null, storage: null };

  try {
    app = getApps().length === 0 ? initializeApp(config) : getApp();
    db = getFirestore(app);
    storage = getStorage(app);

    // Try enabling offline persistence
    if (typeof window !== 'undefined') {
      try {
        enableIndexedDbPersistence(db).catch(() => {});
      } catch (e) {}
    }

    return { app, db, storage };
  } catch (err) {
    console.warn('Firebase init error:', err);
    return { app: null, db: null, storage: null };
  }
}

export function saveFirebaseConfig(configObj) {
  if (typeof window !== 'undefined') {
    if (configObj) {
      localStorage.setItem('erin_firebase_config', JSON.stringify(configObj));
    } else {
      localStorage.removeItem('erin_firebase_config');
    }
    // Reset instances
    app = null;
    db = null;
    storage = null;
  }
}

/**
 * Uploads a book cover image to Google Firebase Cloud Storage.
 * Returns the public permanent download URL and the storage path.
 */
export async function uploadCoverToCloud(file, bookId) {
  const { storage } = initFirebase();
  if (!storage) throw new Error('Firebase Storage not configured');

  const fileExt = file.type === 'image/webp' ? 'webp' : file.type === 'image/png' ? 'png' : 'jpg';
  const storagePath = `covers/${bookId}_${Date.now()}.${fileExt}`;
  const fileRef = ref(storage, storagePath);

  const snapshot = await uploadBytes(fileRef, file, {
    contentType: file.type || 'image/jpeg',
  });

  const downloadUrl = await getDownloadURL(snapshot.ref);
  return { downloadUrl, storagePath };
}

/**
 * Saves or updates a book record in Google Cloud Firestore.
 */
export async function saveBookToCloud(book) {
  const { db } = initFirebase();
  if (!db) throw new Error('Firestore not configured');

  const docRef = doc(db, 'books', String(book.id));
  const data = {
    id: String(book.id),
    title: book.title || '',
    author: book.author || 'Unknown',
    category: book.category || 'story',
    cover: book.cover || '',
    coverStoragePath: book.coverStoragePath || null,
    notes: book.notes || '',
    isMouseBook: Boolean(book.isMouseBook),
    isMagazine: Boolean(book.isMagazine),
    badge: book.badge || null,
    userEdited: Boolean(book.userEdited),
    updatedAt: Date.now(),
    createdAt: book.createdAt || Date.now(),
  };

  await setDoc(docRef, data, { merge: true });
  return data;
}

/**
 * Deletes a book and its cover from Firebase.
 */
export async function deleteBookFromCloud(bookId, coverStoragePath) {
  const { db, storage } = initFirebase();
  if (!db) return;

  try {
    await deleteDoc(doc(db, 'books', String(bookId)));
  } catch (e) {
    console.warn('Error deleting book doc:', e);
  }

  if (storage && coverStoragePath) {
    try {
      const fileRef = ref(storage, coverStoragePath);
      await deleteObject(fileRef);
    } catch (e) {
      console.warn('Error deleting cover image from storage:', e);
    }
  }
}

/**
 * Real-time listener for all books in Google Cloud Firestore.
 * Automatically notifies when anyone adds, modifies, or deletes a book.
 */
export function subscribeToBooksFromCloud(onBooksChanged) {
  const { db } = initFirebase();
  if (!db) return null;

  try {
    const q = query(collection(db, 'books'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const booksList = [];
      snapshot.forEach((doc) => {
        booksList.push(doc.data());
      });
      onBooksChanged(booksList);
    }, (error) => {
      console.warn('Firestore subscription error:', error);
    });
  } catch (err) {
    console.warn('subscribeToBooks error:', err);
    return null;
  }
}

/**
 * Uploads a story page or family photo to Firebase Storage.
 */
export async function uploadPageToCloud(file, bookId, pageNumber) {
  const { storage, db } = initFirebase();
  if (!storage || !db) throw new Error('Firebase not configured');

  const fileExt = file.type === 'image/webp' ? 'webp' : 'jpg';
  const storagePath = `pages/${bookId}/${pageNumber}_${Date.now()}.${fileExt}`;
  const fileRef = ref(storage, storagePath);

  const snapshot = await uploadBytes(fileRef, file, {
    contentType: file.type || 'image/jpeg',
  });

  const downloadUrl = await getDownloadURL(snapshot.ref);

  const pageDocRef = doc(collection(db, `books/${bookId}/pages`));
  const pageData = {
    id: pageDocRef.id,
    bookId,
    pageNumber,
    image: downloadUrl,
    storagePath,
    createdAt: Date.now(),
  };

  await setDoc(pageDocRef, pageData);
  return pageData;
}
