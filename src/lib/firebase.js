/**
 * Google Firebase Cloud, Google Auth & Firebase AI Integration
 * Provides Google Sign-In, Gemini AI cover analysis, and real-time Cloud Firestore & Storage sync.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
} from 'firebase/ai';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
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
export const BUILTIN_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCXYPszHhNfFMPdt26XNKL69E4uF17QJSU",
  authDomain: "erins-christmas-library.firebaseapp.com",
  projectId: "erins-christmas-library",
  storageBucket: "erins-christmas-library.firebasestorage.app",
  messagingSenderId: "721482968668",
  appId: "1:721482968668:web:bcaeaae2aaeb3046110099",
  measurementId: "G-BSBNXKL34N"
};

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
let auth = null;
let db = null;
let storage = null;

export function isFirebaseConfigured() {
  const config = getFirebaseConfig();
  return Boolean(config && config.projectId);
}

export function initFirebase() {
  if (db && storage && auth) return { app, auth, db, storage };
  const config = getFirebaseConfig();
  if (!config) return { app: null, auth: null, db: null, storage: null };

  try {
    app = getApps().length === 0 ? initializeApp(config) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    if (typeof window !== 'undefined') {
      try {
        enableIndexedDbPersistence(db).catch(() => {});
      } catch (e) {}
    }

    return { app, auth, db, storage };
  } catch (err) {
    console.warn('Firebase init error:', err);
    return { app: null, auth: null, db: null, storage: null };
  }
}

export function saveFirebaseConfig(configObj) {
  if (typeof window !== 'undefined') {
    if (configObj) {
      localStorage.setItem('erin_firebase_config', JSON.stringify(configObj));
    } else {
      localStorage.removeItem('erin_firebase_config');
    }
    app = null;
    auth = null;
    db = null;
    storage = null;
  }
}

// Allowed Google accounts that can access Erin's Christmas Library
export const ALLOWED_EMAILS = [
  'harrisonagan@gmail.com',
  'erinagan90@gmail.com',
];

export function isAuthorizedUser(user) {
  if (!user || !user.email) return false;
  return ALLOWED_EMAILS.includes(user.email.trim().toLowerCase());
}

/**
 * Google Sign-In via Firebase Auth.
 * Restricted strictly to ALLOWED_EMAILS (harrisonagan@gmail.com).
 */
export async function signInWithGoogle() {
  const { auth: firebaseAuth } = initFirebase();
  if (!firebaseAuth) throw new Error('Firebase Auth is not initialized');

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const result = await signInWithPopup(firebaseAuth, provider);
    if (!isAuthorizedUser(result.user)) {
      const triedEmail = result.user?.email || 'unknown account';
      await signOut(firebaseAuth);
      const err = new Error(`Access denied for ${triedEmail}. This library is restricted to authorized accounts only.`);
      err.code = 'auth/unauthorized-email';
      throw err;
    }

    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken || null;
    if (accessToken && typeof window !== 'undefined') {
      sessionStorage.setItem('erin_google_access_token', accessToken);
      localStorage.setItem('erin_google_access_token', accessToken);
    }
    return { user: result.user, accessToken };
  } catch (err) {
    if (err?.code === 'auth/popup-blocked') {
      await signInWithRedirect(firebaseAuth, provider);
      return null;
    }
    throw err;
  }
}

export async function checkGoogleRedirectResult() {
  const { auth: firebaseAuth } = initFirebase();
  if (!firebaseAuth) return null;
  try {
    const result = await getRedirectResult(firebaseAuth);
    if (result?.user) {
      if (!isAuthorizedUser(result.user)) {
        const triedEmail = result.user?.email || 'unknown account';
        await signOut(firebaseAuth);
        throw new Error(`Access denied for ${triedEmail}.`);
      }
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken || null;
      if (accessToken && typeof window !== 'undefined') {
        sessionStorage.setItem('erin_google_access_token', accessToken);
        localStorage.setItem('erin_google_access_token', accessToken);
      }
      return result.user;
    }
  } catch (e) {
    console.warn('Redirect auth check warning:', e);
    throw e;
  }
  return null;
}

