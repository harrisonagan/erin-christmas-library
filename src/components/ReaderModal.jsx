import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { compressImage } from '../lib/imageCompressor';
import { pb, getPageImageUrl } from '../lib/pocketbase';
import { savePagesForBook, getPagesForBook } from '../lib/idbStorage';
import { isFirebaseConfigured, uploadPageToCloud } from '../lib/firebase';

export default function ReaderModal({ book, onClose, onUpdateBook }) {
  const [pages, setPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef(null);

  // Fetch pages from PocketBase or local IndexedDB for this book/album
  useEffect(() => {
    async function loadPages() {
      try {
        setLoading(true);
        // 1. Try PocketBase
        const records = await pb.collection('book_pages').getFullList({
          filter: `book = "${book.id}"`,
          sort: 'page_number',
        });
        
        if (records.length > 0) {
          setPages(records);
          return;
        }
      } catch (err) {
        // PocketBase offline
      }

      // 2. Try IndexedDB persistent storage
      const idbPages = await getPagesForBook(book.id);
      if (idbPages && idbPages.length > 0) {
        setPages(idbPages);
        setLoading(false);
        return;
      }

      // 3. Fallback to book.pages
      setPages(book.pages || []);
      setLoading(false);
    }
    loadPages();
  }, [book.id]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageIndex, pages.length]);

  const goToNext = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  // Batch upload page photos with client-side compression
  const handlePageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    const newPages = [...pages];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Compressing & uploading page ${i + 1} of ${files.length}...`);
        
        // 1. Client-side compress down to 1600px WebP (from 6MB -> ~200KB)
        const compressed = await compressImage(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.84 });

        // 2. Upload to Google Firebase Storage if configured
        let pageUploaded = false;
        if (isFirebaseConfigured()) {
          try {
            const pageData = await uploadPageToCloud(compressed, book.id, newPages.length + 1);
            newPages.push(pageData);
            pageUploaded = true;
          } catch (cloudErr) {
            console.warn('Firebase page upload failed:', cloudErr);
          }
        }

        // 3. Fallback: PocketBase or Local IndexedDB Data URL
        if (!pageUploaded) {
          try {
            const formData = new FormData();
            formData.append('book', book.id);
            formData.append('page_number', newPages.length + 1);
            formData.append('image', compressed);

            const record = await pb.collection('book_pages').create(formData);
            newPages.push(record);
          } catch (pbErr) {
            const localDataUrl = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(compressed);
            });

            newPages.push({
              id: 'local_' + Date.now() + '_' + i,
              page_number: newPages.length + 1,
              image: localDataUrl,
            });
          }
        }
      }

      setPages(newPages);
      await savePagesForBook(book.id, newPages);

      if (onUpdateBook) {
        onUpdateBook({ ...book, pages: newPages });
      }
    } catch (err) {
      console.error('Failed uploading pages:', err);
      alert('Could not upload pages: ' + err.message);
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const currentPage = pages[currentPageIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between text-stone-100 select-none"
    >
      {/* Top Bar: Title & Controls */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800/80 bg-stone-950/80">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 transition"
            title="Close (Esc)"
          >
            ✕
          </button>
          <div>
            <h2 className="text-base font-serif font-bold text-amber-200 line-clamp-1">{book.title}</h2>
            <p className="text-xs text-stone-400 font-sans">{book.author}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {pages.length > 0 && (
            <div className="px-3 py-1 bg-stone-900 border border-stone-800 rounded-full text-xs font-mono text-amber-300/90">
              Page {currentPageIndex + 1} of {pages.length}
            </div>
          )}

          {/* Add/Upload More Pages button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePageUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-700 text-white rounded-lg text-xs font-sans font-medium transition shadow flex items-center gap-1.5"
          >
            <span>📷</span>
            <span className="hidden sm:inline">{isUploading ? 'Uploading...' : 'Add Pages'}</span>
          </button>
        </div>
      </div>

      {/* Main Reading Stage */}
      <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
        {loading ? (
          <div className="text-center font-sans text-stone-400">
            <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Opening storybook...</p>
          </div>
        ) : isUploading ? (
          <div className="text-center font-sans text-stone-300 bg-stone-900/90 p-8 rounded-2xl border border-amber-900/50 shadow-2xl">
            <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-amber-200">{uploadProgress}</p>
            <p className="text-xs text-stone-400 mt-1">Compressing photos for fast loading...</p>
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center max-w-md p-8 bg-stone-900/60 rounded-3xl border border-stone-800">
            <span className="text-5xl block mb-3">📖</span>
            <h3 className="text-xl font-serif text-amber-100 mb-2">No Pages Uploaded Yet</h3>
            <p className="text-xs text-stone-400 mb-6 font-sans">
              Snap photos of the storybook pages using your iPad or iPhone camera.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 bg-amber-700 hover:bg-amber-600 text-white rounded-xl text-sm font-sans font-medium shadow-lg transition"
            >
              Take or Select Photos 📷
            </button>
          </div>
        ) : (
          /* Swipeable Page Container */
          <div className="relative w-full h-full max-w-4xl flex items-center justify-center">
            {/* Left Tap Zone / Arrow */}
            {currentPageIndex > 0 && (
              <button
                onClick={goToPrev}
                className="absolute left-2 z-20 w-12 h-12 hidden md:flex items-center justify-center rounded-full bg-stone-900/70 hover:bg-stone-800 text-stone-200 border border-stone-700 shadow-xl transition"
                title="Previous Page (←)"
              >
                ◀
              </button>
            )}

            {/* Current Page with Touch Drag Gesture */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPageIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipeThreshold = 50;
                  if (offset.x < -swipeThreshold || velocity.x < -400) {
                    goToNext();
                  } else if (offset.x > swipeThreshold || velocity.x > 400) {
                    goToPrev();
                  }
                }}
                className="relative max-h-full max-w-full flex items-center justify-center cursor-grab active:cursor-grabbing"
              >
                <img
                  src={getPageImageUrl(currentPage)}
                  alt={`Page ${currentPageIndex + 1}`}
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-2xl border border-stone-800"
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>

            {/* Right Tap Zone / Arrow */}
            {currentPageIndex < pages.length - 1 && (
              <button
                onClick={goToNext}
                className="absolute right-2 z-20 w-12 h-12 hidden md:flex items-center justify-center rounded-full bg-stone-900/70 hover:bg-stone-800 text-stone-200 border border-stone-700 shadow-xl transition"
                title="Next Page (→)"
              >
                ▶
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Thumbnail Filmstrip */}
      {pages.length > 1 && (
        <div className="px-6 py-3 bg-stone-950/80 border-t border-stone-800/80 flex items-center justify-center gap-2 overflow-x-auto">
          {pages.map((p, idx) => (
            <button
              key={p.id || idx}
              onClick={() => setCurrentPageIndex(idx)}
              className={`relative flex-shrink-0 w-10 h-14 rounded overflow-hidden border-2 transition ${
                currentPageIndex === idx
                  ? 'border-amber-500 scale-105 shadow-md shadow-amber-500/20'
                  : 'border-stone-800 opacity-50 hover:opacity-100'
              }`}
            >
              <img
                src={getPageImageUrl(p)}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
