import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pb, getBookCoverUrl } from './lib/pocketbase';
import { saveBooksToIndexedDB, getBooksFromIndexedDB } from './lib/idbStorage';
import { isFirebaseConfigured, subscribeToBooksFromCloud, deleteBookFromCloud } from './lib/firebase';
import CabinLanding from './components/CabinLanding';
import SpineBookshelf from './components/SpineBookshelf';
import CoverGalleryView from './components/CoverGalleryView';
import ListView from './components/ListView';
import ReaderModal from './components/ReaderModal';
import AddBookModal from './components/AddBookModal';
import CloudBackupModal from './components/CloudBackupModal';

// Curated Authentic Family Christmas Library (Placeholders Removed)
const INITIAL_BOOKS = [
  { 
    id: '1', 
    title: 'Mice Skating', 
    author: 'Annie Silvestro', 
    category: 'story',
    cover: '/covers/mice-skating.jpg',
    notes: 'Illustrated by Teagan White • A cozy winter favorite',
    pages: [] 
  },
  { 
    id: 'santas_moose', 
    title: "Santa's Moose", 
    author: 'Syd Hoff', 
    category: 'story',
    cover: '/covers/santas-moose.webp',
    notes: 'An Early I Can Read Book • A classic holiday tale',
    pages: [] 
  },
  { 
    id: 'the_mitten', 
    title: 'The Mitten', 
    author: 'Jan Brett', 
    category: 'story',
    cover: '/covers/the-mitten.webp',
    notes: 'Adapted and illustrated by Jan Brett • Ukrainian Folktale',
    pages: [] 
  },
  { 
    id: 'one_snowy_night', 
    title: 'One Snowy Night', 
    author: 'M. Christina Butler', 
    category: 'story',
    cover: '/covers/one-snowy-night.webp',
    notes: 'Illustrated by Tina Macnaughton • A Touch-and-Feel Book',
    pages: [] 
  },
  { 
    id: 'night_before_christmas', 
    title: 'The Night Before Christmas', 
    author: 'Clement C. Moore', 
    category: 'story',
    cover: '/covers/the-night-before-christmas.webp',
    notes: 'Illustrations by Tom Browning • Read every Christmas Eve',
    pages: [] 
  },
  { 
    id: 'chickadees_in_december', 
    title: 'Chickadees In December', 
    author: 'Bill O. Smith', 
    category: 'story',
    cover: '/covers/chickadees-in-december.webp',
    notes: 'Illustrated by Charles R. Murphy • Heartwarming winter story',
    pages: [] 
  },
  { 
    id: 'santa_in_michigan', 
    title: 'Santa is coming to Michigan', 
    author: 'Steve Smallman', 
    category: 'story',
    cover: '/covers/santa-is-coming-to-michigan.webp',
    notes: 'Illustrated by Robert Dunn and Jim Mitchell • Great Lakes holiday adventure',
    pages: [] 
  },
  // Family Photo Albums
  {
    id: 'album_santa',
    title: 'Pictures with Santa',
    author: 'Agan Family Keepsake',
    category: 'album',
    cover: 'https://images.unsplash.com/photo-1543258103-a62bdc069871?auto=format&fit=crop&w=400&q=80',
    notes: 'Our annual keepsake album of all our pictures with Santa Claus 🎅 (Upload Apple Photos here!)',
    pages: [],
  },
  // Family Cookbooks & Keepsakes
  {
    id: 'cookbook_erin',
    title: "Erin's Family Cookbook",
    author: 'Holiday Recipes & Traditions',
    category: 'cookbook',
    cover: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=400&q=80',
    notes: 'Treasured family recipes, Christmas morning traditions & sweet holiday treats 🥧',
    pages: [],
  },
];

