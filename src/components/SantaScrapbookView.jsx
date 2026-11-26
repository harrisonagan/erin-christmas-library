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
    subtitle: '4 Months Old',
    location: 'Rivertown Mall • Grand Rapids, MI',
    handwrittenNote: 'Rowan — 4 months old • Rivertown Mall, Grand Rapids',
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
    handwrittenNote: 'Sweet little spectacles & snowflake frame',
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
    handwrittenNote: 'Rowan wanted his mom and Dad to join him with Santa',
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
    handwrittenNote: "Big brother Rowan with little sister Elouise's first Christmas",
    theme: 'crimson',
    sticker: "🦌 Elouise's First Christmas",
    mainPhoto: assetUrl('santa/santa-2015.webp?v=2'),
    orientation: 'portrait',
    bonusPhotos: [],
  },
  {
    year: 2016,
    title: 'Santa in Lexington',
    subtitle: 'Rowan (4), Elouise (1) & Family',
    location: 'Lexington',
    handwrittenNote: 'Santa in Lexington • Gathering with Santa around the grand Christmas tree',
    theme: 'gold',
    sticker: '🎅 Santa in Lexington',
    mainPhoto: assetUrl('santa/santa-2016.webp?v=1'),
    orientation: 'landscape',
    bonusPhotos: [],
  },
  {
    year: 2017,
    title: 'Stripes & Smiles at Sullivan’s',
    subtitle: 'Rowan (5) & Elouise (2)',
    location: "Sullivan's Hardware",
    handwrittenNote: 'Rowan - 5 • Elouise - 2 • Sullivan Hardware',
    theme: 'evergreen',
    sticker: '🍬 Candy Cane Stripes',
    mainPhoto: assetUrl('santa/santa-2017.webp?v=2'),
    orientation: 'portrait',
    bonusPhotos: [
      {
        src: assetUrl('santa/santa-2017-bonus.webp?v=2'),
        caption: 'Elouise drew a picture of Santa and showed Santa',
        tilt: '-2.5deg',
      },
    ],
  },
  {
    year: 2018,
    title: 'Big Grins with Santa Claus',
    subtitle: 'Rowan (6), Elouise (3) & Baby Solomon',
    location: "Sullivan's Hardware",
    handwrittenNote: "Sullivan's Hardware • Solomon's First Christmas!",
    theme: 'gold',
    sticker: "🎅 Solomon's First Christmas",
    mainPhoto: assetUrl('santa/santa-2018.webp?v=2'),
    orientation: 'portrait',
    bonusPhotos: [
      {
        src: assetUrl('santa/santa-2018-bonus-1.webp?v=2'),
        caption: "Sullivan's with the Cousins",
        tilt: '-2deg',
      },
      {
        src: assetUrl('santa/santa-2018-bonus-2.webp?v=2'),
        caption: "Solomon's First Visit with Santa 🎅",
        tilt: '2.5deg',
      },
    ],
  },
  {
    year: 2019,
    title: "“Chillin' With My Snowmies”",
    subtitle: 'Rowan (7), Elouise (4) & Solomon (1)',
    location: "Sullivan's Hardware",
    handwrittenNote: "Sullivan's • Matching 'Chillin' With My Snowmies' shirts!",
    theme: 'crimson',
    sticker: null,
    mainPhoto: assetUrl('santa/santa-2019.webp?v=2'),
    orientation: 'landscape',
    bonusPhotos: [],
  },
  {
    year: 2020,
    title: 'Cozy Christmas Pajamas at Home',
    subtitle: 'No Santa — COVID Year',
    location: 'Home Sweet Home',
    handwrittenNote: 'No Santa - COVID year • Rowan, Solomon & Elouise in matching reindeer PJs',
    theme: 'evergreen',
    sticker: null,
    mainPhoto: assetUrl('santa/santa-2020.webp?v=2'),
    orientation: 'portrait',
    bonusPhotos: [],
  },
  {
    year: 2021,
    title: 'Buffalo Plaid Robes with the Cousins',
    subtitle: 'With Cousins',
    location: "Sullivan's Hardware",
    handwrittenNote: "Sullivan's Hardware with cousins • Matching red & black plaid robes!",
    theme: 'crimson',
    sticker: '🧣 Cousin Crew',
    mainPhoto: assetUrl('santa/santa-2021.webp?v=2'),
    orientation: 'landscape',
    bonusPhotos: [],
  },
  {
    year: 2022,
    title: 'Candy Canes & Sparkle Shoes',
    subtitle: 'Rowan (10), Elouise (7) & Solomon (4)',
    location: "Sullivan's Hardware",
    handwrittenNote: "Sullivan's North Pole",
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
    handwrittenNote: "Sullivan's • Row - 11 • Lulu - 8 • Sol - 5",
    theme: 'crimson',
    sticker: null,
    mainPhoto: assetUrl('santa/santa-2023.webp?v=2'),
    orientation: 'portrait',
    bonusPhotos: [
      {
        src: assetUrl('santa/santa-2023-bonus-1.webp?v=2'),
        caption: "Sullivan's with the Cousins",
        tilt: '-2deg',
      },
      {
        src: assetUrl('santa/santa-2023-bonus-mi.webp?v=2'),
        caption: 'Great Wolf Lodge Traverse City Michigan with the Cousins',
        tilt: '2deg',
      },
    ],
  },
  {
    year: 2024,
    title: 'Holiday Pajamas at Sullivan’s',
    subtitle: 'Visits with Santa',
    location: "Sullivan's Hardware",
    handwrittenNote: "Maeve's First Christmas",
    theme: 'evergreen',
    sticker: "🎀 Maeve's First Christmas",
    mainPhoto: assetUrl('santa/santa-2024.webp?v=2'),
    orientation: 'landscape',
    bonusPhotos: [],
  },
  {
    year: 2025,
    title: 'Christmas with Santa',
    subtitle: 'The Tradition Continues',
    location: "Sullivan's Hardware",
    handwrittenNote: "Sullivan's Hardware • All dressed up in holiday plaids & velvet with Santa",
    theme: 'gold',
    sticker: null,
    mainPhoto: assetUrl('santa/santa-2025.webp?v=2'),
    orientation: 'portrait',
    bonusPhotos: [],
  },
];

