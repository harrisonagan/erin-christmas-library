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
      {/* Small "Merry Christmas" Voice Cloud (Hovers gently to the left of the mouse over the top molding) */}
      <AnimatePresence>
        {showVoiceCloud && (
          <motion.div
            initial={{ opacity: 0, x: 8, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 6, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 450, damping: 24 }}
            className="absolute right-full mr-1.5 bottom-[40%] sm:bottom-[45%] z-40 pointer-events-none whitespace-nowrap"
          >
            <div className="relative inline-flex items-center justify-center filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.65)] select-none">
              <svg
                viewBox="0 0 152 64"
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
                  d="M 29.3 45.0 A 15 15 0 0 1 29.3 17.0 A 15 15 0 0 1 57.0 12.5 A 16 16 0 0 1 87.8 15.3 A 15 15 0 0 1 116.7 17.0 A 15 15 0 0 1 118.6 45.6 A 15 15 0 0 1 88.5 43.0 A 16 16 0 0 1 57.0 49.5 A 15 15 0 0 1 29.3 45.0 Z"
                  fill="url(#cloudWhiteGrad)"
                  stroke="#c2782b"
                  strokeWidth="1.2"
                />

                {/* Trail Bubbles leading to the mouse on the right */}
                <circle cx="126" cy="46" r="3.5" fill="#ffffff" stroke="#c2782b" strokeWidth="1" />
                <circle cx="135" cy="52" r="2.2" fill="#ffffff" stroke="#c2782b" strokeWidth="0.8" />
                <circle cx="143" cy="57" r="1.4" fill="#ffffff" stroke="#c2782b" strokeWidth="0.6" />

                {/* Perfectly Centered "Merry Christmas!" Text */}
                <text
                  x="72"
                  y="31"
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
          className="w-[64px] sm:w-[74px] h-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)] filter contrast-[1.04] brightness-[1.02]"
          loading="eager"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = `${import.meta.env.BASE_URL}christmas-mouse.png`;
          }}
        />

        {/* Realistic Wooden Shelf Contact Shadow underneath green felt slippers */}
        <div className="w-14 sm:w-16 h-2 bg-black/85 blur-xs rounded-full pointer-events-none -mt-1 -z-10" />
      </motion.div>
    </div>
  );
}