export default function App() {
  // Session-based access control so closing the browser requires re-entry
  const [isUnlocked, setIsUnlocked] = useState(() => {
    try {
      const session = sessionStorage.getItem('erin_library_access_unlocked');
      const local = localStorage.getItem('erin_library_access_unlocked');
      return session === 'true' || local === 'true';
    } catch {
      return false;
    }
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [currentSecretPasscode, setCurrentSecretPasscode] = useState(() => {
    try {
      return localStorage.getItem('erin_library_passcode') || '1225';
    } catch {
      return '1225';
    }
  });

  const [isAtBookshelf, setIsAtBookshelf] = useState(false);
  const [viewMode, setViewMode] = useState('spines'); // 'spines' | 'covers' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(isFirebaseConfigured());

  const LEGACY_PLACEHOLDERS = new Set(['2','3','4','5','6','7','8','9','10','11','12','13','14','album_2024','album_2023']);

  const [books, setBooks] = useState(() => {
    try {
      const saved = localStorage.getItem('erin_christmas_books');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clean out legacy placeholders
        const cleaned = parsed.filter(b => !LEGACY_PLACEHOLDERS.has(String(b.id)));
        const existingIds = new Set(cleaned.map((b) => b.id));
        const missing = INITIAL_BOOKS.filter((b) => !existingIds.has(b.id));
        return [...cleaned, ...missing];
      }
    } catch (e) {}
    return INITIAL_BOOKS;
  });
  const [selectedBook, setSelectedBook] = useState(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalCategory, setAddModalCategory] = useState('story');

  const handleUnlock = (e) => {
    e?.preventDefault();
    if (passcodeInput.trim() === currentSecretPasscode.trim()) {
      setIsUnlocked(true);
      try {
        sessionStorage.setItem('erin_library_access_unlocked', 'true');
        if (rememberDevice) {
          localStorage.setItem('erin_library_access_unlocked', 'true');
        } else {
          localStorage.removeItem('erin_library_access_unlocked');
        }
      } catch {}
      setPasscodeError('');
      setPasscodeInput('');
    } else {
      setPasscodeError('Incorrect passcode. Please try again.');
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    try {
      sessionStorage.removeItem('erin_library_access_unlocked');
      localStorage.removeItem('erin_library_access_unlocked');
    } catch {}
  };

  // 1. Load from IndexedDB on launch (immune to 5MB localStorage limit!)
  useEffect(() => {
    async function loadIndexedDBBooks() {
      try {
        const stored = await getBooksFromIndexedDB();
        if (stored && Array.isArray(stored) && stored.length > 0) {
          const cleaned = stored.filter(b => !LEGACY_PLACEHOLDERS.has(String(b.id)));
          setBooks((current) => {
            const currentCleaned = current.filter(b => !LEGACY_PLACEHOLDERS.has(String(b.id)));
            const storedIds = new Set(cleaned.map((b) => b.id));
            const missing = currentCleaned.filter((b) => !storedIds.has(b.id));
            const merged = [...cleaned, ...missing];
            saveBooksToIndexedDB(merged);
            return merged;
          });
        }
      } catch (err) {
        console.warn('Error reading from IndexedDB:', err);
      }
    }
    loadIndexedDBBooks();
  }, []);

  // 2. Real-time Google Firebase sync across all devices
  useEffect(() => {
    if (isFirebaseConfigured()) {
      setIsCloudConnected(true);
      const unsubscribe = subscribeToBooksFromCloud((cloudBooks) => {
        if (cloudBooks && cloudBooks.length > 0) {
          setBooks((current) => {
            const cloudIds = new Set(cloudBooks.map((b) => b.id));
            const localOnly = current.filter((b) => !cloudIds.has(b.id) && String(b.id).startsWith('local_'));
            const merged = [...cloudBooks, ...localOnly];
            saveBooksToIndexedDB(merged);
            return merged;
          });
        }
      });
      return () => unsubscribe && unsubscribe();
    } else {
      setIsCloudConnected(false);
    }
  }, [isCloudConnected]);

  // 3. Save to IndexedDB whenever books change (survives phone refreshes & has gigabytes of storage)
  useEffect(() => {
    saveBooksToIndexedDB(books);
    try {
      localStorage.setItem('erin_christmas_books', JSON.stringify(books));
    } catch (e) {
      // Expected if base64 images exceed 5MB quota; IndexedDB already saved it safely!
    }
  }, [books]);

  const filteredBooks = books.filter((b) =>
    (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.author || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookAdded = (newBook) => {
    setBooks((prev) => [newBook, ...prev]);
  };

  const handleDeleteBook = async (bookId) => {
    if (!confirm('Remove this book from Erin\'s Christmas shelf?')) return;
    const target = books.find((b) => b.id === bookId);
    if (isFirebaseConfigured()) {
      try {
        await deleteBookFromCloud(bookId, target?.coverStoragePath);
      } catch (e) {
        console.warn('Cloud delete error:', e);
      }
    }
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    setSelectedBook(null);
  };

  const handleBooksRestored = (restoredBooks) => {
    setBooks(restoredBooks);
    saveBooksToIndexedDB(restoredBooks);
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#0d0907] text-amber-50 select-none flex items-center justify-center p-4 relative overflow-hidden font-serif">
        {/* Ambient Candle Glow */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-600/10 blur-[140px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative max-w-sm w-full bg-[#18110df6] backdrop-blur-md rounded-3xl border border-amber-900/60 p-7 sm:p-8 text-center shadow-[0_25px_60px_rgba(0,0,0,0.95)] z-10"
        >
          <div className="flex items-center justify-center gap-2 mb-2 text-amber-400">
            <span>🕯️</span>
            <span className="text-[10px] uppercase tracking-widest font-sans font-semibold text-amber-300/80">
              Private Holiday Collection
            </span>
            <span>🕯️</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-amber-100 mb-2">
            Erin's Christmas Library
          </h1>

          <p className="text-stone-300 text-xs font-sans mb-6 leading-relaxed">
            This library is currently restricted for private curation. Please enter your passcode:
          </p>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <input
                type="password"
                autoFocus
                placeholder="Enter passcode"
                value={passcodeInput}
                onChange={(e) => {
                  setPasscodeInput(e.target.value);
                  setPasscodeError('');
                }}
                className="w-full px-4 py-3 bg-stone-950/90 border border-stone-800 rounded-xl text-center text-sm font-sans tracking-widest text-amber-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-600"
              />
            </div>

            {passcodeError && (
              <p className="text-xs text-rose-400 font-sans">{passcodeError}</p>
            )}

            <div className="flex items-center justify-center gap-2 pt-1">
              <label className="flex items-center gap-2 text-xs font-sans text-stone-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="rounded border-stone-800 bg-stone-950 text-amber-600 focus:ring-0 cursor-pointer"
                />
                <span>Remember me on this browser</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 text-amber-50 font-sans font-semibold text-sm rounded-xl shadow-lg border border-amber-500/40 transition active:scale-95"
            >
              Unlock Library 🗝️
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#110c09] text-amber-50 select-none overflow-x-hidden font-serif">
      <AnimatePresence mode="wait">
        {!isAtBookshelf ? (
          /* ========================================================= */
          /* 1. SITTING IN THE COZY CABIN LANDING SCENE                */
          /* ========================================================= */
          <motion.div
            key="cabin-landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.85, ease: 'easeInOut' } }}
            className="w-screen h-screen overflow-hidden"
          >
            <CabinLanding onStepUp={() => setIsAtBookshelf(true)} />
          </motion.div>
        ) : (
          /* ========================================================= */
          /* 2. STANDING AT THE BOOKSHELF & VIEWS                      */
          /* ========================================================= */
          <motion.div
            key="bookshelf-area"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-screen flex flex-col bg-[#140e0b] relative pb-20"
            style={{
              backgroundImage: 'radial-gradient(ellipse at 50% 0%, #2a160c 0%, #140e0b 70%)',
            }}
          >
            {/* Ambient Warm Candlelight Glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-amber-600/10 blur-[130px] pointer-events-none" />

            {/* Responsive Navigation Header */}
            <header className="sticky top-0 z-30 bg-[#1b130f]/95 backdrop-blur-md border-b border-amber-950/70 shadow-lg px-4 sm:px-8 py-3">
              {/* Desktop Header Layout */}
              <div className="hidden md:flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAtBookshelf(false)}
                    className="px-3 py-1.5 bg-stone-900/80 hover:bg-stone-800 border border-stone-800 rounded-lg text-xs font-sans text-amber-200/80 hover:text-amber-100 transition flex items-center gap-1.5"
                    title="Step back to sit by the fire"
                  >
                    <span>←</span> <span>Cabin Hearth</span>
                  </button>
                  <span className="text-stone-700">|</span>
                  <h2 className="text-base font-bold text-amber-100 tracking-wide flex items-center gap-2">
                    <span>🎄</span> <span>Erin's Christmas Library</span>
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3.5 py-1.5 bg-stone-950/80 border border-stone-800 rounded-lg text-xs text-amber-100 focus:outline-none focus:border-amber-700 w-44 font-sans placeholder:text-stone-500"
                  />

                  <div className="flex bg-stone-950/80 p-0.5 rounded-lg border border-stone-800 font-sans text-xs">
                    <button
                      onClick={() => setViewMode('spines')}
                      className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                        viewMode === 'spines'
                          ? 'bg-amber-800/80 text-amber-100 font-medium shadow'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span>🪵</span> <span>Shelf</span>
                    </button>
                    <button
                      onClick={() => setViewMode('covers')}
                      className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                        viewMode === 'covers'
                          ? 'bg-amber-800/80 text-amber-100 font-medium shadow'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span>🖼️</span> <span>Covers</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                        viewMode === 'list'
                          ? 'bg-amber-800/80 text-amber-100 font-medium shadow'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span>📋</span> <span>List</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setIsCloudModalOpen(true)}
                    className="px-3 py-1.5 bg-stone-900/80 hover:bg-stone-800 border border-stone-800 rounded-lg text-xs font-sans text-stone-300 hover:text-amber-200 transition flex items-center gap-1.5"
                    title="Cloud Sync & Backup"
                  >
                    <span>☁️</span>
                    <span className="hidden lg:inline">{isCloudConnected ? 'Cloud Active' : 'Cloud Backup'}</span>
                  </button>

                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 text-white rounded-xl text-xs font-sans font-medium transition shadow flex items-center gap-1.5"
                  >
                    <span>+</span> <span>Add Book</span>
                  </button>

                  <button
                    onClick={handleLock}
                    className="px-3 py-2 bg-stone-900/80 hover:bg-stone-800 border border-stone-800 rounded-xl text-xs font-sans text-stone-400 hover:text-amber-200 transition flex items-center gap-1"
                    title="Lock library"
                  >
                    <span>🔒</span> <span>Lock</span>
                  </button>
                </div>
              </div>

              {/* Mobile Header Layout (2 Rows, Never Cuts Off "+ Add Book") */}
              <div className="flex flex-col gap-2.5 md:hidden">
                {/* Row 1: Back, Title, Add Book */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setIsAtBookshelf(false)}
                    className="px-2.5 py-1 bg-stone-900 border border-stone-800 rounded-lg text-xs font-sans text-amber-200/80 flex items-center gap-1"
                  >
                    <span>←</span> <span>Cabin</span>
                  </button>

                  <h2 className="text-sm font-bold text-amber-100 truncate px-2">
                    🎄 Erin's Library
                  </h2>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsCloudModalOpen(true)}
                      className="px-2 py-1 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-300 hover:text-amber-200"
                      title="Cloud Sync & Backup"
                    >
                      ☁️
                    </button>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-3 py-1 bg-gradient-to-r from-amber-700 to-amber-800 text-white rounded-lg text-xs font-sans font-semibold shadow flex items-center gap-1 active:scale-95"
                    >
                      <span>+</span> <span>Add</span>
                    </button>
                    <button
                      onClick={handleLock}
                      className="px-2 py-1 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-400 hover:text-amber-200"
                      title="Lock library"
                    >
                      🔒
                    </button>
                  </div>
                </div>

                {/* Row 2: Search & View Switcher */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-stone-950/80 border border-stone-800 rounded-lg text-xs text-amber-100 focus:outline-none focus:border-amber-700 font-sans placeholder:text-stone-500"
                  />

                  <div className="flex bg-stone-950/80 p-0.5 rounded-lg border border-stone-800 font-sans text-xs flex-shrink-0">
                    <button
                      onClick={() => setViewMode('spines')}
                      className={`px-2.5 py-1 rounded-md transition ${
                        viewMode === 'spines' ? 'bg-amber-800 text-amber-100 font-semibold' : 'text-stone-400'
                      }`}
                      title="Shelf Spines"
                    >
                      🪵
                    </button>
                    <button
                      onClick={() => setViewMode('covers')}
                      className={`px-2.5 py-1 rounded-md transition ${
                        viewMode === 'covers' ? 'bg-amber-800 text-amber-100 font-semibold' : 'text-stone-400'
                      }`}
                      title="Cover Gallery"
                    >
                      🖼️
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-2.5 py-1 rounded-md transition ${
                        viewMode === 'list' ? 'bg-amber-800 text-amber-100 font-semibold' : 'text-stone-400'
                      }`}
                      title="List View"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
            </header>

            {/* Floating Quick-Add Button on Mobile (Always within thumb reach) */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="md:hidden fixed bottom-6 right-6 z-30 px-4 py-3 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.8)] border border-amber-400/40 font-sans text-xs font-semibold flex items-center gap-2 active:scale-95"
            >
              <span>📸</span>
              <span>+ Add Book</span>
            </button>

            {/* Main Stage Content */}
            <main className="flex-1 w-full">
              {viewMode === 'spines' && (
                <SpineBookshelf
                  books={filteredBooks}
                  onSelectBook={(book) => setSelectedBook(book)}
                  onAddBook={(cat) => {
                    setAddModalCategory(cat || 'story');
                    setIsAddModalOpen(true);
                  }}
                />
              )}

              {viewMode === 'covers' && (
                <CoverGalleryView
                  books={filteredBooks}
                  onSelectBook={(book) => setSelectedBook(book)}
                  onAddBook={() => {
                    setAddModalCategory('story');
                    setIsAddModalOpen(true);
                  }}
                />
              )}

              {viewMode === 'list' && (
                <ListView
                  books={filteredBooks}
                  onSelectBook={(book) => setSelectedBook(book)}
                  onDeleteBook={handleDeleteBook}
                />
              )}
            </main>

            {/* Book Detail Inspector Showcase Modal */}
            {selectedBook && (
              <div 
                className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
                onClick={() => setSelectedBook(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#1c1511f8] border border-amber-900/60 rounded-3xl max-w-2xl sm:max-w-3xl w-full p-6 sm:p-9 shadow-[0_30px_70px_rgba(0,0,0,0.95)] relative font-sans text-amber-50 max-h-[92vh] overflow-y-auto my-auto"
                >
                  {/* Close button */}
                  <button
                    onClick={() => setSelectedBook(null)}
                    className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-300 border border-stone-800 transition text-lg z-20"
                    title="Close"
                  >
                    ✕
                  </button>

                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    {/* Large, Beautiful 3D Book Cover */}
                    <div className="relative flex-shrink-0 group">
                      <div className="relative w-56 sm:w-72 md:w-80 h-[330px] sm:h-[410px] md:h-[450px] rounded-r-xl rounded-l-sm shadow-[0_22px_45px_rgba(0,0,0,0.9),-8px_0_20px_rgba(0,0,0,0.6)] overflow-hidden border border-amber-950/60 bg-stone-900">
                        {/* Realistic 3D Hardcover Spine Highlight */}
                        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/60 via-white/15 to-transparent z-10 pointer-events-none" />

                        <img
                          src={getBookCoverUrl(selectedBook) || selectedBook.cover}
                          alt={selectedBook.title}
                          className="w-full h-full object-cover select-none"
                        />
                      </div>
                    </div>

                    {/* Book Details & Reading Actions */}
                    <div className="flex-1 text-center md:text-left flex flex-col justify-between self-stretch">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/60 border border-amber-900/50 rounded-full text-[11px] font-mono text-amber-300/90 mb-3">
                          <span>🎄</span>
                          <span>Erin's Holiday Collection</span>
                        </div>

                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-amber-100 tracking-wide leading-tight mb-2">
                          {selectedBook.title}
                        </h3>

                        <p className="text-stone-300 text-sm sm:text-base font-sans font-medium mb-4">
                          By <span className="text-amber-200">{selectedBook.author}</span>
                        </p>

                        {selectedBook.notes && (
                          <div className="text-amber-200/90 text-sm sm:text-base italic bg-amber-950/30 border border-amber-900/40 p-4 rounded-2xl mb-6 font-serif leading-relaxed text-left">
                            <span className="text-amber-400 font-serif text-lg mr-1">“</span>
                            {selectedBook.notes}
                            <span className="text-amber-400 font-serif text-lg ml-1">”</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-4 flex flex-col sm:flex-row gap-3 items-center">
                        <button
                          onClick={() => setIsReaderOpen(true)}
                          className="w-full sm:flex-1 py-3.5 px-6 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-amber-50 rounded-2xl text-sm font-semibold shadow-[0_8px_20px_rgba(180,83,9,0.4)] border border-amber-400/30 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                        >
                          <span className="text-lg">📖</span>
                          <span>Open Storybook & Read</span>
                        </button>

                        <button
                          onClick={() => handleDeleteBook(selectedBook.id)}
                          className="w-full sm:w-auto px-4 py-3.5 bg-stone-900/60 hover:bg-red-950/50 text-stone-400 hover:text-red-300 border border-stone-800 hover:border-red-900/60 rounded-2xl text-xs font-medium transition"
                          title="Remove from shelf"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipeable Page Reader Modal */}
      <AnimatePresence>
        {isReaderOpen && selectedBook && (
          <ReaderModal
            book={selectedBook}
            onClose={() => setIsReaderOpen(false)}
            onUpdateBook={(updated) => {
              setSelectedBook(updated);
              setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
            }}
          />
        )}
      </AnimatePresence>

      {/* Add Book with Camera & AI Modal */}
      <AddBookModal
        isOpen={isAddModalOpen}
        initialCategory={addModalCategory}
        onClose={() => setIsAddModalOpen(false)}
        onBookAdded={handleBookAdded}
      />

      {/* Cloud Backup & Firebase Settings Modal */}
      <CloudBackupModal
        isOpen={isCloudModalOpen}
        onClose={() => {
          setIsCloudModalOpen(false);
          setIsCloudConnected(isFirebaseConfigured());
        }}
        books={books}
        onBooksRestored={handleBooksRestored}
      />
    </div>
  );
}
