import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pb, getBookCoverUrl } from './lib/pocketbase';
import CabinLanding from './components/CabinLanding';
import SpineBookshelf from './components/SpineBookshelf';
import CoverGalleryView from './components/CoverGalleryView';
import ListView from './components/ListView';
import ReaderModal from './components/ReaderModal';
import AddBookModal from './components/AddBookModal';

// Complete festive starter library
const INITIAL_BOOKS = [
  { 
    id: '1', 
    title: 'Mice Skating', 
    author: 'Annie Silvestro', 
    cover: '/covers/mice-skating.jpg',
    notes: 'Illustrated by Teagan White • A cozy winter favorite',
    pages: [] 
  },
  { 
    id: '2', 
    title: 'The Polar Express', 
    author: 'Chris Van Allsburg', 
    cover: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=400&q=80',
    notes: 'Erin & family holiday tradition',
    pages: [] 
  },
  { 
    id: '3', 
    title: 'The Nutcracker', 
    author: 'E.T.A. Hoffmann', 
    cover: 'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?auto=format&fit=crop&w=400&q=80',
    notes: 'Classic holiday ballet tale',
    pages: [] 
  },
  { 
    id: '4', 
    title: 'How the Grinch Stole Christmas!', 
    author: 'Dr. Seuss', 
    cover: 'https://images.unsplash.com/photo-1512389142860-9c449e580543?auto=format&fit=crop&w=400&q=80',
    notes: 'Christmas Eve classic',
    pages: [] 
  },
  { 
    id: '5', 
    title: 'A Christmas Carol', 
    author: 'Charles Dickens', 
    cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    notes: 'Cozy fireplace ghost story',
    pages: [] 
  },
  { 
    id: '6', 
    title: 'The Gift of the Magi', 
    author: 'O. Henry', 
    cover: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=400&q=80',
    notes: 'A timeless story of giving',
    pages: [] 
  },
  { 
    id: '7', 
    title: 'Letters From Father Christmas', 
    author: 'J.R.R. Tolkien', 
    cover: 'https://images.unsplash.com/photo-1543258103-a62bdc069871?auto=format&fit=crop&w=400&q=80',
    notes: 'North Pole adventures',
    pages: [] 
  },
  { 
    id: '8', 
    title: 'The Night Before Christmas', 
    author: 'Clement Clarke Moore', 
    cover: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80',
    notes: 'Read every year before bed',
    pages: [] 
  },
  { 
    id: '9', 
    title: 'Miracle on 34th Street', 
    author: 'Valentine Davies', 
    cover: 'https://images.unsplash.com/photo-1512474932049-78ac69ede12c?auto=format&fit=crop&w=400&q=80',
    notes: 'Believing in the magic of Christmas',
    pages: [] 
  },
  { 
    id: '10', 
    title: 'The Little Match Girl', 
    author: 'Hans Christian Andersen', 
    cover: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?auto=format&fit=crop&w=400&q=80',
    notes: 'New Year Eve tale',
    pages: [] 
  },
  { 
    id: '11', 
    title: 'The Tailor of Gloucester', 
    author: 'Beatrix Potter', 
    cover: 'https://images.unsplash.com/photo-1545645312-70b9255651c6?auto=format&fit=crop&w=400&q=80',
    notes: 'Simpkin and the holiday mice',
    pages: [] 
  },
  { 
    id: '12', 
    title: 'The Fir Tree', 
    author: 'Hans Christian Andersen', 
    cover: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=400&q=80',
    notes: 'Pine forest winter story',
    pages: [] 
  },
  { 
    id: '13', 
    title: 'The Cricket on the Hearth', 
    author: 'Charles Dickens', 
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80',
    notes: 'A holiday hearthside classic',
    pages: [] 
  },
  { 
    id: '14', 
    title: 'Winter Holiday Tales', 
    author: 'Vintage Keepsake Collection', 
    cover: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=400&q=80',
    notes: 'Stories by the fire',
    pages: [] 
  },
];

export default function App() {
  const [isAtBookshelf, setIsAtBookshelf] = useState(false);
  const [viewMode, setViewMode] = useState('spines'); // 'spines' | 'covers' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState(() => {
    try {
      const saved = localStorage.getItem('erin_christmas_books');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_BOOKS;
  });
  const [selectedBook, setSelectedBook] = useState(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Sync with PocketBase on launch if available
  useEffect(() => {
    async function loadBooks() {
      try {
        const records = await pb.collection('books').getFullList({
          sort: 'sort_order,-created',
        });
        if (records.length > 0) {
          setBooks(records);
        }
      } catch (err) {
        // PocketBase offline, keep local collection
        console.info('Loaded local Christmas bookshelf');
      }
    }
    loadBooks();
  }, []);

  // Save to localStorage whenever books change (survives phone browser refreshes)
  useEffect(() => {
    try {
      localStorage.setItem('erin_christmas_books', JSON.stringify(books));
    } catch (e) {}
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
    try {
      await pb.collection('books').delete(bookId);
    } catch (e) {
      // Local fallback
    }
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    setSelectedBook(null);
  };

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
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
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
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
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
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 text-white rounded-xl text-xs font-sans font-medium transition shadow flex items-center gap-1.5"
                  >
                    <span>+</span> <span>Add Book</span>
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

                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-3 py-1 bg-gradient-to-r from-amber-700 to-amber-800 text-white rounded-lg text-xs font-sans font-semibold shadow flex items-center gap-1 active:scale-95"
                  >
                    <span>+</span> <span>Add</span>
                  </button>
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
                  onAddBook={() => setIsAddModalOpen(true)}
                />
              )}

              {viewMode === 'covers' && (
                <CoverGalleryView
                  books={filteredBooks}
                  onSelectBook={(book) => setSelectedBook(book)}
                  onAddBook={() => setIsAddModalOpen(true)}
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
        onClose={() => setIsAddModalOpen(false)}
        onBookAdded={handleBookAdded}
      />
    </div>
  );
}
