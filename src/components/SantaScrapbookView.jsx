import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BASE_URL = import.meta.env.BASE_URL || '/';
function assetUrl(relPath) {
  if (!relPath) return '';
  if (relPath.startsWith('http') || relPath.startsWith('data:') || relPath.startsWith('blob:')) {
    return relPath;
  }
  const clean = relPath.startsWith('/') ? relPath.slice(1) : relPath;
  return `${BASE_URL}${clean}`;
}

export const SANTA_SCRAPBOOK_PAGES = [
  {
    year: 2012,
    title: "Rowan's First Santa Visit",
    subtitle: '8 Months Old',
    location: 'Rivertown Mall • Grand Rapids, MI',
    handwrittenNote: 'Rowan 2012 — 8 months old • Rivertown Mall, Grand Rapids',
    theme: 'crimson',
    sticker: "🎅 Rowan's First Christmas",
    mainPhoto: assetUrl('santa/santa-2012.webp?v=2'),
    orientation: 'portrait',
    bonusPhotos: [],
  },
  {
    year: 2013,
    title: 'Sitting Up with Santa',
    subtitle: 'Rowan • 1 Year Old',
    location: null,
    handwrittenNote: 'Sweet little spectacles & snowflake frame • 2013',
    theme: 'evergreen',
    sticker: '❄️ Snowflake Memories',
    mainPhoto: assetUrl('santa/santa-2013.webp?v=2'),
    orientation: 'portrait',
    bonusPhotos: [],
  },
  {
    year: 2014,
    title: 'Christmas Eve Excitement',
    subtitle: 'Rowan • 2 Years Old',
    location: null,
    handwrittenNote: 'Visiting Santa & Mrs. Claus • 2014',
    theme: 'gold',
    sticker: '🎄 Holiday Magic',
    mainPhoto: assetUrl('santa/santa-2014.webp?v=2'),
    orientation: 'portrait',
    bonusPhotos: [],
  },
  {
    year: 2015,
    title: "Elouise's First Santa Photo",
    subtitle: 'Rowan (3) & Baby Elouise',
    location: null,
    handwrittenNote: 'Big brother Rowan with baby sister Elouise in her reindeer dress • 2015',
    theme: 'crimson',
    sticker: "🦌 Elouise's First Christmas",
    mainPhoto: assetUrl('santa/santa-2015.webp?v=2'),
    orientation: 'portrait',
    bonusPhotos: [],
  },
  {
    year: 2017,
    title: 'Stripes & Smiles at Sullivan’s',
    subtitle: 'Rowan (5) & Elouise (2)',
    location: "Sullivan's Hardware",
    handwrittenNote: 'Rowan - 5 • Elouise - 2 • Sullivan Hardware - 2017',
    theme: 'evergreen',
    sticker: '🍬 Candy Cane Stripes',
    mainPhoto: assetUrl('santa/santa-2017.webp?v=2'),
    orientation: 'portrait',
    bonusPhotos: [
      {
        src: assetUrl('santa/santa-2017-bonus.webp?v=2'),
        caption: '2017 Bonus Holiday Memory ✨',
        tilt: '-2.5deg',
      },
    ],
  },
  {
    year: 2018,
    title: 'Big Grins with Santa Claus',
    subtitle: 'Rowan (6), Elouise (3) & Baby Solomon',
    location: "Sullivan's Hardware",
    handwrittenNote: "Sullivan's Hardware - 2018 • Solomon's First Christmas!",
    theme: 'gold',
    sticker: "🎅 Solomon's First Christmas",
    mainPhoto: assetUrl('santa/santa-2018.webp?v=2'),
    orientation: 'portrait',
    bonusPhotos: [
      {
        src: assetUrl('santa/santa-2018-bonus-1.webp?v=2'),
        caption: '2018 Bonus — Holiday Crew Together 🎄',
        tilt: '-2deg',
      },
      {
        src: assetUrl('santa/santa-2018-bonus-2.webp?v=2'),
        caption: "2018 Bonus — Solomon's First Visit with Santa 🎅",
        tilt: '2.5deg',
      },
    ],
  },
  {
    year: 2019,
    title: "“Chillin' With My Snowmies”",
    subtitle: 'Rowan (7), Elouise (4) & Solomon (1)',
    location: "Sullivan's Hardware",
    handwrittenNote: "Sullivan's - 2019 • Matching 'Chillin' With My Snowmies' shirts!",
    theme: 'crimson',
    sticker: null,
    mainPhoto: assetUrl('santa/santa-2019.webp?v=2'),
    orientation: 'landscape',
    bonusPhotos: [],
  },
  {
    year: 2020,
    title: 'Cozy Christmas Pajamas at Home',
    subtitle: 'No Santa 2020 — COVID Year',
    location: 'Home Sweet Home',
    handwrittenNote: 'No Santa 2020 - covid year • Rowan, Solomon & Elouise in matching reindeer PJs',
    theme: 'evergreen',
    sticker: null,
    mainPhoto: assetUrl('santa/santa-2020.webp?v=2'),
    orientation: 'portrait',
    bonusPhotos: [],
  },
  {
    year: 2021,
    title: 'Buffalo Plaid Robes with the Cousins',
    subtitle: '2021 with Cousins',
    location: "Sullivan's Hardware",
    handwrittenNote: "Sullivan's Hardware - 2021 with cousins • Matching red & black plaid robes!",
    theme: 'crimson',
    sticker: '🧣 Cousin Crew 2021',
    mainPhoto: assetUrl('santa/santa-2021.webp?v=2'),
    orientation: 'landscape',
    bonusPhotos: [],
  },
  {
    year: 2022,
    title: 'Candy Canes & Sparkle Shoes',
    subtitle: 'Rowan (10), Elouise (7) & Solomon (4)',
    location: "Sullivan's Hardware",
    handwrittenNote: 'Solomon holding two candy canes, Elouise & Rowan smiling big • 2022',
    theme: 'gold',
    sticker: null,
    mainPhoto: assetUrl('santa/santa-2022.webp?v=2'),
    orientation: 'portrait',
    bonusPhotos: [],
  },
  {
    year: 2023,
    title: 'Santa Hats & Holiday Adventures',
    subtitle: 'Row (11), Lulu (8) & Sol (5)',
    location: "Sullivan's Hardware & Michigan",
    handwrittenNote: "Sullivan's 2023 • Row - 11 • Lulu - 8 • Sol - 5",
    theme: 'crimson',
    sticker: null,
    mainPhoto: assetUrl('santa/santa-2023.webp?v=2'),
    orientation: 'portrait',
    bonusPhotos: [
      {
        src: assetUrl('santa/santa-2023-bonus-1.webp?v=2'),
        caption: '2023 Bonus — Festive Family & Friends Gathering 🎉',
        tilt: '-2deg',
      },
      {
        src: assetUrl('santa/santa-2023-bonus-mi.webp?v=2'),
        caption: '2023 Bonus — Great Wolf Lodge, Michigan 🐺❄️',
        tilt: '2deg',
      },
    ],
  },
  {
    year: 2024,
    title: 'Holiday Pajamas at Sullivan’s',
    subtitle: 'Visits with Santa • 2024',
    location: "Sullivan's Hardware",
    handwrittenNote: "Sullivan's - 2024 • Maeve's First Christmas!",
    theme: 'evergreen',
    sticker: "🎀 Maeve's First Christmas",
    mainPhoto: assetUrl('santa/santa-2024.webp?v=2'),
    orientation: 'landscape',
    bonusPhotos: [],
  },
  {
    year: 2025,
    title: 'Christmas 2025 with Santa',
    subtitle: 'The Tradition Continues',
    location: "Sullivan's Hardware",
    handwrittenNote: "Sullivan's Hardware - 2025 • All dressed up in holiday plaids & velvet with Santa",
    theme: 'gold',
    sticker: null,
    mainPhoto: assetUrl('santa/santa-2025.webp?v=2'),
    orientation: 'portrait',
    bonusPhotos: [],
  },
];

