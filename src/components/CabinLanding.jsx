import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SnowParticles from './SnowParticles';

export default function CabinLanding({ onStepUp }) {
  const [isZooming, setIsZooming] = useState(false);

  const handleEnter = () => {
    setIsZooming(true);
    // Luxurious, slow walk-up timing into the bookshelf
    setTimeout(() => {
      onStepUp();
    }, 2400);
  };

  const bgImage = `${import.meta.env.BASE_URL}cabin-garland.jpg`;
  const foregroundImage = `${import.meta.env.BASE_URL}cabin-garland-foreground.png`;
  const windowCoords = { left: '5.5%', top: '11%', width: '31%', height: '60%' };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0705] select-none">
      {/* Zoomable Camera Container */}
      <motion.div
        className="absolute inset-0 origin-[65%_48%]"
        animate={isZooming ? {
          scale: 2.3,
          filter: 'blur(2px)',
          transition: { duration: 2.6, ease: [0.22, 1, 0.36, 1] }
        } : { scale: 1 }}
      >
        {/* Aspect-Locked Full-Bleed Container:
            On mobile (portrait), shifted to left-[35%] so the snowy window and armchair are front-and-center.
            On desktop/tablets (sm:), centered at left-1/2. */}
        <div 
          className="absolute top-1/2 left-[35%] sm:left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            width: '100vw',
            height: '56.25vw', // 16:9 ratio
            minHeight: '100vh',
            minWidth: '177.78vh',
          }}
        >
          {/* LAYER 1: Background Scene */}
          <img
            src={bgImage}
            alt="Cabin Background"
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none block"
          />

          {/* LAYER 2: Falling Snow (physically behind cabin window) */}
          <div 
            className="absolute pointer-events-none overflow-hidden"
            style={{
              left: windowCoords.left,
              top: windowCoords.top,
              width: windowCoords.width,
              height: windowCoords.height,
            }}
          >
            <SnowParticles count={90} speed={0.9} />
          </div>

          {/* LAYER 3: Cabin Foreground (opaque frame, mullions, armchair, walls) */}
          <img
            src={foregroundImage}
            alt="Cabin Foreground"
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none block z-10"
          />
        </div>
      </motion.div>

      {/* Center Welcome Plaque (Responsive & compact on mobile) */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={isZooming ? { opacity: 0, y: -15, scale: 0.95, transition: { duration: 0.7, ease: 'easeOut' } } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 pointer-events-none z-20"
      >
        <div className="relative text-center px-6 py-8 sm:px-12 sm:py-10 max-w-[340px] sm:max-w-lg bg-[#18110df4] backdrop-blur-md rounded-3xl border border-amber-900/60 shadow-[0_25px_60px_rgba(0,0,0,0.95)] pointer-events-auto">
          {/* Decorative Holly / Candle */}
          <div className="flex items-center justify-center gap-2 mb-2 text-amber-400">
            <span className="text-base sm:text-xl">🕯️</span>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest font-sans font-semibold text-amber-300/80">
              Cozy Hearth & Stories
            </span>
            <span className="text-base sm:text-xl">🕯️</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-amber-100 tracking-wide mb-2 sm:mb-3 drop-shadow">
            Erin's Christmas Library
          </h1>

          <p className="text-stone-300 text-xs sm:text-base font-serif italic mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed">
            Snow is softly falling outside the window, the fire is glowing in the hearth, and a shelf of holiday magic awaits.
          </p>

          <button
            onClick={handleEnter}
            disabled={isZooming}
            className="group px-6 py-3 sm:px-8 sm:py-3.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-amber-50 font-sans font-semibold text-xs sm:text-base rounded-full shadow-[0_8px_25px_rgba(180,83,9,0.5)] border border-amber-400/40 transition-all duration-300 transform active:scale-95 flex items-center gap-2.5 mx-auto"
          >
            <span>Step Up to the Bookshelf</span>
            <span className="group-hover:translate-x-1 transition-transform">✨ →</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
