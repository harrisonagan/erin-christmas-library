import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBookCoverUrl } from '../lib/pocketbase';

export default function SpineBookshelf({ books = [], onSelectBook, onAddBook }) {
  const [hoveredBook, setHoveredBook] = useState(null);

  // Map each book in the collection to a realistic, vintage leather/cloth spine
  const styledBooks = books.map((b, idx) => {
    // Distinctive spine heights & widths so books look organic and real
    const heights = [225, 210, 235, 195, 220, 205, 240, 215];
    const widths = [44, 48, 42, 50, 40, 46, 38, 52];
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
      isHighlighted: idx === 0 || Boolean(b.notes),
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

  const renderShelfRow = (items, shelfNum, title) => (
    <div 
      className="relative mb-12 sm:mb-16"
      onMouseLeave={() => setHoveredBook(null)}
    >
      {/* Shelf Backboard shadow and warm candle ambient shadow */}
      <div className="absolute inset-x-0 bottom-7 h-56 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none -z-10" />

      {/* Books standing side-by-side on the shelf surface */}
      <div className="flex items-end justify-start sm:justify-center gap-1.5 sm:gap-2.5 px-4 sm:px-8 overflow-x-auto pb-0.5 scrollbar-none">
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
                onSelectBook(book);
              }}
            >
              {/* Highlight ribbon / Holly star */}
              {isHighlighted && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
                  <span className="text-xs animate-bounce">⭐</span>
                  <div className="w-1 h-3 bg-gradient-to-b from-amber-400 to-amber-600 rounded-b shadow" />
                </div>
              )}

              {/* Physical Book Spine */}
              <motion.div
                animate={isSelected ? {
                  y: -18,
                  z: 40,
                  rotateY: -6,
                  scale: 1.04,
                  transition: { type: 'spring', stiffness: 320, damping: 22 }
                } : isHighlighted ? {
                  y: -5,
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
                className={`relative rounded-t-sm shadow-[inset_-3px_0_6px_rgba(0,0,0,0.6),inset_3px_0_6px_rgba(255,255,255,0.1),-4px_4px_12px_rgba(0,0,0,0.85)] bg-gradient-to-r ${book.color} border-t border-r border-amber-950/40 flex flex-col justify-between items-center py-2.5 select-none transition-shadow group-hover:shadow-[0_12px_24px_rgba(251,191,36,0.35)]`}
              >
                {/* Vintage Leather Headband & Spine Ribs */}
                <div className="w-full flex flex-col items-center gap-1">
                  <div className="w-full h-1 bg-amber-400/25 border-b border-black/40" />
                  <div className="w-4/5 h-[1px] bg-black/50" />
                </div>

                {/* Vertical Spine Title: Runs Top-To-Bottom (iOS Safari Compatible via CSS transform) */}
                <div className="flex-1 w-full flex items-center justify-center overflow-hidden relative">
                  <div
                    className={`font-serif text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-center whitespace-nowrap select-none pointer-events-none ${
                      book.foil === 'gold'
                        ? 'text-amber-200/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]'
                        : 'text-stone-200/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]'
                    }`}
                    style={{
                      transform: 'rotate(90deg)',
                      transformOrigin: 'center center',
                      maxWidth: `${book.height - 48}px`,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {book.title}
                  </div>
                </div>

                {/* Bottom Tailband & Keepsake Emblem */}
                <div className="flex flex-col items-center gap-1 w-full">
                  <div className="w-4/5 h-[1px] bg-black/50" />
                  <div className="flex items-center justify-center">
                    <span className="text-[8px] text-amber-400/80 font-serif">🌲</span>
                  </div>
                  <div className="w-full h-1 bg-amber-400/25 border-t border-black/40" />
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Realistic Heavy Solid Wood Shelf Plank */}
      <div className="relative w-full">
        {/* Top wood surface (perspective depth where books rest) */}
        <div className="h-2 w-full bg-gradient-to-r from-[#201108] via-[#3d2011] to-[#201108] border-t border-[#65361b]/60 shadow-inner" />

        {/* Front Wood Shelf Facing with Bevel */}
        <div className="relative w-full h-8 sm:h-9 bg-gradient-to-b from-[#4d2a16] via-[#331b0e] to-[#1c0d06] border-t border-[#7e4624] border-b-2 border-black/80 shadow-[0_16px_25px_rgba(0,0,0,0.95)] rounded-sm flex items-center px-4 sm:px-6 justify-between">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-amber-300/30 pointer-events-none" />

          {/* Brass Plate Label Holder in Center */}
          <div className="mx-auto flex items-center gap-2 px-3 py-0.5 bg-gradient-to-b from-[#997332] via-[#664b1d] to-[#402e0e] border border-[#d4af37]/60 rounded shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.8)]">
            <span className="text-[7px] text-amber-200/90 font-mono">✦</span>
            <span className="text-[9px] sm:text-[10px] font-serif font-bold text-amber-100 uppercase tracking-widest drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
              {title}
            </span>
            <span className="text-[7px] text-amber-200/90 font-mono">✦</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      className="relative min-h-[75vh] flex flex-col justify-center max-w-5xl mx-auto px-2 sm:px-4 py-4"
      onMouseLeave={() => setHoveredBook(null)}
    >
      {/* ========================================================= */}
      {/* REALISTIC CHRISTMAS PINE GARLAND & GLOWING FAIRY LIGHTS   */}
      {/* ========================================================= */}
      <div className="relative w-full mb-8 sm:mb-10 select-none">
        {/* Crown Molding of the Bookcase */}
        <div className="relative w-full h-5 sm:h-6 bg-gradient-to-b from-[#5c331a] via-[#3b2010] to-[#221209] rounded-t-xl border-t-2 border-[#8b4f28] shadow-[0_10px_25px_rgba(0,0,0,0.9)]">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-amber-300/40" />
        </div>

        {/* Draped Lush Pine Boughs (Layered Evergreen Branches) */}
        <div className="relative -mt-3 w-full">
          {/* Garland Base Evergreen Swag with Pine Fronds */}
          <div className="relative w-full h-8 sm:h-10 bg-gradient-to-r from-[#0d2e18] via-[#144724] to-[#0d2e18] rounded-full border border-emerald-600/40 shadow-[0_8px_20px_rgba(0,0,0,0.9)] flex items-center justify-between px-3 sm:px-6 overflow-hidden">
            {/* Pine needle pattern overlay */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:6px_6px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/20 to-black/60 pointer-events-none" />

            {/* Realistic Pine Needle Sprigs & Holly Clusters */}
            <div className="flex items-center justify-around w-full relative z-10">
              {[...Array(14)].map((_, i) => (
                <div key={i} className="flex items-center gap-1 relative">
                  {/* Pine branch glyph */}
                  <span className="text-emerald-300/70 text-xs sm:text-sm -rotate-12 transform scale-110">🌿</span>
                  
                  {/* Glossy Red Holly Berries every alternating cluster */}
                  {i % 2 === 0 && (
                    <div className="flex -space-x-1">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-br from-red-400 via-red-600 to-red-950 shadow-[0_1px_3px_rgba(0,0,0,0.8)] inline-block" />
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-br from-red-400 via-red-600 to-red-950 shadow-[0_1px_3px_rgba(0,0,0,0.8)] inline-block mt-0.5" />
                    </div>
                  )}

                  {/* Glowing Incandescent Fairy Lights */}
                  <span
                    className="relative w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-100 shadow-[0_0_12px_4px_rgba(251,191,36,0.95)] animate-pulse inline-block"
                    style={{
                      animationDuration: `${1.2 + (i % 4) * 0.4}s`,
                      animationDelay: `${(i * 0.15).toFixed(2)}s`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Draping Corner Garland Swags */}
          <div className="absolute -top-1 -left-2 text-xl sm:text-2xl transform -rotate-45 pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
            🎀
          </div>
          <div className="absolute -top-1 -right-2 text-xl sm:text-2xl transform rotate-45 pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
            🎀
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs sm:text-sm text-amber-300 drop-shadow pointer-events-none">
            <span>🔔</span>
            <span className="text-[10px] sm:text-xs font-serif italic text-amber-200/80">Cozy Christmas Collection</span>
            <span>🔔</span>
          </div>
        </div>

        <div className="text-center mt-4 text-[11px] sm:text-xs font-serif italic text-amber-200/60">
          * Tap any book to pull it from the shelf *
        </div>
      </div>

      {/* ========================================================= */}
      {/* WOODEN BOOKCASE CABINET (Side Pillars & Slotted Backing)   */}
      {/* ========================================================= */}
      <div 
        className="relative rounded-b-xl border-x-4 sm:border-x-8 border-[#3b2010] shadow-[inset_0_0_50px_rgba(0,0,0,0.9),0_25px_60px_rgba(0,0,0,0.9)] pt-4 pb-2"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #1e120b 0%, #110905 100%)',
          backgroundImage: 'repeating-linear-gradient(to right, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 38px), radial-gradient(ellipse at 50% 30%, #22140c 0%, #100804 100%)',
        }}
      >
        {/* Left Side Wood Timber Pillar Highlight */}
        <div className="absolute top-0 bottom-0 left-0 w-1.5 sm:w-2 bg-gradient-to-r from-amber-600/20 to-black/60 pointer-events-none" />
        {/* Right Side Wood Timber Pillar Highlight */}
        <div className="absolute top-0 bottom-0 right-0 w-1.5 sm:w-2 bg-gradient-to-l from-amber-600/20 to-black/60 pointer-events-none" />

        {/* Shelf 1 */}
        {renderShelfRow(shelf1, 1, 'Shelf I • Holiday Treasures')}

        {/* Shelf 2 */}
        {renderShelfRow(shelf2, 2, 'Shelf II • Cherished Keepsakes')}
      </div>

      {/* Hover Preview Card (Desktop) */}
      <AnimatePresence>
        {hoveredBook && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1e1511f8] backdrop-blur-md border border-amber-900/70 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] items-center gap-4 max-w-lg w-[94%]"
          >
            <div className="relative w-16 h-24 rounded-lg overflow-hidden shadow-xl border border-amber-950/60 flex-shrink-0 bg-stone-900">
              <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/50 via-white/10 to-transparent z-10 pointer-events-none" />
              <img
                src={getBookCoverUrl(hoveredBook) || hoveredBook.cover}
                alt={hoveredBook.title}
                className="w-full h-full object-cover"
              />
            </div>

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