const THEME_STYLES = {
  crimson: {
    outerBorder: 'from-[#7f131b] via-[#5e0c13] to-[#3f070c]',
    accentBorder: 'border-[#e6c469]',
    plaqueBg: 'from-[#6b0f16] via-[#4a090e] to-[#2e0508]',
    plaqueText: 'text-[#fae39c]',
    badgeBg: 'bg-[#5c0d13]/90 border-[#d4af37]/60 text-[#fae39c]',
  },
  evergreen: {
    outerBorder: 'from-[#134229] via-[#0d2e1c] to-[#081f12]',
    accentBorder: 'border-[#e6c469]',
    plaqueBg: 'from-[#123d26] via-[#0b2919] to-[#071a10]',
    plaqueText: 'text-[#fae39c]',
    badgeBg: 'bg-[#123d26]/90 border-[#d4af37]/60 text-[#fae39c]',
  },
  gold: {
    outerBorder: 'from-[#5c3a14] via-[#42280c] to-[#291706]',
    accentBorder: 'border-[#f3d47c]',
    plaqueBg: 'from-[#4f300f] via-[#362009] to-[#211305]',
    plaqueText: 'text-[#fff0bd]',
    badgeBg: 'bg-[#4f300f]/90 border-[#f3d47c]/60 text-[#fff0bd]',
  },
};

