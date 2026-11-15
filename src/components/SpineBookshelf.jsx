import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBookCoverUrl } from '../lib/pocketbase';

export default function SpineBookshelf({ books = [], onSelectBook, onAddBook }) {
  const [hoveredBook, setHoveredBook] = useState(null);

  // Map each book in the collection to a realistic, vintage leather/cloth spine
  const styledBooks = books.map((b, idx) => {
    // Generate distinctive spine heights & widths so books look organic and real
    const heights = [225, 210, 235, 195, 220, 205, 240, 215];
    const widths = [44, 48, 42, 50, 40, 46, 38, 52]; // Comfortably readable widths
    const colors = [
      'from-[#6e1e24] via-[#4d1318] to-[#2e090d]', // Crimson leather
      'from-[#1c442d] via-[#13301f] to-[#0a1c12]', // Evergreen cloth
      'from-[#1b314d] via-[#112033] to-[#08121f]', // Midnight navy
      'from-[#54341f] via-[#3d2414] to-[#241309]', // Aged cognac
      'from-[#4c1d24] via-[#361318] to-[#1f090c]', // Deep burgundy
      'from-[#253f2c] via-[#1a2e20] to-[#0e1a12]', // Dark pine
      'from-[#3c2517] via-[#2a190f] to-[#180e08]', // Walnut leather
      'from-[#222e3d] via-[#161f2a] to-[#0b1016]', // Twilight slate
    ];

    return {
      ...b,
      isHighlighted: idx === 0 || Boolean(b.notes), // Spotlighted favorites (like Mice Skating!)
      color: colors[idx % colors.length],
      height: heights[idx % heights.length],
      width: widths[idx % widths.length],
      foil: idx % 2 === 0 ? 'gold' : 'silver',
    };
  });

  // Balance books evenly across Shelf I and Shelf II
  const half = Math.ceil(styledBooks.length / 2);
  const shelf1 = styledBooks.slice(0, half);
  const shelf2 = styledBooks.slice(half);

  const renderShelfRow = (items, shelfNum) => (
    <div 
      className="relative mb-16 sm:mb-20"
      onMouseLeave={() => setHoveredBook(null)} // Cleans up hover immediately on mouse leave
    >
      {/* Books standing side-by-side (smooth horizontal scroll on mobile) */}
      <div className="flex items-end justify-start sm:justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 overflow-x-auto pb-1 scrollbar-none">
        {items.map((book) => {
          const isHighlighted = book.isHighlighted;
          const isSelected = hoveredBook?.id === book.id;

          return (
            <div
              key={book.id}
              className="relative group cursor-pointer flex-shrink-0"
              onMouseEnter={() => setHoveredBook(book)}
              onClick={() => {
                setHoveredBook(null);
                onSelectBook(book); // Opens full detail showcase directly on tap/click
              }}
            >
              {/* Highlight ribbon / Holly star for special books */}
              {isHighlighted && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
                  <span className="text-xs animate-bounce">⭐</span>
                  <div className="w-1.5 h-4 bg-gradient-to-b from-amber-400 to-amber-600 rounded-b shadow" />
                </div>
              )}

              {/* Physical Book Spine */}
              <motion.div
                animate={isSelected ? {
                  y: -20,
                  z: 40,
                  rotateY: -8,
                  scale: 1.05,
                  transition: { type: 'spring', stiffness: 300, damping: 20 }
                } : isHighlighted ? {
                  y: -6,
                  transition: { duration: 0.3 }
                } : {
                  y: 0,
                  rotateY: 0,
                  scale: 1,
                  transition: { duration: 0.3 }
                }}
                style={{
                  height: `${book.height}px`,
                  width: `${book.width}px`,
                }}
                className={`relative rounded-t-sm shadow-[inset_-3px_0_6px_rgba(0,0,0,0.6),inset_3px_0_6px_rgba(255,255,255,0.1),-4px_4px_12px_rgba(0,0,0,0.85)] bg-gradient-to-r ${book.color} border-t border-r border-amber-950/40 flex flex-col justify-between items-center py-3 select-none transition-shadow group-hover:shadow-[0_12px_24px_rgba(251,191,36,0.35)]`}
              >
                {/* Vintage Leather Headband & Spine Ribs */}
                <div className="w-full h-1 bg-amber-500/20 border-b border-black/40" />
                <div className="w-full flex justify-between px-1 opacity-20">
                  <span className="w-full h-[1px] bg-amber-200" />
                </div>

                {/* Vertical Spine Title */}
                <div className="flex-1 flex items-center justify-center overflow-hidden py-1">
                  <span
                    className={`font-serif text-[11px] sm:text-xs font-bold tracking-wider uppercase text-center line-clamp-1 max-h-[140px] ${
                      book.foil === 'gold'
                        ? 'text-amber-200/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]'
                        : 'text-stone-200/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]'
                    }`}
                    style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                    }}
                  >
                    {book.title}
                  </span>
                </div>

                {/* Bottom Tailband & Keepsake Emblem */}
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[9px] text-amber-400 font-serif">🎄</span>
                  <div className="w-full h-1 bg-amber-500/20 border-t border-black/40" />
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Heavy Rustic Wooden Shelf Plank */}
      <div className="relative w-full h-7 bg-gradient-to-b from-[#442817] via-[#2f190c] to-[#190c05] border-t-2 border-[#784826] shadow-[0_14px_22px_rgba(0,0,0,0.95)] rounded-sm flex items-center px-4 sm:px-6 justify-between">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-amber-400/25 pointer-events-none" />
        <span className="text-[9px] sm:text-[10px] font-mono text-amber-200/40 uppercase tracking-widest truncate">
          {shelfNum === 1 ? 'Shelf I • Holiday Treasures' : 'Shelf II • Cherished Keepsakes'}
        </span>
        <span className="text-xs opacity-40">✨</span>
      </div>
    </div>
  );

  return (
    <div 
      className="relative min-h-[75vh] flex flex-col justify-center max-w-5xl mx-auto px-2 sm:px-4 py-6"
      onMouseLeave={() => setHoveredBook(null)}
    >
      {/* Top Garland & Incandescent Lights across the bookcase crown */}
      <div className="relative w-full mb-8 sm:mb-10">
        <div className="h-5 sm:h-6 w-full bg-gradient-to-r from-emerald-950 via-green-900 to-emerald-950 rounded-full border border-green-700/40 shadow-lg flex items-center justify-around px-4 sm:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#15803d_1px,transparent_1px)] [background-size:8px_8px] opacity-40" />
          
          {/* Glowing String Lights */}
          {[...Array(12)].map((_, i) => (
            <span
              key={i}
              className="relative w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-amber-200 shadow-[0_0_10px_3px_rgba(251,191,36,0.9)] animate-pulse"
              style={{
                animationDuration: `${1.4 + (i % 5) * 0.3}s`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
        <div className="text-center mt-2 text-[11px] sm:text-xs font-serif italic text-amber-200/60">
          * Tap any book to pull it from the shelf *
        </div>
      </div>

      {/* Shelf 1 */}
      {renderShelfRow(shelf1, 1)}

      {/* Shelf 2 */}
      {renderShelfRow(shelf2, 2)}

      {/* Hover Preview Card (Only on desktop mouse hover, automatically auto-dismisses) */}
      <AnimatePresence>
        {hoveredBook && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1e1511f8] backdrop-blur-md border border-amber-900/70 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] items-center gap-4 max-w-lg w-[94%]"
          >
            {/* Book Cover preview (Enlarged with 3D spine) */}
            <div className="relative w-16 h-24 rounded-lg overflow-hidden shadow-xl border border-amber-950/60 flex-shrink-0 bg-stone-900">
              <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/50 via-white/10 to-transparent z-10 pointer-events-none" />
              <img
                src={getBookCoverUrl(hoveredBook) || hoveredBook.cover}
                alt={hoveredBook.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info & Open Button */}
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-serif font-bold text-amber-100 line-clamp-1">{hoveredBook.title}</h4>
              <p className="text-xs text-amber-200/70 line-clamp-1">By {hoveredBook.author}</p>
              {hoveredBook.notes && (
                <p className="text-[11px] text-amber-300/80 italic line-clamp-2 mt-1 font-serif">"{hoveredBook.notes}"</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const b = hoveredBook;
                  setHoveredBook(null);
                  onSelectBook(b);
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 text-white rounded-xl text-xs font-sans font-semibold shadow-md transition whitespace-nowrap"
              >
                📖 Open
              </button>
              <button
                onClick={() => setHoveredBook(null)}
                className="text-stone-400 hover:text-stone-200 p-1.5 text-sm"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