export function subscribeToAuthChanges(callback) {
  const { auth: firebaseAuth } = initFirebase();
  if (!firebaseAuth) return () => {};
  return onAuthStateChanged(firebaseAuth, async (user) => {
    if (user && !isAuthorizedUser(user)) {
      await signOut(firebaseAuth);
      callback(null);
      return;
    }
    callback(user);
  });
}

export async function signOutGoogle() {
  const { auth: firebaseAuth } = initFirebase();
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('erin_google_access_token');
    localStorage.removeItem('erin_google_access_token');
  }
  if (firebaseAuth) {
    await signOut(firebaseAuth);
  }
}

export function getGoogleAccessToken() {
  if (typeof window === 'undefined') return null;
  return (
    sessionStorage.getItem('erin_google_access_token') ||
    localStorage.getItem('erin_google_access_token') ||
    null
  );
}

/**
 * Calls Firebase AI (GoogleAIBackend) with the initialized Firebase app & signed-in user.
 */
export async function analyzeBookCoverWithFirebaseAI(base64Data, mimeType, prompt) {
  const { app: firebaseApp } = initFirebase();
  if (!firebaseApp) throw new Error('Firebase app not initialized');

  const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });
  const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash'];

  let lastErr = null;
  for (const modelName of candidateModels) {
    try {
      const model = getGenerativeModel(ai, {
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType || 'image/jpeg',
          },
        },
      ]);
      const text = result.response.text();
      if (text) return text;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error('Firebase AI call failed');
}

/**
 * Uploads a book cover image to Google Firebase Cloud Storage.
 */
export async function uploadCoverToCloud(file, bookId) {
  const { storage: fbStorage } = initFirebase();
  if (!fbStorage) throw new Error('Firebase Storage not configured');

  const fileExt = file.type === 'image/webp' ? 'webp' : file.type === 'image/png' ? 'png' : 'jpg';
  const storagePath = `covers/${bookId}_${Date.now()}.${fileExt}`;
  const fileRef = ref(fbStorage, storagePath);

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
  const { db: fbDb } = initFirebase();
  if (!fbDb) throw new Error('Firestore not configured');

  const docRef = doc(fbDb, 'books', String(book.id));
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
  const { db: fbDb, storage: fbStorage } = initFirebase();
  if (!fbDb) return;

  try {
    await deleteDoc(doc(fbDb, 'books', String(bookId)));
  } catch (e) {
    console.warn('Error deleting book doc:', e);
  }

  if (fbStorage && coverStoragePath) {
    try {
      const fileRef = ref(fbStorage, coverStoragePath);
      await deleteObject(fileRef);
    } catch (e) {
      console.warn('Error deleting cover image from storage:', e);
    }
  }
}

/**
 * Real-time listener for all books in Google Cloud Firestore.
 */
export function subscribeToBooksFromCloud(onBooksChanged) {
  const { db: fbDb } = initFirebase();
  if (!fbDb) return null;

  try {
    const q = query(collection(fbDb, 'books'), orderBy('createdAt', 'desc'));
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
  const { storage: fbStorage, db: fbDb } = initFirebase();
  if (!fbStorage || !fbDb) throw new Error('Firebase not configured');

  const fileExt = file.type === 'image/webp' ? 'webp' : 'jpg';
  const storagePath = `pages/${bookId}/${pageNumber}_${Date.now()}.${fileExt}`;
  const fileRef = ref(fbStorage, storagePath);

  const snapshot = await uploadBytes(fileRef, file, {
    contentType: file.type || 'image/jpeg',
  });

  const downloadUrl = await getDownloadURL(snapshot.ref);

  const pageDocRef = doc(collection(fbDb, `books/${bookId}/pages`));
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
