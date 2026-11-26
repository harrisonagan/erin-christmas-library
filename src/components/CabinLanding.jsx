import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SnowParticles from './SnowParticles';

export default function CabinLanding({ onStepUp }) {
  const [isZooming, setIsZooming] = useState(false);
  const [showMouse, setShowMouse] = useState(false);
  const [mouseDissolve, setMouseDissolve] = useState(false);

  const handleEnter = () => {
    setIsZooming(true);
    // Plaque fades out (0s - 0.4s)
    // Mouse appears right as camera rushes forward into the hearth (~400ms)
    setTimeout(() => {
      setShowMouse(true);
    }, 400);

    // Mouse softly dissolves into warm holiday glow as covers load (~2150ms)
    setTimeout(() => {
      setMouseDissolve(true);
    }, 2150);

    // Transition smoothly into Cover Gallery view (~2700ms)
    setTimeout(() => {
      onStepUp();
    }, 2700);
  };

  const bgImage = `${import.meta.env.BASE_URL}cabin-garland.jpg`;
  const foregroundImage = `${import.meta.env.BASE_URL}cabin-garland-foreground.png`;
  const mouseImage = `${import.meta.env.BASE_URL}christmas-mouse.webp`;
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

      {/* Keepsake Mouse Greeting During Camera Zoom */}
      <AnimatePresence>
        {showMouse && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 35 }}
            animate={
              mouseDissolve
                ? {
                    opacity: 0,
                    scale: 1.25,
                    filter: 'blur(10px)',
                    transition: { duration: 0.52, ease: 'easeIn' },
                  }
                : {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    transition: { type: 'spring', damping: 18, stiffness: 220 },
                  }
            }
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(8px)' }}
            className="fixed inset-0 flex items-center justify-center p-4 z-30 pointer-events-none select-none"
          >
            <div className="relative flex flex-col items-center">
              {/* Cozy golden candlelight back-glow */}
              <div className="absolute -inset-12 bg-amber-400/25 blur-3xl rounded-full pointer-events-none" />
              <div className="absolute -inset-6 bg-orange-500/20 blur-2xl rounded-full animate-pulse pointer-events-none" />

              {/* Floating magical sparkles */}
              {[
                { icon: '✨', x: -75, y: -50, delay: 0.1 },
                { icon: '⭐', x: 80, y: -30, delay: 0.25 },
                { icon: '🍪', x: -85, y: 35, delay: 0.15 },
                { icon: '✨', x: 75, y: 45, delay: 0.35 },
              ].map((sp, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, scale: 0.4, y: 15 }}
                  animate={{
                    opacity: [0, 1, 0.85, 0],
                    scale: [0.5, 1.2, 1, 0.7],
                    y: [-10, -45],
                  }}
                  transition={{
                    duration: 1.8,
                    delay: sp.delay,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                  className="absolute pointer-events-none text-base sm:text-xl select-none"
                  style={{ left: `calc(50% + ${sp.x}px)`, top: `calc(50% + ${sp.y}px)` }}
                >
                  {sp.icon}
                </motion.span>
              ))}

              {/* Keepsake Mouse Figurine with Gentle Cheerful Bobbing */}
              <motion.div
                animate={{
                  y: [0, -6, 0, -4, 0],
                  rotate: [0, 1.8, -1.2, 0.8, 0],
                  scale: [1, 1.02, 0.99, 1.01, 1],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative flex flex-col items-center"
              >
                {/* "Merry Christmas!" Voice Cloud with Stretched Trail Dots from Mouth Level Up-Right */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.7, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.35, ease: 'easeOut' }}
                  className="absolute -top-[2%] left-[68%] z-40 whitespace-nowrap filter drop-shadow-[0_8px_18px_rgba(0,0,0,0.7)] pointer-events-none"
                >
                  <div className="relative inline-flex items-center justify-center select-none">
                    <svg
                      viewBox="-14 0 176 118"
                      className="w-36 sm:w-48 h-auto block"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <linearGradient id="cabinCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#ffffff" />
                          <stop offset="100%" stopColor="#fefaf3" />
                        </linearGradient>
                      </defs>

                      {/* Fluffy Voice Cloud Body */}
                      <path
                        d="M 41.1 46.1 A 15 15 0 0 1 41.1 17.9 A 15 15 0 0 1 69.0 12.5 A 16 16 0 0 1 99.8 15.3 A 15 15 0 0 1 128.9 17.9 A 15 15 0 0 1 130.8 46.6 A 15 15 0 0 1 100.5 45.0 A 16 16 0 0 1 69.0 51.5 A 15 15 0 0 1 41.1 46.1 Z"
                        fill="url(#cabinCloudGrad)"
                        stroke="#c2782b"
                        strokeWidth="1.2"
                      />

                      {/* Stretched trail dots arcing from mouth/cheek level up-right to the cloud */}
                      <circle cx="36" cy="53" r="3.5" fill="#ffffff" stroke="#c2782b" strokeWidth="1" />
                      <circle cx="26" cy="68" r="2.7" fill="#ffffff" stroke="#c2782b" strokeWidth="0.85" />
                      <circle cx="16" cy="83" r="2.0" fill="#ffffff" stroke="#c2782b" strokeWidth="0.7" />
                      <circle cx="6" cy="98" r="1.5" fill="#ffffff" stroke="#c2782b" strokeWidth="0.55" />
                      <circle cx="-4" cy="112" r="1.1" fill="#ffffff" stroke="#c2782b" strokeWidth="0.45" />

                      {/* Centered "Merry Christmas!" Text */}
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

                <img
                  src={mouseImage}
                  alt="Vintage Keepsake Christmas Mouse holding a cookie"
                  className="w-36 sm:w-48 h-auto object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.9)] filter contrast-[1.04] brightness-[1.03]"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `${import.meta.env.BASE_URL}christmas-mouse.png`;
                  }}
                />
                {/* Contact shadow */}
                <div className="w-24 sm:w-32 h-3 bg-black/80 blur-sm rounded-full -mt-2 pointer-events-none" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Welcome Plaque (Responsive & compact on mobile) */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={isZooming ? { opacity: 0, y: -15, scale: 0.95, transition: { duration: 0.6, ease: 'easeOut' } } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 pointer-events-none z-20"
      >
        <div className="relative text-center px-6 py-8 sm:px-12 sm:py-10 max-w-[340px] sm:max-w-lg bg-[#18110df4] backdrop-blur-md rounded-3xl border border-amber-900/60 shadow-[0_25px_60px_rgba(0,0,0,0.95)] pointer-events-auto">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-amber-100 tracking-wide mb-3 sm:mb-4 drop-shadow">
            Erin's Christmas Library
          </h1>

          <p className="text-stone-300 text-xs sm:text-base font-serif italic mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed">
            A cherished collection of vintage Christmas books that is an ingredient in making Christmas magic.
          </p>

          <button
            onClick={handleEnter}
            disabled={isZooming}
            className="group px-6 py-3 sm:px-8 sm:py-3.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-amber-50 font-sans font-semibold text-xs sm:text-base rounded-full shadow-[0_8px_25px_rgba(180,83,9,0.5)] border border-amber-400/40 transition-all duration-300 transform active:scale-95 flex items-center gap-2.5 mx-auto"
          >
            <span>Step into the Library</span>
            <span className="group-hover:translate-x-1 transition-transform">✨ →</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
