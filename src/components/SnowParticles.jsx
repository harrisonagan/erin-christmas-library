import React, { useEffect, useRef } from 'react';

/**
 * Natural, peaceful holiday snowfall simulation.
 * Confined strictly to the window pane looking out onto the winter pines.
 */
export default function SnowParticles({ className = '', count = 85, speed = 1 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Flakes with natural variation in size and falling speed
    const flakes = Array.from({ length: count }, () => {
      const isTiny = Math.random() < 0.45;
      const radius = isTiny ? Math.random() * 0.9 + 0.6 : Math.random() * 1.6 + 1.1;
      const alpha = isTiny ? Math.random() * 0.4 + 0.35 : Math.random() * 0.45 + 0.5;
      const speedY = (isTiny ? Math.random() * 0.6 + 0.4 : Math.random() * 1.0 + 0.7) * speed;

      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius,
        alpha,
        speedY,
        swaySpeed: Math.random() * 0.015 + 0.008,
        swayMagnitude: Math.random() * 0.8 + 0.3,
        swayPhase: Math.random() * Math.PI * 2,
      };
    });

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.015;

      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        
        f.y += f.speedY;
        f.x += Math.sin(time * f.swaySpeed + f.swayPhase) * f.swayMagnitude;

        // Reset cleanly when falling out of the window
        if (f.y > canvas.height + 4) {
          f.y = -4;
          f.x = Math.random() * canvas.width;
        }
        if (f.x > canvas.width) f.x = 0;
        if (f.x < 0) f.x = canvas.width;

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${f.alpha})`;
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2, false);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [count, speed]);

  return <canvas ref={canvasRef} className={`w-full h-full pointer-events-none ${className}`} />;
}
