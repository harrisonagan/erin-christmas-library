import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBookCoverUrl } from '../lib/pocketbase';

// Small Christmas Tree Outline Icon (Crisp Vector Gold Line-Art)
function ChristmasTreeIcon({ className = "w-3 h-3 sm:w-3.5 sm:h-3.5" }) {
  return (
    <svg 
      viewBox="0 0 20 20" 
      className={`${className} inline-block filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.95)]`} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* Star on top */}
      <polygon points="10,1.5 11,3.5 13,3.8 11.5,5.2 12,7.2 10,6.2 8,7.2 8.5,5.2 7,3.8 9,3.5" fill="currentColor" stroke="none" />
      {/* Tiered tree boughs */}
      <path d="M10 5.5 L6.5 9.5 h2 L5 13.5 h2.5 L4 17 h12 L12.5 13.5 h2.5 L11.5 9.5 h2 L10 5.5 Z" />
      {/* Tree trunk */}
      <path d="M9 17 v2 h2 v-2" />
    </svg>
  );
}

// Little Nativity Manger Outline Icon (Peaked Roof, Star of Bethlehem & Crib)
function MangerIcon({ className = "w-3.5 h-3.5 sm:w-4 sm:h-4" }) {
  return (
    <svg 
      viewBox="0 0 20 20" 
      className={`${className} inline-block filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.95)]`} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* Star of Bethlehem shining directly above manger */}
      <path d="M10 1.2 v3 M8.5 2.7 h3 M9 1.7 l2 2 M11 1.7 l-2 2" strokeWidth="1.1" />
      {/* Manger stable A-frame peaked roof */}
      <path d="M3.5 9.5 L10 5.5 L16.5 9.5" strokeWidth="1.4" />
      {/* Wooden manger crib */}
      <path d="M6 13.5 h8 l-1 3.5 h-6 Z" strokeWidth="1.3" />
      {/* Crossed wooden support legs */}
      <path d="M6.5 13.5 L5 17 M13.5 13.5 L15 17" strokeWidth="1.3" />
      {/* Baby cradle soft glow */}
      <path d="M8 13.5 c.6-1.5 3.4-1.5 4 0" strokeWidth="1.1" strokeDasharray="1.2 1.2" />
    </svg>
  );
}

// Helper to select 1 or 2 random books to display face-out on each shelf tier
function pickRandomFaceOut(allBooks) {
  if (!allBooks || allBooks.length === 0) return new Set();

  const selected = new Set();
  const story = allBooks.filter((b) => b.category === 'story' || (!b.category && b.id !== 'album_santa' && b.id !== 'cookbook_erin' && !b.title?.toLowerCase().includes('santa') && !b.title?.toLowerCase().includes('photo') && !b.title?.toLowerCase().includes('cook')));
  const albums = allBooks.filter((b) => b.category === 'album' || b.id === 'album_santa' || b.title?.toLowerCase().includes('santa') || b.title?.toLowerCase().includes('photo'));
  const cookbooks = allBooks.filter((b) => b.category === 'cookbook' || b.id === 'cookbook_erin' || b.title?.toLowerCase().includes('cook'));

  // Storybooks: pick 1 or 2 books to face out, spaced apart on the shelf
  if (story.length >= 6) {
    const mid = Math.floor(story.length / 2);
    const firstHalf = story.slice(1, mid);
    const secondHalf = story.slice(mid, -1);
    if (firstHalf.length > 0) {
      const b1 = firstHalf[Math.floor(Math.random() * firstHalf.length)];
      if (b1) selected.add(b1.id);
    }
    if (secondHalf.length > 0) {
      const b2 = secondHalf[Math.floor(Math.random() * secondHalf.length)];
      if (b2) selected.add(b2.id);
    }
  } else if (story.length > 0) {
    selected.add(story[Math.floor(Math.random() * story.length)].id);
  }

  // Photo Albums: pick 1 album to show face out (e.g. Pictures with Santa)
  if (albums.length > 0) {
    const santaAlbum = albums.find((a) => a.id === 'album_santa');
    if (santaAlbum && Math.random() > 0.35) {
      selected.add(santaAlbum.id);
    } else {
      selected.add(albums[Math.floor(Math.random() * albums.length)].id);
    }
  }

  // Cookbooks: pick 1 cookbook to show face out
  if (cookbooks.length > 0) {
    selected.add(cookbooks[Math.floor(Math.random() * cookbooks.length)].id);
  }

  return selected;
}

