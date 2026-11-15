import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBookCoverUrl } from '../lib/pocketbase';

export default function SpineBookshelf({ books = [], onSelectBook, onAddBook }) {
  const [hoveredBook, setHoveredBook] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'story' | 'album' | 'cookbook'

  // Map each book in the collection to a realistic vintage spine with horizontal title badge
  const styledBooks = books.map((b, idx) => {
    const isAlbum = b.category === 'album' || b.id === 'album_santa' || b.title?.toLowerCase().includes('santa') || b.title?.toLowerCase().includes('photo');
    const isCookbook = b.category === 'cookbook' || b.id === 'cookbook_erin' || b.title?.toLowerCase().includes('cook');

    // Photo albums and cookbooks are slightly wider and taller like real albums
    const heights = isAlbum ? [240, 245, 235] : isCookbook ? [235, 240] : [220, 210, 230, 205, 225, 215, 235, 210];
    const widths = isAlbum ? [58, 62, 60] : isCookbook ? [56, 60] : [50, 54, 48, 56, 52, 50, 54, 52];

    const colors = isAlbum ? [
      'from-[#5c131a] via-[#400c12] to-[#24060a]', // Rich velvet holiday red
      'from-[#143d25] via-[#0d2a19] to-[#06170d]', // Forest evergreen
      'from-[#1a2f4d] via-[#101e33] to-[#070e1a]', // Winter navy
    ] : isCookbook ? [
      'from-[#4d2813] via-[#361a0b] to-[#200d04]', // Warm cinnamon gingerbread
      'from-[#542116] via-[#3a140d] to-[#220906]', // Cranberry leather
    ] : [
      'from-[#6e1e24] via-[#4d1318] to-[#2e090d]', // Crimson leather
      'from-[#1c442d] via-[#13301f] to-[#0a1c12]', // Evergreen cloth
      'from-[#1b314d] via-[#112033] to-[#08121f]', // Midnight navy
      'from-[#54341f] via-[#3d2414] to-[#241309]', // Aged cognac
      'from-[#4c1d24] via-[#361318] to-[#1f090c]', // Deep burgundy
      'from-[#253f2c] via-[#1a2e20] to-[#0e1a12]', // Dark pine
      'from-[#3c2517] via-[#2a190f] to-[#180e08]', // Walnut leather
      'from-[#222e3d] via-[#161f2a] to-[#0b1016]', // Twilight slate
    ];

    const detectedCategory = isAlbum ? 'album' : isCookbook ? 'cookbook' : 'story';

    return {
      ...b,
      category: b.category || detectedCategory,
      isHighlighted: idx === 0 || isAlbum || isCookbook || Boolean(b.notes),
      color: colors[idx % colors.length],
      height: heights[idx % heights.length],
      width: widths[idx % widths.length],
      foil: idx % 2 === 0 ? 'gold' : 'silver',
      emblem: isAlbum ? '🎅' : isCookbook ? '🥧' : '🎄',
    };
  });

  // Filter groups
  const storybooks = styledBooks.filter((b) => b.category === 'story');
  const photoAlbums = styledBooks.filter((b) => b.category === 'album');
  const cookbooks = styledBooks.filter((b) => b.category === 'cookbook');

  const renderShelfRow = (items, shelfNum, title, subtitle) => {
    if (!items || items.length === 0) return null;

    return (
      <div 
        className="relative mb-12 sm:mb-16"
        onMouseLeave={() => setHoveredBook(null)}
      >
        {/* Shelf Backboard shadow and ambient warmth */}
        <div className="absolute inset-x-0 bottom-7 h-56 bg-gradient-to-t from-black/85 via-black/45 to-transparent pointer-events-none -z-10" />

        {/* Books standing side-by-side */}
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
                    <span className="text-xs animate-bounce">
                      {book.category === 'album' ? '📷' : book.category === 'cookbook' ? '🥧' : '⭐'}
                    </span>
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
                  {/* Vintage Leather Headband & Top Ribs */}
                  <div className="w-full flex flex-col items-center gap-1">
                    <div className="w-full h-1 bg-amber-400/25 border-b border-black/40" />
                    <div className="w-4/5 h-[1px] bg-black/50" />
                  </div>

                  {/* ========================================================= */}
                  {/* HORIZONTAL WRAPPED SPINE TITLE (Vintage Embossed Plate)    */}
                  {/* ========================================================= */}
                  <div className="w-full px-1 flex flex-col items-center justify-center my-auto z-10">
                    <div className="w-full py-1.5 px-0.5 border-y border-amber-400/25 bg-black/25 rounded-xs flex flex-col items-center justify-center shadow-inner">
                      <span
                        className={`font-serif text-[9px] sm:text-[10px] font-bold tracking-tight uppercase text-center leading-[1.2] break-words line-clamp-3 select-none ${
                          book.foil === 'gold'
                            ? 'text-amber-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]'
                            : 'text-stone-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]'
                        }`}
                        style={{
                          wordBreak: 'break-word',
                          hyphens: 'auto',
                        }}
                      >
                        {book.title}
                      </span>
                    </div>

                    {/* Author Surname / Volume Note (Horizontal, Subtle) */}
                    {book.author && (
                      <div className="mt-1 text-[7px] sm:text-[8px] font-serif text-amber-200/60 uppercase tracking-wider text-center truncate max-w-[95%]">
                        {book.category === 'album'
                          ? 'Album'
                          : book.category === 'cookbook'
                          ? 'Recipes'
                          : book.author.split(' ').pop()}
                      </div>
                    )}
                  </div>

                  {/* Bottom Tailband & Keepsake Emblem */}
                  <div className="flex flex-col items-center gap-1 w-full">
                    <div className="w-4/5 h-[1px] bg-black/50" />
                    <div className="flex items-center justify-center">
                      <span className="text-[10px] sm:text-[11px] font-serif filter drop-shadow">
                        {book.emblem}
                      </span>
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
          {/* Top wood surface (depth perspective where books rest) */}
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
  };

  return (
    <div 
      className="relative min-h-[75vh] flex flex-col justify-center max-w-5xl mx-auto px-2 sm:px-4 py-4"
      onMouseLeave={() => setHoveredBook(null)}
    >
      {/* ========================================================= */}
      {/* REALISTIC CHRISTMAS PINE GARLAND & GLOWING FAIRY LIGHTS   */}
      {/* ========================================================= */}
      <div className="relative w-full mb-6 sm:mb-8 select-none">
        {/* Crown Molding of the Bookcase */}
        <div className="relative w-full h-5 sm:h-6 bg-gradient-to-b from-[#5c331a] via-[#3b2010] to-[#221209] rounded-t-xl border-t-2 border-[#8b4f28] shadow-[0_10px_25px_rgba(0,0,0,0.9)]">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-amber-300/40" />
        </div>

        {/* Draped Lush Pine Boughs */}
        <div className="relative -mt-3 w-full">
          <div className="relative w-full h-8 sm:h-10 bg-gradient-to-r from-[#0d2e18] via-[#144724] to-[#0d2e18] rounded-full border border-emerald-600/40 shadow-[0_8px_20px_rgba(0,0,0,0.9)] flex items-center justify-between px-3 sm:px-6 overflow-hidden">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:6px_6px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/20 to-black/60 pointer-events-none" />

            <div className="flex items-center justify-around w-full relative z-10">
              {[...Array(14)].map((_, i) => (
                <div key={i} className="flex items-center gap-1 relative">
                  <span className="text-emerald-300/70 text-xs sm:text-sm -rotate-12 transform scale-110">🌿</span>
                  {i % 2 === 0 && (
                    <div className="flex -space-x-1">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-br from-red-400 via-red-600 to-red-950 shadow-[0_1px_3px_rgba(0,0,0,0.8)] inline-block" />
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-br from-red-400 via-red-600 to-red-950 shadow-[0_1px_3px_rgba(0,0,0,0.8)] inline-block mt-0.5" />
                    </div>
                  )}
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

          <div className="absolute -top-1 -left-2 text-xl sm:text-2xl transform -rotate-45 pointer-events-none drop-shadow">
            🎀
          </div>
          <div className="absolute -top-1 -right-2 text-xl sm:text-2xl transform rotate-45 pointer-events-none drop-shadow">
            🎀
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs sm:text-sm text-amber-300 drop-shadow pointer-events-none">
            <span>🔔</span>
            <span className="text-[10px] sm:text-xs font-serif italic text-amber-200/80">Family Christmas Library & Keepsakes</span>
            <span>🔔</span>
          </div>
        </div>

        {/* Shelf Category Switcher Tabs */}
        <div className="flex items-center justify-center gap-2 mt-5 font-sans">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              activeTab === 'all'
                ? 'bg-amber-700 text-amber-50 shadow-md border border-amber-500/40'
                : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            🌲 All Shelves ({styledBooks.length})
          </button>
          <button
            onClick={() => setActiveTab('story')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition flex items-center gap-1 ${
              activeTab === 'story'
                ? 'bg-amber-700 text-amber-50 shadow-md border border-amber-500/40'
                : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <span>📖</span> <span>Storybooks ({storybooks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('album')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition flex items-center gap-1 ${
              activeTab === 'album'
                ? 'bg-amber-700 text-amber-50 shadow-md border border-amber-500/40'
                : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <span>📷</span> <span>Photo Albums ({photoAlbums.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('cookbook')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition flex items-center gap-1 ${
              activeTab === 'cookbook'
                ? 'bg-amber-700 text-amber-50 shadow-md border border-amber-500/40'
                : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <span>🥧</span> <span>Cookbooks ({cookbooks.length})</span>
          </button>
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
        <div className="absolute top-0 bottom-0 left-0 w-1.5 sm:w-2 bg-gradient-to-r from-amber-600/20 to-black/60 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-1.5 sm:w-2 bg-gradient-to-l from-amber-600/20 to-black/60 pointer-events-none" />

        {/* View Mode: All Shelves or Specific Category */}
        {activeTab === 'all' ? (
          <>
            {/* Shelf I: Holiday Storybooks */}
            {renderShelfRow(storybooks, 1, 'Shelf I • Holiday Storybooks')}

            {/* Shelf II: Family Photo Albums & Santa */}
            {renderShelfRow(photoAlbums, 2, 'Shelf II • Family Photo Albums & Santa')}

            {/* Shelf III: Cookbooks & Family Recipes */}
            {renderShelfRow(cookbooks, 3, 'Shelf III • Erin’s Family Cookbooks')}
          </>
        ) : activeTab === 'story' ? (
          renderShelfRow(storybooks, 1, 'Holiday Storybooks Collection')
        ) : activeTab === 'album' ? (
          renderShelfRow(photoAlbums, 1, 'Family Photo Albums & Santa Keepsakes')
        ) : (
          renderShelfRow(cookbooks, 1, 'Family Cookbooks & Holiday Recipes')
        )}
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
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-sans uppercase font-bold tracking-wider px-1.5 py-0.5 bg-amber-950 border border-amber-800/60 rounded text-amber-300">
                  {hoveredBook.category === 'album'
                    ? '📷 Photo Album'
                    : hoveredBook.category === 'cookbook'
                    ? '🥧 Family Cookbook'
                    : '📖 Storybook'}
                </span>
              </div>
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
                {hoveredBook.category === 'album' ? '📷 Open Album' : hoveredBook.category === 'cookbook' ? '🥧 Open Recipes' : '📖 Open Book'}
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