export const ERIN_KATE_SANTA_PAGES = [
  {
    year: 1998,
    title: 'Overalls & Holiday Smiles',
    subtitle: 'Erin & Kate with Santa',
    location: 'Traverse City Mall • December 1998',
    handwrittenNote: 'Traverse City Mall • December 1998 — Erin & Kate in denim overalls with Santa!',
    theme: 'evergreen',
    sticker: '🎄 Traverse City Mall',
    mainPhoto: assetUrl('erin-kate-santa/erin-kate-1998.webp?v=1'),
    orientation: 'portrait',
    bonusPhotos: [
      {
        src: assetUrl('erin-kate-santa/erin-kate-1998-back.webp?v=1'),
        caption: 'Back of Print: “Traverse City Mall December 1998”',
        label: '✍️ PHOTO BACK',
        tilt: '-2deg',
      },
    ],
  },
  {
    year: 1999,
    title: 'Candy Cane Frame & Ribbon Bow',
    subtitle: 'Erin & Kate with Santa',
    location: 'Traverse City Mall • December 1999',
    handwrittenNote: 'Traverse City Mall • December 1999 — Framed with a festive candy cane & red bow',
    theme: 'crimson',
    sticker: '🍬 Candy Cane Keepsake',
    mainPhoto: assetUrl('erin-kate-santa/erin-kate-1999.webp?v=1'),
    orientation: 'portrait',
    bonusPhotos: [
      {
        src: assetUrl('erin-kate-santa/erin-kate-1999-back.webp?v=1'),
        caption: 'Back of Print: “Traverse City Mall December 1999”',
        label: '✍️ PHOTO BACK',
        tilt: '2deg',
      },
    ],
  },
  {
    year: 2000,
    title: 'Christmas Bells & Poinsettias',
    subtitle: 'Sharing a Laugh with Santa',
    location: 'Traverse City Mall • Dec 8, 2000',
    handwrittenNote: 'Traverse City Mall • Dec 8, 2000 — Matching orange tops & holiday bells',
    theme: 'evergreen',
    sticker: '🔔 December 8, 2000',
    mainPhoto: assetUrl('erin-kate-santa/erin-kate-2000.webp?v=1'),
    orientation: 'portrait',
    bonusPhotos: [
      {
        src: assetUrl('erin-kate-santa/erin-kate-2000-back.webp?v=1'),
        caption: 'Back of Print: “Traverse City Mall Dec 8, 2000”',
        label: '✍️ PHOTO BACK',
        tilt: '-2deg',
      },
    ],
  },
  {
    year: 2001,
    title: 'Happy Holidays Oval Portrait',
    subtitle: 'Erin & Kate with Santa',
    location: 'Traverse City Mall',
    handwrittenNote: '2001 • “Happy Holidays” gold oval frame with twinkling Christmas lights',
    theme: 'gold',
    sticker: '✨ Happy Holidays 2001',
    mainPhoto: assetUrl('erin-kate-santa/erin-kate-2001.webp?v=1'),
    orientation: 'portrait',
    bonusPhotos: [],
  },
  {
    year: 2002,
    title: 'Season’s Greetings in Gold',
    subtitle: 'Erin & Kate with Santa',
    location: 'Traverse City Mall',
    handwrittenNote: '2002 • Season’s Greetings gold-framed portrait in Santa’s velvet chair',
    theme: 'gold',
    sticker: '🌟 Season’s Greetings',
    mainPhoto: assetUrl('erin-kate-santa/erin-kate-2002.webp?v=1'),
    orientation: 'portrait',
    bonusPhotos: [],
  },
  {
    year: 2003,
    title: 'Holiday Plaid & Holly Ribbon',
    subtitle: 'Erin & Kate with Santa',
    location: 'Traverse City Mall',
    handwrittenNote: '2003 • Festive tartan plaid border & golden Season’s Greetings script',
    theme: 'crimson',
    sticker: '🎀 Tartan Plaid 2003',
    mainPhoto: assetUrl('erin-kate-santa/erin-kate-2003.webp?v=1'),
    orientation: 'portrait',
    bonusPhotos: [],
  },
  {
    year: 2004,
    title: 'Evergreen Wreath & Holiday Cast',
    subtitle: 'Erin & Kate with Santa',
    location: 'Traverse City Mall',
    handwrittenNote: '2004 • Framed in evergreen boughs & red berries (complete with a decorated arm cast!)',
    theme: 'evergreen',
    sticker: '🌲 Evergreen Frame',
    mainPhoto: assetUrl('erin-kate-santa/erin-kate-2004.webp?v=1'),
    orientation: 'portrait',
    bonusPhotos: [],
  },
  {
    year: 2005,
    title: 'Christmas 2005 Tradition',
    subtitle: 'Erin & Kate with Santa',
    location: 'Traverse City Mall',
    handwrittenNote: 'Christmas 2005 • Growing up fast but keeping the annual Santa tradition alive',
    theme: 'gold',
    sticker: '🎄 Christmas 2005',
    mainPhoto: assetUrl('erin-kate-santa/erin-kate-2005.webp?v=1'),
    orientation: 'portrait',
    bonusPhotos: [],
  },
  {
    year: 2006,
    title: 'Holiday Garland & Red Bow',
    subtitle: 'Erin & Kate with Santa',
    location: 'Traverse City Mall',
    handwrittenNote: '2006 • All smiles with Santa & ornaments on the evergreen garland',
    theme: 'crimson',
    sticker: '🎀 Christmas 2006',
    mainPhoto: assetUrl('erin-kate-santa/erin-kate-2006.webp?v=1'),
    orientation: 'portrait',
    bonusPhotos: [],
  },
  {
    year: 2007,
    title: 'A Decade of Santa Memories',
    subtitle: 'Erin & Kate with Santa',
    location: 'Traverse City Mall',
    handwrittenNote: '2007 • Ten years of Erin & Kate visiting Santa together (1998–2007)!',
    theme: 'evergreen',
    sticker: '🎅 10 Years of Memories',
    mainPhoto: assetUrl('erin-kate-santa/erin-kate-2007.webp?v=1'),
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
        className={`relative p-2 sm:p-3 md:p-3.5 rounded-2xl bg-gradient-to-br ${style.outerBorder} shadow-[0_14px_32px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.25)] border-2 ${style.accentBorder}`}
      >
        {/* Gold Filigree Inner Trim */}
        <div className="relative p-1.5 sm:p-2.5 rounded-xl bg-[#fbf6ea] shadow-[inset_0_2px_8px_rgba(0,0,0,0.28)] border border-[#d4af37]/80">
          {/* Vintage Gold Scrapbook Corner Mounts */}
          <div className="absolute top-1 left-1 w-3.5 h-3.5 border-t-[3px] border-l-[3px] border-[#b38728] rounded-tl-sm pointer-events-none z-20" />
          <div className="absolute top-1 right-1 w-3.5 h-3.5 border-t-[3px] border-r-[3px] border-[#b38728] rounded-tr-sm pointer-events-none z-20" />
          <div className="absolute bottom-1 left-1 w-3.5 h-3.5 border-b-[3px] border-l-[3px] border-[#b38728] rounded-bl-sm pointer-events-none z-20" />
          <div className="absolute bottom-1 right-1 w-3.5 h-3.5 border-b-[3px] border-r-[3px] border-[#b38728] rounded-br-sm pointer-events-none z-20" />

          {/* Main Cropped Photo (Viewport-scaled so the full book always fits on screen) */}
          <div className="relative overflow-hidden rounded-lg bg-stone-900 shadow-inner flex items-center justify-center">
            <img
              src={page.mainPhoto}
              alt={`Santa ${page.year} — ${page.title}`}
              className={`${
                page.orientation === 'landscape'
                  ? 'max-h-[28vh] sm:max-h-[36vh] md:max-h-[40vh] w-auto'
                  : 'max-h-[33vh] sm:max-h-[40vh] md:max-h-[44vh] w-auto'
              } object-contain block transition-transform duration-500 group-hover:scale-[1.015]`}
            />
          </div>

          {/* Bottom Mat Caption Strip */}
          <div className="pt-1.5 pb-3.5 sm:pb-4 px-2 text-center">
            <p className="font-serif italic text-stone-700 text-[11px] sm:text-xs tracking-wide line-clamp-2">
              “{page.handwrittenNote}”
            </p>
          </div>
        </div>

        {/* Prominent Embossed Year Plaque on Frame Border */}
        <div className="-mt-3.5 sm:-mt-4 relative z-30 flex justify-center">
          <div
            className={`px-4 sm:px-6 py-0.5 sm:py-1 rounded-full bg-gradient-to-b ${style.plaqueBg} border-2 ${style.accentBorder} shadow-[0_6px_14px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.3)] flex items-center gap-2`}
          >
            <span className="text-[#e6c469] text-[10px] sm:text-xs">✦</span>
            <span
              className={`font-serif font-bold text-base sm:text-xl tracking-[0.14em] ${style.plaqueText} drop-shadow`}
            >
              {page.year}
            </span>
            <span className="text-[#e6c469] text-[10px] sm:text-xs">✦</span>
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
          title: `${year} Snapshot`,
          caption: bonus.caption,
          theme: 'gold',
        })
      }
      style={{ transform: `rotate(${bonus.tilt || '0deg'})` }}
      className="group relative cursor-zoom-in bg-[#fcf9f2] p-2 sm:p-2.5 pb-3 rounded-xl shadow-[0_10px_24px_rgba(0,0,0,0.75)] border border-[#e2d6b5] hover:rotate-0 hover:scale-[1.03] transition-all duration-300 max-w-[210px] sm:max-w-[230px] w-full mx-auto"
    >
      {/* Festive Red & Gold Washi Tape at Top */}
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-gradient-to-r from-red-800/85 via-amber-500/80 to-red-800/85 rounded-sm shadow-sm border border-amber-200/40 rotate-[-1.5deg] flex items-center justify-center pointer-events-none">
        <span className="text-[8px] font-mono uppercase tracking-widest text-amber-100 font-bold">
          {bonus.label || '★ SNAPSHOT ★'}
        </span>
      </div>

      <div className="overflow-hidden rounded-md bg-stone-900 border border-stone-300 flex items-center justify-center">
        <img
          src={bonus.src}
          alt={bonus.caption}
          className="max-h-[14vh] sm:max-h-[16vh] w-auto object-contain block"
        />
      </div>

      <div className="mt-1.5 text-center px-1">
        <p className="font-serif italic text-stone-800 text-[10px] sm:text-xs font-medium leading-tight line-clamp-2">
          {bonus.caption}
        </p>
      </div>
    </div>
  );
}

