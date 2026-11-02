import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/dashboard');
  };

  return (
    <main
      className="relative w-screen h-screen overflow-hidden select-none"
      style={{
        backgroundImage: "url('/BG.png')",
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      <h1 className="sr-only">KAVACH Child Safety Quest</h1>

      {/* Floating Canva Start Button */}
      <button
        onClick={handleStart}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-none bg-transparent p-0 cursor-pointer focus:outline-none transition-transform active:scale-95 group"
        aria-label="Start Child Safety Quest and enter dashboard"
      >
        <img
          src="/BUTTON.png"
          alt="Start Quest Button"
          className="w-[280px] sm:w-[380px] md:w-[450px] animate-[startFloat_2s_ease-in-out_infinite] [image-rendering:pixelated] drop-shadow-[0_12px_0_#1e293b] filter group-hover:drop-shadow-[0_0_35px_#00eaff] transition-all"
        />
      </button>

      {/* Subtle bottom badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs text-cyan-200 tracking-wider font-['Fredoka']">
        ✨ CLICK TO LAUNCH DASHBOARD
      </div>
    </main>
  );
}
