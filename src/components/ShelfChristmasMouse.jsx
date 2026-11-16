import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Authentic Annalee-style Christmas Keepsake Mouse on the Shelf
const MOUSE_QUOTES = [
  "Shh! I'm guarding Erin's Christmas cookies! 🍪",
  "I found the cozy spot on the shelf! 🎄",
  "Have you read 'Mice Skating' yet? One of my favorites! ⛸️",
  "Watching over the library just like the Elf on the Shelf! ✨",
  "Merry Christmas to Erin & family! 🎁",
  "Don't tell Santa I took a nibble of this gingerbread! 🤫",
  "Warm tea and holiday stories... nothing better! ☕",
  "I love listening to Christmas bedtime stories from up here! 📖"
];

export default function ShelfChristmasMouse({ className = '' }) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [sparkles, setSparkles] = useState([]);

  const mouseImage = `${import.meta.env.BASE_URL}christmas-mouse.webp`;

  const handleMouseClick = (e) => {
    e?.stopPropagation();
    setIsJumping(true);
    setShowSpeechBubble(true);
    setQuoteIndex((prev) => (prev + 1) % MOUSE_QUOTES.length);

    // Spawn cheerful golden cookie crumb sparkles
    const newSparkles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 60,
      y: -20 - Math.random() * 40,
      scale: 0.6 + Math.random() * 0.6,
      icon: ['✨', '⭐', '🍪', '✦'][Math.floor(Math.random() * 4)],
    }));
    setSparkles(newSparkles);

    setTimeout(() => setIsJumping(false), 600);
    setTimeout(() => setSparkles([]), 1200);
  };

  // Auto-dismiss speech bubble after 5 seconds
  useEffect(() => {
    if (!showSpeechBubble) return;
    const timer = setTimeout(() => setShowSpeechBubble(false), 5000);
    return () => clearTimeout(timer);
  }, [showSpeechBubble, quoteIndex]);

  return (
    <div
      onClick={handleMouseClick}
      className={`relative group cursor-pointer flex-shrink-0 select-none mx-2 sm:mx-3 flex flex-col items-center justify-end z-20 ${className}`}
      style={{ minWidth: '78px' }}
      title="Erin's Christmas Keepsake Mouse (Click me!)"
    >
      {/* Interactive Speech Bubble */}
      <AnimatePresence>
        {showSpeechBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className="absolute -top-24 sm:-top-28 left-1/2 -translate-x-1/2 z-40 w-52 sm:w-60 max-w-[85vw] bg-[#251a13f6] backdrop-blur-md border border-amber-500/70 text-amber-50 p-2.5 sm:p-3 rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.9)] text-center pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-serif text-[11px] sm:text-xs leading-snug text-amber-100 font-medium">
              "{MOUSE_QUOTES[quoteIndex]}"
            </p>
            <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-amber-900/40 text-[9px] text-amber-300/80 font-mono">
              <span>🐭 Holiday Shelf Mouse</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSpeechBubble(false);
                }}
                className="text-stone-400 hover:text-stone-200 px-1"
              >
                ✕
              </button>
            </div>

            {/* Speech bubble pointer arrow */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-amber-600/90" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Sparkles when clicked */}
      <AnimatePresence>
        {sparkles.map((sp) => (
          <motion.span
            key={sp.id}
            initial={{ opacity: 1, x: 0, y: -40, scale: 0.5 }}
            animate={{ opacity: 0, x: sp.x, y: sp.y - 40, scale: sp.scale }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="absolute z-40 pointer-events-none text-xs select-none"
          >
            {sp.icon}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Hover Callout Tag */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/85 border border-amber-400/50 text-[8px] font-serif text-amber-200 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none z-30">
        🍪 Tap Mouse!
      </div>

      {/* The Animated Christmas Mouse Figurine */}
      <motion.div
        animate={
          isJumping
            ? {
                y: [0, -18, -4, -10, 0],
                rotate: [0, -5, 5, -2, 0],
                scale: [1, 1.14, 0.98, 1.05, 1],
                transition: { duration: 0.55, ease: 'easeInOut' }
              }
            : {
                y: [0, -3.5, 0, -1.8, 0],
                rotate: [0, 1.2, -0.9, 0.6, 0],
                scale: [1, 1.015, 0.995, 1],
                transition: {
                  duration: 4.2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }
              }
        }
        whileHover={{
          y: -6,
          scale: 1.06,
          transition: { type: 'spring', stiffness: 400, damping: 20 }
        }}
        className="relative flex flex-col items-center"
      >
        {/* Soft magical candlelight halo behind mouse bonnet */}
        <div className="absolute top-2 w-20 h-20 bg-amber-400/15 rounded-full blur-md pointer-events-none" />

        {/* High-Resolution Annalee Christmas Mouse Cutout */}
        <img
          src={mouseImage}
          alt="Vintage Christmas Keepsake Mouse on the Shelf holding a gingerbread cookie"
          className="w-[74px] sm:w-[86px] h-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)] filter contrast-[1.04] brightness-[1.02]"
          loading="eager"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = `${import.meta.env.BASE_URL}christmas-mouse.png`;
          }}
        />

        {/* Realistic Wooden Shelf Contact Shadow underneath green felt slippers */}
        <div className="w-16 h-2 bg-black/85 blur-xs rounded-full pointer-events-none -mt-1 -z-10" />
      </motion.div>
    </div>
  );
}