function ScrapbookSpread({ page, pageIndex, totalPages, onZoom }) {
  const hasBonus = page.bonusPhotos && page.bonusPhotos.length > 0;

  return (
    <div className="relative bg-gradient-to-br from-[#271911] via-[#1d120c] to-[#150c08] border border-amber-800/70 rounded-r-2xl rounded-l-md p-3 sm:p-5 md:p-6 shadow-[inset_18px_0_35px_rgba(0,0,0,0.75),inset_0_0_25px_rgba(212,175,55,0.06)] overflow-hidden">
      {/* Realistic Left Spine Gutter Crease & Stitched Gold Thread */}
      <div className="absolute top-0 bottom-0 left-0 w-5 sm:w-7 bg-gradient-to-r from-black/80 via-black/35 to-transparent pointer-events-none z-10" />
      <div className="absolute top-2 bottom-2 left-2 sm:left-2.5 w-px border-l border-dashed border-[#d4af37]/35 pointer-events-none z-10" />

      {/* Crimson Silk Bookmark Ribbon Hanging from Top Spine */}
      <div className="absolute -top-1 left-3.5 sm:left-5 w-3.5 sm:w-4 h-8 sm:h-10 bg-gradient-to-b from-[#9e1420] via-[#7a0e18] to-[#570810] shadow-[2px_4px_10px_rgba(0,0,0,0.8)] border-x border-[#e6c469]/40 pointer-events-none z-20 [clip-path:polygon(0_0,100%_0,100%_100%,50%_82%,0_100%)]" />

      {/* Top Corner Ornate Gold Filigree Accents */}
      <div className="absolute top-2.5 right-2.5 w-5 h-5 border-t-2 border-r-2 border-[#d4af37]/45 rounded-tr-md pointer-events-none" />
      <div className="absolute bottom-2.5 right-2.5 w-5 h-5 border-b-2 border-r-2 border-[#d4af37]/45 rounded-br-md pointer-events-none" />

      {/* Spread Header Banner (Compact so the full page fits on screen) */}
      <div className="pl-3 sm:pl-4 flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-amber-900/50">
        <div className="min-w-0">
          {(page.location || page.sticker) && (
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              {page.location && (
                <span className="px-2 py-0.5 rounded-full bg-stone-900/90 border border-stone-700/80 text-[10px] sm:text-[11px] font-sans text-amber-200/90">
                  📍 {page.location}
                </span>
              )}
              {page.sticker && (
                <span className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/40 text-[10px] sm:text-[11px] font-sans text-amber-300">
                  {page.sticker}
                </span>
              )}
            </div>
          )}
          <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-amber-100 tracking-wide leading-tight truncate">
            {page.title}
          </h2>
          {page.subtitle && (
            <p className="text-xs sm:text-sm font-serif italic text-amber-200/80">
              {page.subtitle}
            </p>
          )}
        </div>

        {/* Compact Decorative Year Stamp in Top Right */}
        <div className="flex-shrink-0 px-3 sm:px-4 py-1 rounded-xl bg-[#110a06] border border-[#d4af37]/60 shadow-inner text-center">
          <span className="block text-[8px] font-mono uppercase tracking-[0.18em] text-amber-400/80">
            Year
          </span>
          <span className="font-serif font-bold text-lg sm:text-2xl text-[#fae39c] tracking-widest leading-none">
            {page.year}
          </span>
        </div>
      </div>

      {/* Main Content Layout: Single Centered Heirloom Frame OR 2-Column Spread with Bonus Polaroids */}
      <div
        className={`pl-2 sm:pl-4 grid grid-cols-1 ${
          hasBonus ? 'md:grid-cols-12 gap-4 items-center' : 'place-items-center'
        }`}
      >
        <div className={hasBonus ? 'md:col-span-7 flex justify-center' : 'w-full flex justify-center'}>
          <FramedSantaPhoto page={page} onZoom={onZoom} />
        </div>

        {hasBonus && (
          <div className="md:col-span-5 flex flex-col items-center justify-center gap-3 pt-1 md:pt-0">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-950/90 border border-amber-500/40 text-[10px] font-serif font-semibold text-amber-200 shadow">
              📸 Snapshots ({page.bonusPhotos.length})
            </span>
            <div className="flex flex-row md:flex-col gap-3 w-full items-center justify-center">
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

      {/* Bottom Book Page Footer Number */}
      {typeof pageIndex === 'number' && (
        <div className="mt-3 pt-2 border-t border-amber-900/30 flex items-center justify-between text-[10px] font-serif italic text-amber-200/60 pl-3 sm:pl-4">
          <span>Agan Family Holiday Scrapbook • Click any photo to enlarge</span>
          <span className="font-mono not-italic text-amber-300/75">
            Page {pageIndex + 1} of {totalPages}
          </span>
        </div>
      )}
    </div>
  );
}

export default function SantaScrapbookView({
  onClose,
  pages = SANTA_SCRAPBOOK_PAGES,
  albumTitle = 'Pictures with Santa',
  albumKids = 'Rowan, Elouise, Solomon, Maeve, and Atley',
  albumSubtitle = 'Rowan, Elouise, Solomon, Maeve, and Atley • 2012 – 2025',
  kickerText = '✦ Agan Family Holiday Keepsake ✦',
  coverTheme = 'crimson',
}) {
  const [viewStyle, setViewStyle] = useState('flipbook'); // 'flipbook' | 'all'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [turnDirection, setTurnDirection] = useState(1); // 1 = turning forward (right-to-left), -1 = turning back (left-to-right)
  const [flipTick, setFlipTick] = useState(0);
  const [zoomedItem, setZoomedItem] = useState(null);

  const currentPage = pages[currentIndex] || pages[0];
  const totalPages = pages.length;

  // Turn to a specific page index:
  // Always animates as a single page turn in the appropriate direction directly to the target year
  const navigateToPage = (targetIdx) => {
    if (targetIdx < 0 || targetIdx >= totalPages) return;
    const diff = targetIdx - currentIndex;
    if (diff === 0) return;

    setTurnDirection(diff > 0 ? 1 : -1);
    setFlipTick((t) => t + 1);
    setCurrentIndex(targetIdx);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (zoomedItem) {
        if (e.key === 'Escape') setZoomedItem(null);
        return;
      }
      if (e.key === 'Escape') {
        onClose?.();
      } else if (viewStyle === 'flipbook' && e.key === 'ArrowRight') {
        navigateToPage(Math.min(totalPages - 1, currentIndex + 1));
      } else if (viewStyle === 'flipbook' && e.key === 'ArrowLeft') {
        navigateToPage(Math.max(0, currentIndex - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewStyle, zoomedItem, currentIndex, totalPages, onClose]);

  // 3D Page Turn Variants (hinged along the left book spine)
  const pageTurnVariants = {
    enter: ({ dir }) => ({
      rotateY: dir > 0 ? 78 : -78,
      x: dir > 0 ? 35 : -35,
      opacity: 0.15,
      scale: 0.985,
      transition: {
        duration: 0.42,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
    center: () => ({
      rotateY: 0,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.42,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
    exit: ({ dir }) => ({
      rotateY: dir > 0 ? -78 : 78,
      x: dir > 0 ? -35 : 35,
      opacity: 0.1,
      scale: 0.985,
      transition: {
        duration: 0.36,
        ease: [0.4, 0, 0.2, 1],
      },
    }),
  };

  // Stacked page thickness on left (already turned) and right (remaining)
  const leftStackCount = Math.min(5, currentIndex);
  const rightStackCount = Math.min(5, totalPages - 1 - currentIndex);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#0d0705] text-amber-50 overflow-y-auto flex flex-col"
    >
      {/* Top Sticky Scrapbook Navigation Header */}
      <header className="sticky top-0 z-30 bg-[#140b07]/95 backdrop-blur-md border-b border-amber-900/60 px-3 sm:px-6 py-2 shadow-lg print:hidden">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-xl bg-stone-900 hover:bg-stone-800 border border-amber-900/60 text-xs font-sans text-amber-200 flex items-center gap-1 transition"
            >
              <span>←</span> <span>Library</span>
            </button>
            <div className="hidden sm:block h-4 w-px bg-stone-800" />
            <div>
              <h1 className="text-sm sm:text-base font-serif font-bold text-amber-100 flex items-center gap-1.5 leading-tight">
                <span>🎅</span>
                <span>{albumTitle}</span>
              </h1>
              {albumKids && (
                <p className="text-[11px] font-serif italic text-amber-200/80 leading-tight pl-5">
                  {albumKids}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Switch between Animated Book View & Full Scrollable Scrapbook */}
            <div className="flex bg-stone-950 p-0.5 rounded-xl border border-stone-800 text-xs font-sans">
              <button
                onClick={() => setViewStyle('flipbook')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                  viewStyle === 'flipbook'
                    ? 'bg-amber-800 text-amber-50 font-semibold shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>📖</span> <span>Book</span>
              </button>
              <button
                onClick={() => setViewStyle('all')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                  viewStyle === 'all'
                    ? 'bg-amber-800 text-amber-50 font-semibold shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>🖼️</span> <span>All ({totalPages})</span>
              </button>
            </div>

            <button
              onClick={() => {
                setViewStyle('all');
                setTimeout(() => window.print(), 250);
              }}
              className="hidden md:flex px-3 py-1 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-sans text-amber-200 items-center gap-1 transition"
              title="Print or Save Photo Book as PDF"
            >
              <span>🖨️</span> <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-900 hover:bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-300 text-xs"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>
      </header>

      {/* Main Scrapbook Stage */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-2.5 sm:px-6 py-2 sm:py-3 flex flex-col justify-center">
        {viewStyle === 'flipbook' ? (
          <div className="relative w-full">
            {/* Physical Book Top Year Index Tabs */}
            <div className="max-w-3xl mx-auto px-2 sm:px-4 flex items-end gap-1 overflow-x-auto no-scrollbar pt-0.5">
              {pages.map((p, idx) => {
                const isActive = idx === currentIndex;
                const hasBonus = p.bonusPhotos && p.bonusPhotos.length > 0;
                return (
                  <button
                    key={p.year}
                    onClick={() => navigateToPage(idx)}
                    className={`relative px-2.5 sm:px-3 py-1 rounded-t-lg text-[11px] sm:text-xs font-serif font-bold transition-all flex items-center gap-1 flex-shrink-0 border-t-2 border-x-2 ${
                      isActive
                        ? coverTheme === 'evergreen'
                          ? 'bg-gradient-to-b from-[#165333] via-[#0e3822] to-[#271911] border-[#f3d47c] text-[#fff3c4] shadow-[0_-3px_10px_rgba(212,175,55,0.35)] -mb-0.5 pb-1.5 z-20 scale-105'
                          : 'bg-gradient-to-b from-[#8b151e] via-[#680e15] to-[#271911] border-[#f3d47c] text-[#fff3c4] shadow-[0_-3px_10px_rgba(212,175,55,0.35)] -mb-0.5 pb-1.5 z-20 scale-105'
                        : 'bg-[#1b110c] hover:bg-[#2a1a12] border-amber-900/60 text-amber-200/70 hover:text-amber-100'
                    }`}
                    title={`Flip to ${p.year}`}
                  >
                    <span>{p.year}</span>
                    {hasBonus && <span className="text-[9px] text-amber-300">★</span>}
                  </button>
                );
              })}
            </div>

            {/* 3D Hardcover Leather Book Chassis (Compact so the entire book fits in viewport) */}
            <div
              className={`relative max-w-3xl mx-auto p-2 sm:p-3 rounded-2xl bg-gradient-to-br ${
                coverTheme === 'evergreen'
                  ? 'from-[#14472c] via-[#0c2f1c] to-[#06180e]'
                  : 'from-[#540c12] via-[#38070b] to-[#210306]'
              } border-2 border-[#d4af37]/75 shadow-[0_20px_55px_rgba(0,0,0,0.95),inset_0_2px_5px_rgba(255,255,255,0.2)]`}
            >
              {/* Outer Gold-Tooled Leather Hardcover Trim */}
              <div className="relative rounded-xl border border-[#d4af37]/40 p-1 sm:p-1.5 bg-[#140a06]">
                {/* Left Stacked Turned Page Edges */}
                {leftStackCount > 0 && (
                  <div
                    className="hidden sm:block absolute top-2.5 bottom-2.5 left-0.5 rounded-l-md bg-gradient-to-r from-[#d8c7a6] via-[#efe3ca] to-[#bba886] border-l border-amber-900/50 pointer-events-none z-10"
                    style={{ width: `${leftStackCount * 1.5 + 2}px` }}
                  />
                )}

                {/* Right Stacked Remaining Page Edges */}
                {rightStackCount > 0 && (
                  <div
                    className="hidden sm:block absolute top-2.5 bottom-2.5 right-0.5 rounded-r-md bg-repeating-linear-gradient to-l from-[#cbb894] via-[#f3e8d2] to-[#dfd0b2] border-r border-amber-900/60 pointer-events-none z-20 shadow-inner"
                    style={{ width: `${rightStackCount * 2 + 2}px` }}
                  />
                )}

                {/* 3D Perspective Stage for Turning Pages */}
                <div
                  className="relative overflow-hidden rounded-xl"
                  style={{ perspective: '2000px' }}
                >
                  {/* Animated Flying Page Sheet Overlay During Page Turn */}
                  <AnimatePresence>
                    {flipTick > 0 && (
                      <motion.div
                        key={`leaf-${flipTick}`}
                        initial={{
                          rotateY: turnDirection > 0 ? 0 : -110,
                          opacity: 0.75,
                        }}
                        animate={{
                          rotateY: turnDirection > 0 ? -110 : 0,
                          opacity: 0,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.4,
                          ease: 'easeInOut',
                        }}
                        style={{
                          transformOrigin: 'left center',
                          transformStyle: 'preserve-3d',
                        }}
                        className="absolute inset-0 z-30 pointer-events-none rounded-r-2xl bg-gradient-to-r from-black/50 via-[#f5ead6]/25 to-[#fff8eb]/45 border-r-2 border-[#e6c469]/60 shadow-[20px_0_50px_rgba(0,0,0,0.85)]"
                      />
                    )}
                  </AnimatePresence>

                  {/* Actual Turning Scrapbook Page */}
                  <AnimatePresence
                    mode="wait"
                    initial={false}
                    custom={{ dir: turnDirection }}
                  >
                    <motion.div
                      key={currentPage.year}
                      custom={{ dir: turnDirection }}
                      variants={pageTurnVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      style={{
                        transformOrigin: 'left center',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <ScrapbookSpread
                        page={currentPage}
                        pageIndex={currentIndex}
                        totalPages={totalPages}
                        onZoom={setZoomedItem}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Bottom Book Page Turn Controls */}
            <div className="max-w-3xl mx-auto mt-2.5 flex items-center justify-between gap-2 bg-[#180f0a] border border-amber-900/50 rounded-xl px-3 py-2 shadow-lg">
              <button
                onClick={() => navigateToPage(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="px-3 sm:px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-35 border border-amber-800/50 text-xs font-serif font-bold text-amber-100 flex items-center gap-1.5 transition active:scale-95"
              >
                <span>←</span>
                <span>
                  {currentIndex > 0
                    ? `Back (${pages[currentIndex - 1].year})`
                    : 'Start'}
                </span>
              </button>

              <div className="text-center font-serif">
                <span className="text-xs text-amber-200 font-bold">
                  {currentPage.year} • Page {currentIndex + 1} of {totalPages}
                </span>
              </div>

              <button
                onClick={() => navigateToPage(currentIndex + 1)}
                disabled={currentIndex === totalPages - 1}
                className="px-3 sm:px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-700 to-red-800 hover:from-amber-600 hover:to-red-700 disabled:opacity-35 border border-amber-400/50 text-xs font-serif font-bold text-white flex items-center gap-1.5 shadow transition active:scale-95"
              >
                <span>
                  {currentIndex < totalPages - 1
                    ? `Next (${pages[currentIndex + 1].year})`
                    : 'End'}
                </span>
                <span>→</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Cover Title Card in All-Years Mode */}
            <div
              className={`text-center py-8 px-6 rounded-3xl bg-gradient-to-b ${
                coverTheme === 'evergreen'
                  ? 'from-[#113d25] to-[#071a0f]'
                  : 'from-[#3b090e] to-[#1a0507]'
              } border-2 border-[#d4af37]/70 shadow-2xl`}
            >
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-amber-300 mb-2">
                {kickerText}
              </p>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-2">
                {albumTitle}
              </h2>
              <p className="text-base sm:text-lg font-serif italic text-amber-200">
                {albumSubtitle}
              </p>
            </div>

            {pages.map((page, idx) => (
              <div key={page.year} id={`santa-year-${page.year}`} className="scroll-mt-28">
                <ScrapbookSpread
                  page={page}
                  pageIndex={idx}
                  totalPages={totalPages}
                  onZoom={setZoomedItem}
                />
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
