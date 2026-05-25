// src/components/tournament/Countdown.tsx
"use client";

import { useState, useEffect } from 'react';

export default function Countdown() {
  // Seteamos la fecha límite: 30 de Mayo de 2026 a las 12:00 hs
  const TARGET_DATE = new Date('2026-05-30T12:00:00').getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = TARGET_DATE - now;

      if (difference <= 0) {
        setTimeLeft((prev) => ({ ...prev, isOver: true }));
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [TARGET_DATE]);

  if (timeLeft.isOver) {
    return (
      <div className="my-4 text-center font-black text-red-600 tracking-wide uppercase animate-pulse text-sm md:text-base">
        ❌ Las inscripciones están cerradas
      </div>
    );
  }

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="my-5 flex flex-col items-center justify-center font-sans animate-in fade-in duration-500">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
        Cierre de inscripciones en:
      </p>
      <div className="flex gap-3 text-[#b35a38] font-black text-2xl md:text-3xl italic">
        <div className="flex flex-col items-center">
          <span>{formatNumber(timeLeft.days)}</span>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider not-italic">días</span>
        </div>
        <span className="animate-pulse">:</span>
        <div className="flex flex-col items-center">
          <span>{formatNumber(timeLeft.hours)}</span>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider not-italic">hs</span>
        </div>
        <span className="animate-pulse">:</span>
        <div className="flex flex-col items-center">
          <span>{formatNumber(timeLeft.minutes)}</span>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider not-italic">min</span>
        </div>
        <span className="animate-pulse">:</span>
        <div className="flex flex-col items-center">
          <span>{formatNumber(timeLeft.seconds)}</span>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider not-italic">seg</span>
        </div>
      </div>
    </div>
  );
}