export default function SpineBookshelf({ books = [], onSelectBook, onAddBook }) {
  const [hoveredBook, setHoveredBook] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'story' | 'album' | 'cookbook'
  const [orientation, setOrientation] = useState(() => {
    try {
      return localStorage.getItem('erin_spine_orientation') || 'horizontal';
    } catch {
      return 'horizontal';
    }
  });

  // Set of book IDs that are currently displayed face-out (showing front cover)
  const [faceOutBookIds, setFaceOutBookIds] = useState(() => pickRandomFaceOut(books));

  // If books list changes significantly, ensure we have face-out books picked
  useEffect(() => {
    if (books.length > 0 && faceOutBookIds.size === 0) {
      setFaceOutBookIds(pickRandomFaceOut(books));
    }
  }, [books]);

  const toggleOrientation = (newMode) => {
    setOrientation(newMode);
    try {
      localStorage.setItem('erin_spine_orientation', newMode);
    } catch {}
  };

  const shuffleFaceOut = () => {
    setFaceOutBookIds(pickRandomFaceOut(books));
  };

  const toggleFaceOut = (e, bookId) => {
    e?.stopPropagation();
    setFaceOutBookIds((prev) => {
      const next = new Set(prev);
      if (next.has(bookId)) {
        next.delete(bookId);
      } else {
        next.add(bookId);
      }
      return next;
    });
  };

  // Map each book to an elegant, antique leather/cloth library spine
  const styledBooks = books.map((b, idx) => {
    const isAlbum = b.category === 'album' || b.id === 'album_santa' || (!b.category && (b.title?.toLowerCase().includes('pictures with santa') || b.title?.toLowerCase().includes('photo')));
    const isCookbook = b.category === 'cookbook' || b.id === 'cookbook_erin' || (!b.category && b.title?.toLowerCase().includes('cook'));

    // Substantial, realistic library spine heights and generous widths
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
  const storybooksTier1 = storybooks.length > 12 ? storybooks.slice(0, Math.ceil(storybooks.length / 2)) : storybooks;
  const storybooksTier2 = storybooks.length > 12 ? storybooks.slice(Math.ceil(storybooks.length / 2)) : [];
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
            const isFaceOut = faceOutBookIds.has(book.id);
            const titleLen = book.title?.length || 0;

            // Fitted, proportional horizontal typography
            const horizontalFontSize = 
              titleLen <= 12
                ? 'text-[9.5px] sm:text-[10px] font-semibold leading-[1.2]'
                : titleLen <= 22
                ? 'text-[8.5px] sm:text-[9px] font-medium leading-[1.18]'
                : 'text-[7.5px] sm:text-[8px] font-normal leading-[1.14]';

            if (isFaceOut) {
              /* ========================================================= */
              /* PROPPED FACE-OUT BOOK DISPLAY (Cover Facing Viewer)       */
              /* ========================================================= */
              return (
                <motion.div
                  key={`faceout-${book.id}`}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  onClick={() => {
                    setHoveredBook(null);
                    onSelectBook(book);
                  }}
                  style={{
                    height: `${book.height || 225}px`,
                    width: `${Math.round((book.height || 225) * 0.72)}px`,
                  }}
                  className="relative group cursor-pointer flex-shrink-0 mx-1 sm:mx-1.5 select-none"
                >
                  {/* Subtle holiday ribbon bookmark */}
                  {isHighlighted && (
                    <div className="absolute -top-5 left-6 z-20 flex flex-col items-center pointer-events-none">
                      <div className="w-1.5 h-4 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 shadow-[0_1px_3px_rgba(0,0,0,0.8)] rounded-b-xs" />
                    </div>
                  )}

                  {/* Hardcover Book Frame propped on shelf */}
                  <div className="relative w-full h-full rounded-r-md rounded-l-xs overflow-hidden shadow-[-6px_10px_25px_rgba(0,0,0,0.92),0_2px_4px_rgba(0,0,0,0.85)] border-t border-r border-amber-900/30 flex bg-stone-900 group-hover:shadow-[0_14px_30px_rgba(251,191,36,0.35)] transition-shadow">
                    {/* Left Hardcover Spine Hinge / Binding Crease */}
                    <div className="w-3.5 h-full bg-gradient-to-r from-black/85 via-black/45 to-transparent flex-shrink-0 z-10 pointer-events-none border-r border-black/40" />

                    {/* Book Cover Image */}
                    <div className="relative flex-1 h-full overflow-hidden bg-[#16100c]">
                      <img
                        src={getBookCoverUrl(book) || book.cover}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Protective glossy lacquer sheen */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-white/10 pointer-events-none" />

                      {/* Bottom banner for clean title readability */}
                      <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-2 opacity-95 group-hover:opacity-100 transition-opacity">
                        <div className="w-full">
                          <p className="font-serif text-[10px] sm:text-[11px] font-bold text-amber-100 line-clamp-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                            {book.title}
                          </p>
                          <p className="text-[7.5px] sm:text-[8px] font-serif text-amber-200/80 uppercase tracking-wider line-clamp-1">
                            {book.author}
                          </p>
                        </div>
                      </div>

                      {/* Toggle to slide back in as spine */}
                      <button
                        onClick={(e) => toggleFaceOut(e, book.id)}
                        className="absolute top-1.5 right-1.5 z-20 px-1.5 py-0.5 rounded bg-black/75 hover:bg-amber-950/90 backdrop-blur-xs border border-amber-400/40 text-[7px] font-serif text-amber-200 tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        title="Slide into shelf as spine"
                      >
                        Spine 📚
                      </button>
                    </div>

                    {/* Right Paper Page Block Bevel (Edge of pages) */}
                    <div className="w-1.5 h-full bg-gradient-to-l from-[#e6dbce] via-[#d4c6b5] to-[#8c7b69] border-l border-black/50 shadow-inner flex-shrink-0 pointer-events-none" />
                  </div>

                  {/* Wooden Shelf Easel / Kickstand shadow underneath */}
                  <div className="absolute -bottom-1.5 inset-x-2 h-2 bg-black/80 blur-xs rounded-full pointer-events-none -z-10" />
                </motion.div>
              );
            }

            /* ========================================================= */
            /* SLID-IN BOOK SPINE DISPLAY                                */
            /* ========================================================= */
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

                {/* Hover button to display book face-out */}
                <button
                  onClick={(e) => toggleFaceOut(e, book.id)}
                  className="absolute -top-3.5 right-1/2 translate-x-1/2 z-30 px-1.5 py-0.5 rounded bg-black/90 hover:bg-amber-900 border border-amber-400/50 text-[6.5px] font-serif text-amber-200 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity shadow-md whitespace-nowrap"
                  title="Display front cover face-out"
                >
                  Cover 📖
                </button>

                {/* Classic Leather Book Spine */}
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
                  className={`relative rounded-t-sm shadow-[inset_-5px_0_10px_rgba(0,0,0,0.75),inset_4px_0_6px_rgba(255,255,255,0.09),-4px_4px_14px_rgba(0,0,0,0.9)] bg-gradient-to-r ${book.color} border-t border-r border-amber-900/30 flex flex-col justify-between items-center py-2 px-1 select-none transition-shadow group-hover:shadow-[0_12px_26px_rgba(251,191,36,0.35)]`}
                >
                  {/* Top Headband & Raised Gilded Rib */}
                  <div className="w-full flex flex-col items-center gap-1">
                    <div className="w-full h-1 bg-amber-400/30 border-b border-black/60" />
                    <div className="w-4/5 h-[1px] bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
                  </div>

                  {/* Title Area: Horizontal Fitted vs North-to-South Vertical */}
                  {orientation === 'horizontal' ? (
                    /* 1. HORIZONTAL FITTED TITLE */
                    <div className="w-full px-0.5 flex flex-col items-center justify-center my-auto z-10">
                      <div className="w-full py-1.5 px-1 border border-amber-400/35 bg-black/45 rounded-xs flex flex-col items-center justify-center shadow-[inset_0_1px_4px_rgba(0,0,0,0.85)]">
                        <span
                          className={`font-serif text-center select-none ${horizontalFontSize} ${
                            book.foil === 'gold'
                              ? 'text-[#faeac7] drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]'
                              : 'text-[#edf1f5] drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]'
                          }`}
                          style={{
                            overflowWrap: 'break-word',
                            wordBreak: 'normal',
                            hyphens: 'none',
                            display: '-webkit-box',
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {book.title}
                        </span>

                        {book.author && (
                          <>
                            <div className="w-2/3 h-[1px] bg-amber-400/25 my-1" />
                            <div className="text-[7px] sm:text-[7.5px] font-serif text-amber-200/80 uppercase tracking-[0.14em] text-center leading-tight max-w-full">
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
                  ) : (
                    /* 2. NORTH TO SOUTH (VERTICAL) VINTAGE LIBRARY SPINE */
                    <div className="w-full flex-1 flex flex-col items-center justify-center my-1 z-10 px-0.5">
                      <div className="w-full h-full py-2 border border-amber-400/35 bg-black/45 rounded-xs flex flex-col items-center justify-center shadow-[inset_0_1px_4px_rgba(0,0,0,0.85)] max-h-[195px] overflow-hidden">
                        <span
                          className="font-serif text-[9.5px] sm:text-[10px] font-semibold tracking-wider text-center select-none text-[#faeac7] drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] leading-tight"
                          style={{
                            writingMode: 'vertical-rl',
                            textOrientation: 'mixed',
                            maxHeight: `${book.height - 75}px`,
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {book.title}
                        </span>

                        {book.author && (
                          <>
                            <div className="w-[1px] h-3 bg-amber-400/30 my-1 flex-shrink-0" />
                            <span
                              className="font-serif text-[7px] sm:text-[7.5px] text-amber-200/80 uppercase tracking-widest text-center select-none leading-none flex-shrink-0"
                              style={{
                                writingMode: 'vertical-rl',
                                textOrientation: 'mixed',
                                maxHeight: '42px',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {book.category === 'album'
                                ? 'Album'
                                : book.category === 'cookbook'
                                ? 'Recipes'
                                : book.author.split(' ').pop()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

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
      {/* CLASSICAL LIBRARY DIRECTORY TABS & DISPLAY CONTROLS       */}
      {/* ========================================================= */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4 sm:mb-5 px-1 select-none z-20">
        {/* Category Tabs */}
        <div className="flex items-center justify-center flex-wrap gap-x-5 sm:gap-x-7 gap-y-1.5 font-serif text-[11px] sm:text-xs uppercase tracking-[0.22em]">
          <button
            onClick={() => setActiveTab('all')}
            className={`transition-all duration-200 pb-1 ${
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
            className={`transition-all duration-200 pb-1 ${
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
            className={`transition-all duration-200 pb-1 ${
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
            className={`transition-all duration-200 pb-1 ${
              activeTab === 'cookbook'
                ? 'text-amber-100 font-bold border-b-2 border-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]'
                : 'text-amber-200/50 hover:text-amber-100 border-b-2 border-transparent'
            }`}
          >
            Cookbooks ({cookbooks.length})
          </button>
        </div>

        {/* Display Controls: Shuffle Covers + Spine Orientation */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Shuffle Face-Out Covers button */}
          <button
            onClick={shuffleFaceOut}
            className="px-2.5 py-1 rounded-full bg-[#1b120ce0] hover:bg-amber-900/60 border border-amber-900/50 text-[9.5px] font-serif text-amber-200/90 transition-all flex items-center gap-1 shadow-sm active:scale-95"
            title="Randomly feature different book covers face-out on the shelves"
          >
            <span>🎲</span>
            <span>Shuffle Covers</span>
          </button>

          {/* Orientation Toggle: Fit Title ↔ vs North to South ↕ */}
          <div className="flex items-center gap-1.5 bg-[#1b120ce0] border border-amber-900/50 rounded-full px-2.5 py-1 text-[10px] font-serif shadow-sm">
            <span className="text-amber-400/70 uppercase tracking-widest text-[8px] mr-1 hidden sm:inline">
              Spine:
            </span>
            <button
              onClick={() => toggleOrientation('horizontal')}
              className={`px-2 py-0.5 rounded-full transition-all text-[9.5px] ${
                orientation === 'horizontal'
                  ? 'bg-amber-800/90 text-amber-100 font-semibold shadow-xs'
                  : 'text-amber-300/50 hover:text-amber-200'
              }`}
              title="Horizontal fitted titles"
            >
              ↔ Fit Title
            </button>
            <button
              onClick={() => toggleOrientation('vertical')}
              className={`px-2 py-0.5 rounded-full transition-all text-[9.5px] ${
                orientation === 'vertical'
                  ? 'bg-amber-800/90 text-amber-100 font-semibold shadow-xs'
                  : 'text-amber-300/50 hover:text-amber-200'
              }`}
              title="North to South vertical spine titles"
            >
              ↕ North to South
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* WOODEN BOOKCASE CABINET (With Inlaid Painted Gift Ribbon)  */}
      {/* ========================================================= */}
      <div 
        className="relative rounded-t-xl rounded-b-xl border-x-4 sm:border-x-8 border-[#321a0c] shadow-[inset_0_0_50px_rgba(0,0,0,0.92),0_25px_60px_rgba(0,0,0,0.95)] pt-6 sm:pt-8 pb-2"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #1c1009 0%, #0e0704 100%)',
          backgroundImage: 'repeating-linear-gradient(to right, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 38px), radial-gradient(ellipse at 50% 30%, #1f120a 0%, #0d0603 100%)',
        }}
      >
        {/* Carved Wood Crown Molding with Attached Painted Holiday Wrapping Ribbon */}
        <div className="relative -mt-6 sm:-mt-8 mb-5 w-full h-8 sm:h-9 bg-gradient-to-b from-[#4f2a15] via-[#351b0d] to-[#1e0e06] rounded-t-xl border-t-2 border-[#794121] border-b border-black/80 shadow-[0_8px_18px_rgba(0,0,0,0.9)] flex items-center justify-center px-4 sm:px-8 select-none">
          {/* Subtle wood grain highlight */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-amber-300/30 pointer-events-none" />

          {/* ========================================================= */}
          {/* INLAID PAINTED HOLIDAY WRAPPING PAPER RIBBON              */}
          {/* ========================================================= */}
          <div className="relative w-full max-w-2xl h-4 sm:h-5 bg-gradient-to-r from-[#631118] via-[#8c1c25] to-[#631118] rounded-sm border-y border-dashed border-amber-300/50 shadow-[0_2px_5px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.18)] flex items-center justify-between px-2 sm:px-4 overflow-hidden">
            {/* Fine holiday gift wrap diagonal gold pinstripes */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none" 
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 7px, rgba(251,191,36,0.5) 7px, rgba(251,191,36,0.5) 9px)'
              }}
            />

            {/* Left Brass Tack / Upholstery Stud attaching ribbon to wood */}
            <div className="relative z-10 w-2 h-2 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700 shadow-[0_1px_2px_rgba(0,0,0,0.9)] border border-amber-900/60 flex-shrink-0" />

            {/* Painted Gold Stencil Details: Christmas Tree & Manger Outline Icons */}
            <div className="relative z-10 flex items-center justify-around w-full px-1 sm:px-4 text-amber-200/90 font-serif tracking-widest pointer-events-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.95)]">
              <span className="text-[7.5px] sm:text-[9px]">✦</span>
              <ChristmasTreeIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300/90" />
              <MangerIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300/90" />
              <span className="text-amber-100 font-medium tracking-[0.22em] uppercase text-[7.5px] sm:text-[8.5px]">
                Holiday Keepsakes
              </span>
              <MangerIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300/90" />
              <ChristmasTreeIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300/90" />
              <span className="text-[7.5px] sm:text-[9px]">✦</span>
            </div>

            {/* Right Brass Tack / Upholstery Stud attaching ribbon to wood */}
            <div className="relative z-10 w-2 h-2 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700 shadow-[0_1px_2px_rgba(0,0,0,0.9)] border border-amber-900/60 flex-shrink-0" />
          </div>
        </div>

        {/* Interior Bookcase Upright Shadows */}
        <div className="absolute top-0 bottom-0 left-0 w-1.5 sm:w-2 bg-gradient-to-r from-amber-600/15 to-black/60 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-1.5 sm:w-2 bg-gradient-to-l from-amber-600/15 to-black/60 pointer-events-none" />

        {/* Shelves Layout */}
        {activeTab === 'all' ? (
          <>
            {storybooksTier2.length > 0 ? (
              <>
                {renderShelfRow(storybooksTier1, 'I', 'Holiday Storybooks • Shelf I', {
                  category: 'story',
                  label: 'Add Book',
                  icon: '📖'
                })}
                {renderShelfRow(storybooksTier2, 'II', 'Holiday Storybooks • Shelf II', {
                  category: 'story',
                  label: 'Add Book',
                  icon: '📖'
                })}
                {renderShelfRow(photoAlbums, 'III', 'Family Photo Albums & Santa Keepsakes', {
                  category: 'album',
                  label: 'Add Album',
                  icon: '🎅'
                })}
                {renderShelfRow(cookbooks, 'IV', "Erin's Family Recipes & Traditions", {
                  category: 'cookbook',
                  label: 'Add Recipe',
                  icon: '🥧'
                })}
              </>
            ) : (
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
            )}
          </>
        ) : activeTab === 'story' ? (
          storybooksTier2.length > 0 ? (
            <>
              {renderShelfRow(storybooksTier1, 'I', 'Holiday Storybooks • Shelf I', {
                category: 'story',
                label: 'Add Book',
                icon: '📖'
              })}
              {renderShelfRow(storybooksTier2, 'II', 'Holiday Storybooks • Shelf II', {
                category: 'story',
                label: 'Add Book',
                icon: '📖'
              })}
            </>
          ) : (
            renderShelfRow(storybooks, 'I', 'Holiday Storybooks Collection', {
              category: 'story',
              label: 'Add Book',
              icon: '📖'
            })
          )
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
        {hoveredBook && !faceOutBookIds.has(hoveredBook.id) && (
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