function FramedSantaPhoto({ page, onZoom }) {
  const style = THEME_STYLES[page.theme] || THEME_STYLES.crimson;

  return (
    <div
      onClick={() =>
        onZoom({
          src: page.mainPhoto,
          year: page.year,
          title: page.title,
          caption: page.handwrittenNote,
          theme: page.theme,
        })
      }
      className="group relative cursor-zoom-in select-none mx-auto max-w-full"
    >
      {/* Outer Decorative Holiday Frame */}
      <div
        className={`relative p-3.5 sm:p-5 md:p-6 rounded-2xl bg-gradient-to-br ${style.outerBorder} shadow-[0_22px_50px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.25)] border-2 ${style.accentBorder}`}
      >
        {/* Gold Filigree Inner Trim */}
        <div className="relative p-2.5 sm:p-4 rounded-xl bg-[#fbf6ea] shadow-[inset_0_2px_10px_rgba(0,0,0,0.28)] border border-[#d4af37]/80">
          {/* Vintage Gold Scrapbook Corner Mounts */}
          <div className="absolute top-1.5 left-1.5 w-5 h-5 border-t-4 border-l-4 border-[#b38728] rounded-tl-sm pointer-events-none z-20" />
          <div className="absolute top-1.5 right-1.5 w-5 h-5 border-t-4 border-r-4 border-[#b38728] rounded-tr-sm pointer-events-none z-20" />
          <div className="absolute bottom-1.5 left-1.5 w-5 h-5 border-b-4 border-l-4 border-[#b38728] rounded-bl-sm pointer-events-none z-20" />
          <div className="absolute bottom-1.5 right-1.5 w-5 h-5 border-b-4 border-r-4 border-[#b38728] rounded-br-sm pointer-events-none z-20" />

          {/* Main Cropped Photo */}
          <div className="relative overflow-hidden rounded-lg bg-stone-900 shadow-inner flex items-center justify-center">
            <img
              src={page.mainPhoto}
              alt={`Santa ${page.year} — ${page.title}`}
              className={`${
                page.orientation === 'landscape'
                  ? 'max-h-[340px] sm:max-h-[450px] md:max-h-[500px] w-auto'
                  : 'max-h-[400px] sm:max-h-[510px] md:max-h-[560px] w-auto'
              } object-contain block transition-transform duration-500 group-hover:scale-[1.015]`}
            />
          </div>

          {/* Bottom Mat Caption Strip */}
          <div className="pt-3 pb-5 sm:pb-6 px-2 text-center">
            <p className="font-serif italic text-stone-700 text-xs sm:text-sm tracking-wide">
              “{page.handwrittenNote}”
            </p>
          </div>
        </div>

        {/* Prominent Embossed Year Plaque on Frame Border */}
        <div className=" -mt-5 sm:-mt-6 relative z-30 flex justify-center">
          <div
            className={`px-7 sm:px-9 py-1.5 sm:py-2 rounded-full bg-gradient-to-b ${style.plaqueBg} border-2 ${style.accentBorder} shadow-[0_8px_20px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.3)] flex items-center gap-2.5`}
          >
            <span className="text-[#e6c469] text-xs sm:text-sm">✦</span>
            <span
              className={`font-serif font-bold text-xl sm:text-2xl md:text-3xl tracking-[0.16em] ${style.plaqueText} drop-shadow`}
            >
              {page.year}
            </span>
            <span className="text-[#e6c469] text-xs sm:text-sm">✦</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BonusPolaroidCard({ bonus, year, onZoom }) {
  return (
    <div
      onClick={() =>
        onZoom({
          src: bonus.src,
          year,
          title: `${year} Bonus Snapshot`,
          caption: bonus.caption,
          theme: 'gold',
        })
      }
      style={{ transform: `rotate(${bonus.tilt || '0deg'})` }}
      className="group relative cursor-zoom-in bg-[#fcf9f2] p-3 sm:p-3.5 pb-5 rounded-xl shadow-[0_14px_32px_rgba(0,0,0,0.75)] border border-[#e2d6b5] hover:rotate-0 hover:scale-[1.03] transition-all duration-300 max-w-[320px] sm:max-w-[350px] w-full mx-auto"
    >
      {/* Festive Red & Gold Washi Tape at Top */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-gradient-to-r from-red-800/85 via-amber-500/80 to-red-800/85 rounded-sm shadow-sm border border-amber-200/40 rotate-[-1.5deg] flex items-center justify-center pointer-events-none">
        <span className="text-[9px] font-mono uppercase tracking-widest text-amber-100 font-bold">
          ★ {year} BONUS ★
        </span>
      </div>

      <div className="overflow-hidden rounded-md bg-stone-900 border border-stone-300 flex items-center justify-center">
        <img
          src={bonus.src}
          alt={bonus.caption}
          className="max-h-[250px] sm:max-h-[280px] w-auto object-contain block"
        />
      </div>

      <div className="mt-3 text-center px-1">
        <p className="font-serif italic text-stone-800 text-xs sm:text-sm font-medium leading-snug">
          {bonus.caption}
        </p>
        <span className="inline-block mt-1 text-[10px] font-mono uppercase tracking-widest text-amber-800 font-semibold">
          Click to Enlarge 🔍
        </span>
      </div>
    </div>
  );
}

function ScrapbookSpread({ page, onZoom }) {
  const style = THEME_STYLES[page.theme] || THEME_STYLES.crimson;
  const hasBonus = page.bonusPhotos && page.bonusPhotos.length > 0;

  return (
    <div className="relative bg-gradient-to-br from-[#231710] via-[#1a110b] to-[#120b07] border-2 border-amber-900/60 rounded-3xl p-5 sm:p-8 md:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden">
      {/* Subtle Scrapbook Paper Corner Flourishes */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-radial from-amber-500/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-radial from-red-600/10 to-transparent pointer-events-none" />

      {/* Spread Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-7 border-b border-amber-900/50">
        <div>
          {(page.location || page.sticker) && (
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {page.location && (
                <span className="px-3 py-1 rounded-full bg-stone-900/90 border border-stone-700/80 text-xs font-sans text-amber-200/90">
                  📍 {page.location}
                </span>
              )}
              {page.sticker && (
                <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-600/40 text-xs font-sans text-amber-300">
                  {page.sticker}
                </span>
              )}
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-amber-100 tracking-wide">
            {page.title}
          </h2>
          {page.subtitle && (
            <p className="text-sm sm:text-base font-serif italic text-amber-200/80 mt-0.5">
              {page.subtitle}
            </p>
          )}
        </div>

        {/* Large Decorative Year Stamp in Top Right */}
        <div className="self-start sm:self-center flex-shrink-0 px-5 py-2 rounded-2xl bg-[#110a06] border-2 border-[#d4af37]/60 shadow-inner text-center">
          <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400/80">
            Scrapbook Year
          </span>
          <span className="font-serif font-bold text-2xl sm:text-3xl text-[#fae39c] tracking-widest">
            {page.year}
          </span>
        </div>
      </div>

      {/* Main Content Layout: Single Centered Heirloom Frame OR 2-Column Spread with Bonus Polaroids */}
      <div
        className={`grid grid-cols-1 ${
          hasBonus ? 'lg:grid-cols-12 gap-8 items-center' : 'place-items-center'
        }`}
      >
        <div className={hasBonus ? 'lg:col-span-7 flex justify-center' : 'w-full flex justify-center'}>
          <FramedSantaPhoto page={page} onZoom={onZoom} />
        </div>

        {hasBonus && (
          <div className="lg:col-span-5 flex flex-col items-center justify-center gap-7 pt-4 lg:pt-0">
            <div className="text-center">
              <span className="px-3.5 py-1 rounded-full bg-amber-950/90 border border-amber-500/40 text-xs font-serif font-semibold text-amber-200 shadow">
                📸 {page.year} Bonus Scrapbook Snapshots ({page.bonusPhotos.length})
              </span>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-7 w-full items-center justify-center">
              {page.bonusPhotos.map((bonus, idx) => (
                <BonusPolaroidCard
                  key={idx}
                  bonus={bonus}
                  year={page.year}
                  onZoom={onZoom}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SantaScrapbookView({ onClose }) {
  const [viewStyle, setViewStyle] = useState('flipbook'); // 'flipbook' | 'all'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomedItem, setZoomedItem] = useState(null);

  const currentPage = SANTA_SCRAPBOOK_PAGES[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (zoomedItem) {
        if (e.key === 'Escape') setZoomedItem(null);
        return;
      }
      if (e.key === 'Escape') {
        onClose?.();
      } else if (viewStyle === 'flipbook' && e.key === 'ArrowRight') {
        setCurrentIndex((prev) => Math.min(SANTA_SCRAPBOOK_PAGES.length - 1, prev + 1));
      } else if (viewStyle === 'flipbook' && e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewStyle, zoomedItem, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#0d0705] text-amber-50 overflow-y-auto flex flex-col"
    >
      {/* Top Sticky Scrapbook Navigation Header */}
      <header className="sticky top-0 z-30 bg-[#140b07]/95 backdrop-blur-md border-b border-amber-900/60 px-4 sm:px-8 py-3.5 shadow-lg print:hidden">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-amber-900/60 text-xs font-sans text-amber-200 flex items-center gap-1.5 transition"
            >
              <span>←</span> <span>Back to Library</span>
            </button>
            <div className="hidden sm:block h-5 w-px bg-stone-800" />
            <div>
              <h1 className="text-base sm:text-xl font-serif font-bold text-amber-100 flex items-center gap-2">
                <span>🎅</span>
                <span>Pictures with Santa • Family Scrapbook (2012–2025)</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Switch between Page-by-Page Flipbook & Full Scrollable Scrapbook */}
            <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs font-sans">
              <button
                onClick={() => setViewStyle('flipbook')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  viewStyle === 'flipbook'
                    ? 'bg-amber-800 text-amber-50 font-semibold shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>📖</span> <span>Flipbook</span>
              </button>
              <button
                onClick={() => setViewStyle('all')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  viewStyle === 'all'
                    ? 'bg-amber-800 text-amber-50 font-semibold shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>🖼️</span> <span>All Years ({SANTA_SCRAPBOOK_PAGES.length})</span>
              </button>
            </div>

            <button
              onClick={() => {
                setViewStyle('all');
                setTimeout(() => window.print(), 250);
              }}
              className="hidden md:flex px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-sans text-amber-200 items-center gap-1.5 transition"
              title="Print or Save Photo Book as PDF"
            >
              <span>🖨️</span> <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-stone-900 hover:bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-300"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Interactive Year Timeline Ribbon */}
        <div className="max-w-6xl mx-auto mt-3 pt-2.5 border-t border-stone-800/80 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {SANTA_SCRAPBOOK_PAGES.map((p, idx) => {
            const isActive = viewStyle === 'flipbook' && idx === currentIndex;
            const hasBonus = p.bonusPhotos && p.bonusPhotos.length > 0;
            return (
              <button
                key={p.year}
                onClick={() => {
                  if (viewStyle === 'flipbook') {
                    setCurrentIndex(idx);
                  } else {
                    const el = document.getElementById(`santa-year-${p.year}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className={`px-3 py-1 rounded-full text-xs font-serif font-bold transition flex items-center gap-1 flex-shrink-0 border ${
                  isActive
                    ? 'bg-gradient-to-r from-red-800 via-amber-700 to-red-800 border-[#f3d47c] text-white shadow'
                    : 'bg-stone-900/90 border-stone-800 text-amber-200/75 hover:text-amber-100 hover:border-amber-700/60'
                }`}
              >
                <span>{p.year}</span>
                {hasBonus && <span className="text-[10px] text-amber-300">★</span>}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Scrapbook Stage */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10">
        {viewStyle === 'flipbook' ? (
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage.year}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <ScrapbookSpread page={currentPage} onZoom={setZoomedItem} />
              </motion.div>
            </AnimatePresence>

            {/* Bottom Page Turn Controls */}
            <div className="mt-7 flex items-center justify-between gap-4 bg-[#180f0a] border border-amber-900/50 rounded-2xl p-4 shadow-lg">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-35 border border-amber-800/50 text-xs sm:text-sm font-serif font-bold text-amber-100 flex items-center gap-2 transition"
              >
                <span>←</span>
                <span>
                  {currentIndex > 0
                    ? `Previous (${SANTA_SCRAPBOOK_PAGES[currentIndex - 1].year})`
                    : 'First Page'}
                </span>
              </button>

              <div className="text-center font-serif">
                <span className="text-xs sm:text-sm text-amber-200 font-bold">
                  Year {currentPage.year}
                </span>
                <span className="block text-[11px] text-stone-400 font-sans">
                  Page {currentIndex + 1} of {SANTA_SCRAPBOOK_PAGES.length} • Click any photo to zoom
                </span>
              </div>

              <button
                onClick={() =>
                  setCurrentIndex((prev) => Math.min(SANTA_SCRAPBOOK_PAGES.length - 1, prev + 1))
                }
                disabled={currentIndex === SANTA_SCRAPBOOK_PAGES.length - 1}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-red-800 hover:from-amber-600 hover:to-red-700 disabled:opacity-35 border border-amber-400/50 text-xs sm:text-sm font-serif font-bold text-white flex items-center gap-2 shadow transition"
              >
                <span>
                  {currentIndex < SANTA_SCRAPBOOK_PAGES.length - 1
                    ? `Next (${SANTA_SCRAPBOOK_PAGES[currentIndex + 1].year})`
                    : 'Final Year (2025)'}
                </span>
                <span>→</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Cover Title Card in All-Years Mode */}
            <div className="text-center py-8 px-6 rounded-3xl bg-gradient-to-b from-[#3b090e] to-[#1a0507] border-2 border-[#d4af37]/70 shadow-2xl">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-amber-300 mb-2">
                ✦ Agan Family Holiday Keepsake ✦
              </p>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-2">
                Pictures with Santa
              </h2>
              <p className="text-base sm:text-lg font-serif italic text-amber-200">
                2012 – 2025 • In Chronological Order with Bonus Family Memories
              </p>
            </div>

            {SANTA_SCRAPBOOK_PAGES.map((page) => (
              <div key={page.year} id={`santa-year-${page.year}`} className="scroll-mt-28">
                <ScrapbookSpread page={page} onZoom={setZoomedItem} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Full-Screen Lightbox Zoom Modal */}
      <AnimatePresence>
        {zoomedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedItem(null)}
            className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full flex flex-col items-center"
            >
              <button
                onClick={() => setZoomedItem(null)}
                className="absolute -top-2 right-0 w-10 h-10 rounded-full bg-stone-900 border border-amber-500/50 text-amber-100 flex items-center justify-center text-lg shadow-lg z-20"
              >
                ✕
              </button>

              <div className="p-3 sm:p-5 rounded-2xl bg-gradient-to-br from-[#6b0f16] via-[#4a090e] to-[#290508] border-2 border-[#e6c469] shadow-2xl">
                <div className="p-2 sm:p-3 bg-[#fbf6ea] rounded-xl border border-[#d4af37]">
                  <img
                    src={zoomedItem.src}
                    alt={zoomedItem.title}
                    className="max-h-[75vh] w-auto object-contain rounded-lg block mx-auto"
                  />
                </div>
                <div className="mt-3 text-center">
                  <span className="inline-block px-5 py-1 rounded-full bg-[#2a0507] border border-[#e6c469] font-serif font-bold text-xl text-[#fae39c] tracking-widest">
                    {zoomedItem.year}
                  </span>
                  {zoomedItem.caption && (
                    <p className="mt-2 text-xs sm:text-sm font-serif italic text-amber-100">
                      “{zoomedItem.caption}”
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
