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

    // Substantial, realistic library spine heights and generous widths so words never clip
    const heights = isAlbum ? [254, 260, 250] : isCookbook ? [246, 252] : [228, 218, 238, 214, 232, 222, 240, 220];
    const widths = isAlbum ? [90, 94, 88] : isCookbook ? [88, 92] : [74, 80, 70, 82, 76, 72, 78, 74];

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

  const renderShelfRow = (items, romanNumeral, shelfLabel, addCategoryPrompt = null) => {
    return (
      <div 
        className="relative mb-12 sm:mb-16"
        onMouseLeave={() => setHoveredBook(null)}
      >
        {/* Soft atmospheric depth shadow behind the shelf row */}
        <div className="absolute inset-x-0 bottom-7 h-60 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none -z-10" />

        {/* Books standing side-by-side on the shelf */}
        <div className="flex items-end justify-start sm:justify-center gap-2 sm:gap-3 px-6 sm:px-12 overflow-x-auto pb-0.5 scrollbar-none">
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
                    <div className="w-1.5 h-4 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 shadow-[0_1px_3px_rgba(0,0,0,0.8)] rounded-b-xs" />
                  </div>
                )}

                {/* ========================================================= */}
                {/* CLASSY VINTAGE LEATHER BOOK SPINE                         */}
                {/* ========================================================= */}
                <motion.div
                  animate={isSelected ? {
                    y: -18,
                    z: 35,
                    rotateY: -4,
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
                  className={`relative rounded-t-sm shadow-[inset_-5px_0_10px_rgba(0,0,0,0.75),inset_4px_0_6px_rgba(255,255,255,0.09),-4px_4px_14px_rgba(0,0,0,0.9)] bg-gradient-to-r ${book.color} border-t border-r border-amber-900/30 flex flex-col justify-between items-center py-2.5 px-1 select-none transition-shadow group-hover:shadow-[0_12px_26px_rgba(251,191,36,0.35)]`}
                >
                  {/* Top Headband & Raised Gilded Rib 1 */}
                  <div className="w-full flex flex-col items-center gap-1">
                    <div className="w-full h-1 bg-amber-400/30 border-b border-black/60" />
                    <div className="w-4/5 h-[1px] bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
                  </div>

                  {/* Horizontal Gilded Title Cartouche (Classy Antique Morocco Label) */}
                  <div className="w-full px-0.5 flex flex-col items-center justify-center my-auto z-10">
                    <div className="w-full py-2 px-1 border border-amber-400/35 bg-black/40 rounded-xs flex flex-col items-center justify-center shadow-[inset_0_1px_4px_rgba(0,0,0,0.85)]">
                      {/* Title with natural word wrapping without mid-word breaking */}
                      <span
                        className={`font-serif leading-[1.22] text-center select-none ${
                          book.title.length <= 15
                            ? 'text-[11px] sm:text-[11.5px] font-bold'
                            : book.title.length <= 25
                            ? 'text-[9.5px] sm:text-[10px] font-semibold'
                            : 'text-[8.5px] sm:text-[9px] font-medium'
                        } ${
                          book.foil === 'gold'
                            ? 'text-[#faeac7] drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]'
                            : 'text-[#edf1f5] drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]'
                        }`}
                        style={{
                          overflowWrap: 'break-word',
                          wordBreak: 'normal',
                          hyphens: 'none',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {book.title}
                      </span>

                      {/* Author Surname / Volume Note in Classic Small-Caps */}
                      {book.author && (
                        <>
                          <div className="w-3/4 h-[1px] bg-amber-400/25 my-1" />
                          <div className="text-[7.5px] sm:text-[8px] font-serif text-amber-200/80 uppercase tracking-[0.14em] text-center truncate max-w-[95%]">
                            {book.category === 'album'
                              ? 'Album'
                              : book.category === 'cookbook'
                              ? 'Recipes'
                              : book.author.split(' ').pop()}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Bottom Tailband & Delicate Filigree Emblem */}
                  <div className="flex flex-col items-center gap-1 w-full">
                    <div className="w-4/5 h-[1px] bg-gradient-to-r from-transparent via-amber-300/30 to-transparent" />
                    <div className="flex items-center justify-center py-0.5">
                      <span className="text-[10px] sm:text-[11px] font-serif text-amber-300/85 filter drop-shadow">
                        {book.emblem}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-amber-400/30 border-t border-black/60" />
                  </div>
                </motion.div>
              </div>
            );
          })}

          {/* Quick-Add Spine Placeholder on each shelf for intuitive curation */}
          {addCategoryPrompt && (
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => onAddBook && onAddBook(addCategoryPrompt.category)}
              className="relative group cursor-pointer flex-shrink-0"
            >
              <div 
                style={{ width: '64px', height: '210px' }}
                className="rounded-t-sm border border-dashed border-amber-600/40 hover:border-amber-400/70 bg-[#1c110960] hover:bg-[#2b1a0e80] flex flex-col justify-center items-center p-2 text-center transition-all shadow-inner"
              >
                <span className="text-lg mb-1 filter drop-shadow">{addCategoryPrompt.icon}</span>
                <span className="font-serif text-[8.5px] text-amber-200/70 uppercase tracking-widest leading-tight">
                  {addCategoryPrompt.label}
                </span>
                <span className="mt-2 text-xs text-amber-400/60 group-hover:text-amber-300">+</span>
              </div>
            </motion.div>
          )}
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
      {/* CLASSICAL LIBRARY DIRECTORY TABS                          */}
      {/* ========================================================= */}
      <div className="flex items-center justify-center flex-wrap gap-x-6 sm:gap-x-8 gap-y-2 mb-6 sm:mb-8 font-serif text-[11px] sm:text-xs uppercase tracking-[0.24em] select-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`transition-all duration-200 pb-1.5 ${
            activeTab === 'all'
              ? 'text-amber-100 font-bold border-b-2 border-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]'
              : 'text-amber-200/50 hover:text-amber-100 border-b-2 border-transparent'
          }`}
        >
          All Volumes ({styledBooks.length})
        </button>

        <span className="text-amber-700/50 select-none">•</span>

        <button
          onClick={() => setActiveTab('story')}
          className={`transition-all duration-200 pb-1.5 ${
            activeTab === 'story'
              ? 'text-amber-100 font-bold border-b-2 border-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]'
              : 'text-amber-200/50 hover:text-amber-100 border-b-2 border-transparent'
          }`}
        >
          Storybooks ({storybooks.length})
        </button>

        <span className="text-amber-700/50 select-none">•</span>

        <button
          onClick={() => setActiveTab('album')}
          className={`transition-all duration-200 pb-1.5 ${
            activeTab === 'album'
              ? 'text-amber-100 font-bold border-b-2 border-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]'
              : 'text-amber-200/50 hover:text-amber-100 border-b-2 border-transparent'
          }`}
        >
          Photo Albums ({photoAlbums.length})
        </button>

        <span className="text-amber-700/50 select-none">•</span>

        <button
          onClick={() => setActiveTab('cookbook')}
          className={`transition-all duration-200 pb-1.5 ${
            activeTab === 'cookbook'
              ? 'text-amber-100 font-bold border-b-2 border-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]'
              : 'text-amber-200/50 hover:text-amber-100 border-b-2 border-transparent'
          }`}
        >
          Cookbooks ({cookbooks.length})
        </button>
      </div>

      {/* ========================================================= */}
      {/* WOODEN BOOKCASE CABINET FRAMED BY REALISTIC PINE GARLAND  */}
      {/* ========================================================= */}
      <div 
        className="relative rounded-t-xl rounded-b-xl border-x-4 sm:border-x-8 border-[#321a0c] shadow-[inset_0_0_50px_rgba(0,0,0,0.92),0_25px_60px_rgba(0,0,0,0.95)] pt-6 sm:pt-8 pb-2"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #1c1009 0%, #0e0704 100%)',
          backgroundImage: 'repeating-linear-gradient(to right, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 38px), radial-gradient(ellipse at 50% 30%, #1f120a 0%, #0d0603 100%)',
        }}
      >
        {/* Carved Wood Crown Molding Top Header */}
        <div className="absolute -top-3 inset-x-0 h-5 sm:h-6 bg-gradient-to-b from-[#4f2a15] via-[#351b0d] to-[#1e0e06] rounded-t-xl border-t-2 border-[#794121] shadow-[0_10px_25px_rgba(0,0,0,0.9)] z-20 pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-amber-300/30" />
        </div>

        {/* 1. PHOTOREALISTIC TOP PINE GARLAND (WITH PINECONES & LIGHTS) */}
        <div className="absolute -top-12 sm:-top-16 inset-x-0 w-full flex justify-center pointer-events-none z-30 select-none">
          <img
            src={`${import.meta.env.BASE_URL}garland-top.png`}
            alt="Photorealistic Christmas Pine Garland with Pinecones"
            className="w-full max-w-[1040px] h-auto object-contain filter drop-shadow-[0_14px_22px_rgba(0,0,0,0.95)]"
          />
        </div>

        {/* 2. PHOTOREALISTIC LEFT CASCADING GARLAND DOWN THE SIDE */}
        <div className="absolute -top-2 -left-5 sm:-left-9 w-20 sm:w-28 h-auto pointer-events-none z-30 select-none">
          <img
            src={`${import.meta.env.BASE_URL}garland-side-left.png`}
            alt="Cascading Pine Garland Left"
            className="w-full h-auto filter drop-shadow-[0_12px_22px_rgba(0,0,0,0.92)]"
          />
        </div>

        {/* 3. PHOTOREALISTIC RIGHT CASCADING GARLAND DOWN THE SIDE */}
        <div className="absolute -top-2 -right-5 sm:-right-9 w-20 sm:w-28 h-auto pointer-events-none z-30 select-none">
          <img
            src={`${import.meta.env.BASE_URL}garland-side-right.png`}
            alt="Cascading Pine Garland Right"
            className="w-full h-auto filter drop-shadow-[0_12px_22px_rgba(0,0,0,0.92)]"
          />
        </div>

        {/* Interior Bookcase Upright Shadows */}
        <div className="absolute top-0 bottom-0 left-0 w-1.5 sm:w-2 bg-gradient-to-r from-amber-600/15 to-black/60 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-1.5 sm:w-2 bg-gradient-to-l from-amber-600/15 to-black/60 pointer-events-none" />

        {/* Shelves Layout */}
        {activeTab === 'all' ? (
          <>
            {renderShelfRow(storybooks, 'I', 'Holiday Storybooks', {
              category: 'story',
              label: 'Add Book',
              icon: '📖'
            })}
            {renderShelfRow(photoAlbums, 'II', 'Family Photo Albums & Santa Keepsakes', {
              category: 'album',
              label: 'Add Album',
              icon: '🎅'
            })}
            {renderShelfRow(cookbooks, 'III', "Erin's Family Recipes & Traditions", {
              category: 'cookbook',
              label: 'Add Recipe',
              icon: '🥧'
            })}
          </>
        ) : activeTab === 'story' ? (
          renderShelfRow(storybooks, 'I', 'Holiday Storybooks Collection', {
            category: 'story',
            label: 'Add Book',
            icon: '📖'
          })
        ) : activeTab === 'album' ? (
          renderShelfRow(photoAlbums, 'II', 'Family Photo Albums & Santa Keepsakes', {
            category: 'album',
            label: 'Add Album',
            icon: '🎅'
          })
        ) : (
          renderShelfRow(cookbooks, 'III', "Erin's Family Holiday Cookbooks", {
            category: 'cookbook',
            label: 'Add Recipe',
            icon: '🥧'
          })
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
