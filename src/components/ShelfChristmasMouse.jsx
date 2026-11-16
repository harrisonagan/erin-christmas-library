import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShelfChristmasMouse({ className = '' }) {
  const [showVoiceCloud, setShowVoiceCloud] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [sparkles, setSparkles] = useState([]);

  const mouseImage = `${import.meta.env.BASE_URL}christmas-mouse.webp`;

  const handleMouseClick = (e) => {
    e?.stopPropagation();
    setIsJumping(true);
    setShowVoiceCloud(true);

    // Spawn cheerful golden cookie crumb sparkles
    const newSparkles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 55,
      y: -15 - Math.random() * 35,
      scale: 0.6 + Math.random() * 0.6,
      icon: ['✨', '⭐', '🍪', '✦'][Math.floor(Math.random() * 4)],
    }));
    setSparkles(newSparkles);

    setTimeout(() => setIsJumping(false), 550);
    setTimeout(() => setSparkles([]), 1100);
  };

  // Auto-dismiss voice cloud after 4.5 seconds
  useEffect(() => {
    if (!showVoiceCloud) return;
    const timer = setTimeout(() => setShowVoiceCloud(false), 4500);
    return () => clearTimeout(timer);
  }, [showVoiceCloud]);

  return (
    <div
      onClick={handleMouseClick}
      className={`relative group cursor-pointer flex-shrink-0 select-none mx-2 sm:mx-3 flex flex-col items-center justify-end z-20 ${className}`}
      style={{ minWidth: '78px' }}
      title="Erin's Christmas Keepsake Mouse (Click me!)"
    >
      {/* Small "Merry Christmas" Voice Cloud */}
      <AnimatePresence>
        {showVoiceCloud && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.75 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="absolute bottom-[92%] sm:bottom-[94%] left-1/2 -translate-x-1/2 z-40 pointer-events-none"
          >
            <div className="relative inline-flex items-center justify-center filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.55)] select-none">
              <svg
                viewBox="0 0 138 58"
                className="w-28 sm:w-32 h-auto block"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="cloudWhiteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#fefaf3" />
                  </linearGradient>
                </defs>

                {/* Fluffy Voice Cloud Body */}
                <path
                  d="M 24 32 A 14 14 0 0 1 36 16 A 18 18 0 0 1 68 12 A 18 18 0 0 1 100 16 A 15 15 0 0 1 114 30 A 14 14 0 0 1 106 44 A 18 18 0 0 1 74 46 A 18 18 0 0 1 42 44 A 14 14 0 0 1 24 32 Z"
                  fill="url(#cloudWhiteGrad)"
                  stroke="#c2782b"
                  strokeWidth="1.2"
                />

                {/* Cloud Tail Bubbles leading down to the mouse head */}
                <circle cx="52" cy="49" r="3.2" fill="#ffffff" stroke="#c2782b" strokeWidth="1" />
                <circle cx="45" cy="54" r="2" fill="#ffffff" stroke="#c2782b" strokeWidth="0.8" />
              </svg>

              {/* Centered Voice Cloud Text */}
              <div className="absolute inset-0 pb-3 flex items-center justify-center pointer-events-none">
                <span className="font-serif font-bold text-[10px] sm:text-[11px] text-[#7a1e28] tracking-wider whitespace-nowrap drop-shadow-[0_1px_0_rgba(255,255,255,0.95)]">
                  Merry Christmas!
                </span>
              </div>
            </div>
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

      {/* Hover Callout Tag (only when voice cloud is not active) */}
      {!showVoiceCloud && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/85 border border-amber-400/50 text-[7.5px] font-serif text-amber-200 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none z-30">
          🍪 Tap Mouse!
        </div>
      )}

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
