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
      x: (Math.random() - 0.5) * 50,
      y: -15 - Math.random() * 30,
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
      className={`relative group cursor-pointer flex-shrink-0 select-none flex flex-col items-center justify-end z-20 ${className}`}
      style={{ minWidth: '68px' }}
      title="Erin's Christmas Keepsake Mouse (Click me!)"
    >
      {/* Small "Merry Christmas" Voice Cloud (Hovers gently to the right of the mouse with trail dots to mouth) */}
      <AnimatePresence>
        {showVoiceCloud && (
          <motion.div
            initial={{ opacity: 0, x: -8, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -6, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 450, damping: 24 }}
            className="absolute left-[72%] sm:left-[76%] bottom-[44%] sm:bottom-[48%] z-40 pointer-events-none whitespace-nowrap"
          >
            <div className="relative inline-flex items-center justify-center filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.65)] select-none">
              <svg
                viewBox="-14 0 170 74"
                className="w-32 sm:w-36 h-auto block"
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
                  d="M 41.1 46.1 A 15 15 0 0 1 41.1 17.9 A 15 15 0 0 1 69.0 12.5 A 16 16 0 0 1 99.8 15.3 A 15 15 0 0 1 128.9 17.9 A 15 15 0 0 1 130.8 46.6 A 15 15 0 0 1 100.5 45.0 A 16 16 0 0 1 69.0 51.5 A 15 15 0 0 1 41.1 46.1 Z"
                  fill="url(#cloudWhiteGrad)"
                  stroke="#c2782b"
                  strokeWidth="1.2"
                />

                {/* Voice cloud trail dots leading down-left directly to the mouse's mouth */}
                <circle cx="32" cy="50" r="3.5" fill="#ffffff" stroke="#c2782b" strokeWidth="1" />
                <circle cx="22" cy="55" r="2.5" fill="#ffffff" stroke="#c2782b" strokeWidth="0.8" />
                <circle cx="12" cy="60" r="1.8" fill="#ffffff" stroke="#c2782b" strokeWidth="0.6" />
                <circle cx="3" cy="65" r="1.2" fill="#ffffff" stroke="#c2782b" strokeWidth="0.5" />
                <circle cx="-5" cy="69" r="0.9" fill="#ffffff" stroke="#c2782b" strokeWidth="0.4" />

                {/* Perfectly Centered "Merry Christmas!" Text */}
                <text
                  x="85"
                  y="32"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="Georgia, 'Times New Roman', serif"
                  fontWeight="bold"
                  fontSize="11"
                  fill="#7a1e28"
                  letterSpacing="0.2"
                >
                  Merry Christmas!
                </text>
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Sparkles when clicked */}
      <AnimatePresence>
        {sparkles.map((sp) => (
          <motion.span
            key={sp.id}
            initial={{ opacity: 1, x: 0, y: -30, scale: 0.5 }}
            animate={{ opacity: 0, x: sp.x, y: sp.y - 30, scale: sp.scale }}
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
                y: [0, -16, -3, -8, 0],
                rotate: [0, -4, 4, -2, 0],
                scale: [1, 1.12, 0.98, 1.04, 1],
                transition: { duration: 0.55, ease: 'easeInOut' }
              }
            : {
                y: [0, -3, 0, -1.5, 0],
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
          y: -5,
          scale: 1.05,
          transition: { type: 'spring', stiffness: 400, damping: 20 }
        }}
        className="relative flex flex-col items-center"
      >
        {/* Soft magical candlelight halo behind mouse bonnet */}
        <div className="absolute top-2 w-16 h-16 bg-amber-400/15 rounded-full blur-md pointer-events-none" />

        {/* High-Resolution Annalee Christmas Mouse Cutout */}
        <img
          src={mouseImage}
          alt="Vintage Christmas Keepsake Mouse perched on the top shelf holding a gingerbread cookie"
          className="w-[56px] sm:w-[66px] h-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)] filter contrast-[1.04] brightness-[1.02]"
          loading="eager"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = `${import.meta.env.BASE_URL}christmas-mouse.png`;
          }}
        />

        {/* Realistic Wooden Shelf Contact Shadow underneath green felt slippers */}
        <div className="w-12 sm:w-14 h-2 bg-black/85 blur-xs rounded-full pointer-events-none -mt-1 -z-10" />
      </motion.div>
    </div>
  );
}
