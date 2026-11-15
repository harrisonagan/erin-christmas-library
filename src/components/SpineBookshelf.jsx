import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBookCoverUrl } from '../lib/pocketbase';

export default function SpineBookshelf({ books = [], onSelectBook, onAddBook }) {
  const [hoveredBook, setHoveredBook] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'story' | 'album' | 'cookbook'

  // Map each book to an elegant, antique leather/cloth library spine
  const styledBooks = books.map((b, idx) => {
    const isAlbum = b.category === 'album' || b.id === 'album_santa' || b.title?.toLowerCase().includes('santa') || b.title?.toLowerCase().includes('photo');
    const isCookbook = b.category === 'cookbook' || b.id === 'cookbook_erin' || b.title?.toLowerCase().includes('cook');

    // Organic, realistic library spine heights and widths
    const heights = isAlbum ? [242, 248, 238] : isCookbook ? [236, 242] : [224, 212, 232, 206, 226, 216, 236, 214];
    const widths = isAlbum ? [60, 64, 62] : isCookbook ? [58, 62] : [52, 56, 50, 58, 54, 52, 56, 52];

    // Rich heritage bookcloth & morocco leather gradients
    const colors = isAlbum ? [
      'from-[#581118] via-[#3a080e] to-[#200407]', // Royal Crimson Velvet
      'from-[#123822] via-[#0c2617] to-[#05130b]', // Victorian Evergreen
      'from-[#162740] via-[#0e1a2c] to-[#060c16]', // Oxford Midnight Navy
    ] : isCookbook ? [
      'from-[#462310] via-[#2f1609] to-[#1c0c04]', // Warm Cinnamon Leather
      'from-[#4c1c13] via-[#33110b] to-[#1d0805]', // Aged Cranberry
    ] : [
      'from-[#5c161c] via-[#3f0d12] to-[#240609]', // Antique Crimson Leather
      'from-[#163824] via-[#0e2719] to-[#07150c]', // British Racing Pine
      'from-[#172b44] via-[#0e1c2e] to-[#060c15]', // Midnight Navy Cloth
      'from-[#482b18] via-[#331c0e] to-[#1e0f06]', // Aged Cognac Leather
      'from-[#42161d] via-[#2d0d13] to-[#19060a]', // Deep Burgundy
      'from-[#1f3624] via-[#142618] to-[#0a150c]', // Dark Forest Pine
      'from-[#341f12] via-[#24140a] to-[#140a04]', // Walnut Morocco
      'from-[#1d2734] via-[#121a24] to-[#080d13]', // Slate Twilight
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
      emblem: isAlbum ? '🎅' : isCookbook ? '🥧' : '✦',
    };
  });

  const storybooks = styledBooks.filter((b) => b.category === 'story');
  const photoAlbums = styledBooks.filter((b) => b.category === 'album');
  const cookbooks = styledBooks.filter((b) => b.category === 'cookbook');

  const renderShelfRow = (items, romanNumeral, shelfLabel) => {
    if (!items || items.length === 0) return null;

    return (
      <div 
        className="relative mb-14 sm:mb-18"
        onMouseLeave={() => setHoveredBook(null)}
      >
        {/* Soft atmospheric depth shadow behind the shelf row */}
        <div className="absolute inset-x-0 bottom-7 h-60 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none -z-10" />

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
                {/* Subtle holiday ribbon bookmark */}
                {isHighlighted && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
                    <div className="w-1 h-3 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 shadow-[0_1px_3px_rgba(0,0,0,0.8)] rounded-b-xs" />
                  </div>
                )}

                {/* ========================================================= */}
                {/* CLASSY VINTAGE LEATHER BOOK SPINE                         */}
                {/* ========================================================= */}
                <motion.div
                  animate={isSelected ? {
                    y: -18,
                    z: 35,
                    rotateY: -5,
                    scale: 1.03,
                    transition: { type: 'spring', stiffness: 340, damping: 24 }
                  } : isHighlighted ? {
                    y: -4,
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
                  className={`relative rounded-t-sm shadow-[inset_-4px_0_8px_rgba(0,0,0,0.7),inset_3px_0_5px_rgba(255,255,255,0.08),-4px_4px_14px_rgba(0,0,0,0.9)] bg-gradient-to-r ${book.color} border-t border-r border-amber-900/30 flex flex-col justify-between items-center py-2.5 select-none transition-shadow group-hover:shadow-[0_10px_22px_rgba(251,191,36,0.3)]`}
                >
                  {/* Top Headband & Raised Gilded Ribs */}
                  <div className="w-full flex flex-col items-center gap-1">
                    <div className="w-full h-1 bg-amber-400/25 border-b border-black/50" />
                    <div className="w-4/5 h-[1px] bg-gradient-to-r from-transparent via-amber-300/30 to-transparent" />
                  </div>

                  {/* Horizontal Gilded Title Cartouche (Classy & Clean) */}
                  <div className="w-full px-1 flex flex-col items-center justify-center my-auto z-10">
                    <div className="w-full py-1.5 px-1 border border-amber-400/25 bg-[#00000030] rounded-xs flex flex-col items-center justify-center shadow-inner">
                      <span
                        className={`font-serif text-[9px] sm:text-[10px] font-semibold tracking-wide uppercase text-center leading-[1.25] break-words line-clamp-3 select-none ${
                          book.foil === 'gold'
                            ? 'text-[#faeac7] drop-shadow-[0_1px_1px_rgba(0,0,0,0.95)]'
                            : 'text-[#e8eaed] drop-shadow-[0_1px_1px_rgba(0,0,0,0.95)]'
                        }`}
                        style={{
                          wordBreak: 'break-word',
                          hyphens: 'auto',
                        }}
                      >
                        {book.title}
                      </span>
                    </div>

                    {/* Author Surname in Classic Small-Caps */}
                    {book.author && (
                      <div className="mt-1 text-[7px] sm:text-[7.5px] font-serif text-amber-200/70 uppercase tracking-[0.12em] text-center truncate max-w-[95%]">
                        {book.category === 'album'
                          ? 'Album'
                          : book.category === 'cookbook'
                          ? 'Recipes'
                          : book.author.split(' ').pop()}
                      </div>
                    )}
                  </div>

                  {/* Bottom Tailband & Delicate Filigree Emblem */}
                  <div className="flex flex-col items-center gap-1 w-full">
                    <div className="w-4/5 h-[1px] bg-gradient-to-r from-transparent via-amber-300/30 to-transparent" />
                    <div className="flex items-center justify-center">
                      <span className="text-[9px] sm:text-[10px] font-serif text-amber-300/80 filter drop-shadow">
                        {book.emblem}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-amber-400/25 border-t border-black/50" />
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* SOLID ANTIQUE WOODEN SHELF PLANK                          */}
        {/* ========================================================= */}
        <div className="relative w-full">
          {/* Top shelf perspective surface (contact shadow where books rest) */}
          <div className="h-2 w-full bg-gradient-to-b from-[#180d07] via-[#2a160c] to-[#1a0e08] border-t border-[#5e3218]/50 shadow-inner" />

          {/* Front molding facing with warm wood grain bevel */}
          <div className="relative w-full h-7 sm:h-8 bg-gradient-to-b from-[#422212] via-[#2d160b] to-[#180a04] border-t border-[#6b381c] border-b-2 border-black/90 shadow-[0_14px_22px_rgba(0,0,0,0.95)] flex items-center px-4 sm:px-8 justify-between">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-amber-300/25 pointer-events-none" />

            {/* Understated Engraved Gold Shelf Title */}
            <div className="flex items-center gap-2">
              <span className="text-[8px] sm:text-[9px] font-serif font-bold text-amber-300/90 tracking-[0.2em] uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
                {romanNumeral}.
              </span>
              <span className="text-[8px] sm:text-[9px] font-serif tracking-[0.18em] text-amber-100/80 uppercase font-medium drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
                {shelfLabel}
              </span>
            </div>

            <div className="text-[9px] text-amber-300/40 font-serif">✦</div>
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
      {/* ELEGANT CROWN MOLDING & LUSH EVERGREEN GARLAND            */}
      {/* ========================================================= */}
      <div className="relative w-full mb-6 sm:mb-8 select-none">
        {/* Carved Wood Crown Molding */}
        <div className="relative w-full h-5 sm:h-6 bg-gradient-to-b from-[#4f2a15] via-[#351b0d] to-[#1e0e06] rounded-t-xl border-t-2 border-[#794121] shadow-[0_10px_25px_rgba(0,0,0,0.9)]">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-amber-300/30" />
        </div>

        {/* Draped Lush Holiday Pine Swag */}
        <div className="relative -mt-2.5 w-full">
          <div className="relative w-full h-7 sm:h-9 bg-gradient-to-r from-[#0a2313] via-[#103a1d] to-[#0a2313] rounded-full border border-emerald-700/40 shadow-[0_6px_18px_rgba(0,0,0,0.9)] flex items-center justify-between px-4 sm:px-8 overflow-hidden">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:6px_6px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/20 to-black/70 pointer-events-none" />

            <div className="flex items-center justify-around w-full relative z-10">
              {[...Array(14)].map((_, i) => (
                <div key={i} className="flex items-center gap-1.5 relative">
                  {/* Subtle pine needle sprig */}
                  <span className="text-emerald-300/60 text-xs sm:text-sm transform scale-105">🌿</span>

                  {/* Red winterberry cluster */}
                  {i % 2 === 0 && (
                    <div className="flex -space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-red-400 via-red-600 to-red-950 shadow-[0_1px_2px_rgba(0,0,0,0.9)] inline-block" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-red-400 via-red-600 to-red-950 shadow-[0_1px_2px_rgba(0,0,0,0.9)] inline-block mt-0.5" />
                    </div>
                  )}

                  {/* Warm Glowing Incandescent Fairy Light */}
                  <span
                    className="relative w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#fff4cc] shadow-[0_0_10px_3px_rgba(251,191,36,0.9)] animate-pulse inline-block"
                    style={{
                      animationDuration: `${1.4 + (i % 4) * 0.4}s`,
                      animationDelay: `${(i * 0.18).toFixed(2)}s`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CLASSY LIBRARY DIRECTORY TABS (Replaces tacky pill buttons)*/}
        {/* ========================================================= */}
        <div className="flex items-center justify-center flex-wrap gap-x-6 sm:gap-x-8 gap-y-2 mt-5 font-serif text-xs uppercase tracking-[0.22em]">
          <button
            onClick={() => setActiveTab('all')}
            className={`transition-all duration-200 pb-1 ${
              activeTab === 'all'
                ? 'text-amber-100 font-bold border-b-2 border-amber-400/90 shadow-[0_1px_0_rgba(251,191,36,0.5)]'
                : 'text-amber-200/50 hover:text-amber-200 border-b-2 border-transparent'
            }`}
          >
            All Volumes ({styledBooks.length})
          </button>

          <span className="text-stone-700 select-none">•</span>

          <button
            onClick={() => setActiveTab('story')}
            className={`transition-all duration-200 pb-1 ${
              activeTab === 'story'
                ? 'text-amber-100 font-bold border-b-2 border-amber-400/90 shadow-[0_1px_0_rgba(251,191,36,0.5)]'
                : 'text-amber-200/50 hover:text-amber-200 border-b-2 border-transparent'
            }`}
          >
            Storybooks ({storybooks.length})
          </button>

          <span className="text-stone-700 select-none">•</span>

          <button
            onClick={() => setActiveTab('album')}
            className={`transition-all duration-200 pb-1 ${
              activeTab === 'album'
                ? 'text-amber-100 font-bold border-b-2 border-amber-400/90 shadow-[0_1px_0_rgba(251,191,36,0.5)]'
                : 'text-amber-200/50 hover:text-amber-200 border-b-2 border-transparent'
            }`}
          >
            Photo Albums ({photoAlbums.length})
          </button>

          <span className="text-stone-700 select-none">•</span>

          <button
            onClick={() => setActiveTab('cookbook')}
            className={`transition-all duration-200 pb-1 ${
              activeTab === 'cookbook'
                ? 'text-amber-100 font-bold border-b-2 border-amber-400/90 shadow-[0_1px_0_rgba(251,191,36,0.5)]'
                : 'text-amber-200/50 hover:text-amber-200 border-b-2 border-transparent'
            }`}
          >
            Cookbooks ({cookbooks.length})
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* WOODEN BOOKCASE CABINET (Side Pillars & Slotted Backing)   */}
      {/* ========================================================= */}
      <div 
        className="relative rounded-b-xl border-x-4 sm:border-x-8 border-[#321a0c] shadow-[inset_0_0_50px_rgba(0,0,0,0.92),0_25px_60px_rgba(0,0,0,0.95)] pt-4 pb-2"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #1c1009 0%, #0e0704 100%)',
          backgroundImage: 'repeating-linear-gradient(to right, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 38px), radial-gradient(ellipse at 50% 30%, #1f120a 0%, #0d0603 100%)',
        }}
      >
        <div className="absolute top-0 bottom-0 left-0 w-1.5 sm:w-2 bg-gradient-to-r from-amber-600/15 to-black/60 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-1.5 sm:w-2 bg-gradient-to-l from-amber-600/15 to-black/60 pointer-events-none" />

        {activeTab === 'all' ? (
          <>
            {renderShelfRow(storybooks, 'I', 'Holiday Storybooks')}
            {renderShelfRow(photoAlbums, 'II', 'Family Photo Albums & Santa Keepsakes')}
            {renderShelfRow(cookbooks, 'III', "Erin's Family Recipes & Traditions")}
          </>
        ) : activeTab === 'story' ? (
          renderShelfRow(storybooks, 'I', 'Holiday Storybooks Collection')
        ) : activeTab === 'album' ? (
          renderShelfRow(photoAlbums, 'II', 'Family Photo Albums & Santa Keepsakes')
        ) : (
          renderShelfRow(cookbooks, 'III', "Erin's Family Holiday Cookbooks")
        )}
      </div>

      {/* Hover Preview Card (Desktop) */}
      <AnimatePresence>
        {hoveredBook && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1a120ef9] backdrop-blur-md border border-amber-900/60 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] items-center gap-4 max-w-lg w-[94%]"
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
                <span className="text-[9px] font-serif uppercase tracking-[0.15em] px-2 py-0.5 bg-amber-950/80 border border-amber-800/40 rounded text-amber-200">
                  {hoveredBook.category === 'album'
                    ? 'Photo Album'
                    : hoveredBook.category === 'cookbook'
                    ? 'Family Cookbook'
                    : 'Holiday Storybook'}
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
                className="px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 text-white rounded-xl text-xs font-serif font-medium shadow-md transition whitespace-nowrap"
              >
                {hoveredBook.category === 'album' ? 'Open Album' : hoveredBook.category === 'cookbook' ? 'Open Recipes' : 'Open Book'}
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
