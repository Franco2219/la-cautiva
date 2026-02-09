import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, Loader2, Filter, Trophy, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tournaments } from "@/lib/constants";
import { getTournamentStyle, getTournamentName } from "@/lib/utils";
import { useStatsData } from "@/hooks/useStatsData";

interface TournamentHistoryViewProps {
  onBack: () => void;
}

export const TournamentHistoryView = ({ onBack }: TournamentHistoryViewProps) => {
  const { historyData, isLoadingStats, fetchChampionHistory } = useStatsData();
  const [selectedTourShort, setSelectedTourShort] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchChampionHistory();
  }, [fetchChampionHistory]);

  // --- VISTA 1: GRILLA DE SELECCIÓN DE TORNEOS ---
  if (!selectedTourShort) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-4xl mx-auto px-2 md:px-0">
        <div className="flex justify-start mb-6">
           <Button onClick={onBack} variant="outline" className="border-slate-300 text-slate-600 font-bold bg-white hover:bg-slate-50">
             <ArrowLeft className="mr-2 h-4 w-4" /> VOLVER AL MENÚ
           </Button>
        </div>

        <h2 className="text-3xl font-black text-[#b35a38] uppercase italic mb-8 text-center">
          Historial de Campeones
        </h2>
        
        {isLoadingStats ? (
           <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 text-[#b35a38] animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {tournaments
              // FILTRO: Sacamos Super 8 y Adelaide completamente
              .filter(t => !t.short.includes("adelaide") && !t.short.includes("s8"))
              .map((t) => {
              const style = getTournamentStyle(t.short);
              return (
                <div 
                  key={t.id}
                  onClick={() => setSelectedTourShort(t.short)}
                  // ESTILO: Fondo de color del torneo, borde blanco sutil, texto blanco
                  className={`${style.color} border-4 border-white/20 rounded-[2rem] p-4 md:p-6 flex flex-col items-center justify-center gap-3 cursor-pointer shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 aspect-square group relative overflow-hidden`}
                >
                  {/* Logo con efecto hover sutil */}
                  <div className="relative w-20 h-20 md:w-28 md:h-28 drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)] transition-transform group-hover:scale-110 duration-300">
                    {style.logo && (
                      <Image 
                        src={style.logo} 
                        alt={t.name} 
                        fill 
                        className="object-contain"
                      />
                    )}
                  </div>
                  {/* Nombre del torneo en blanco */}
                  <h3 className="font-black text-white uppercase text-sm md:text-lg text-center leading-tight drop-shadow-sm tracking-wider">
                    {t.name}
                  </h3>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // --- VISTA 2: DETALLE DEL TORNEO SELECCIONADO ---
  const style = getTournamentStyle(selectedTourShort);
  const tourName = getTournamentName(selectedTourShort);
  
  // LÓGICA DE FILTRADO CORREGIDA (CRÍTICO)
  const filteredData = historyData.filter(d => {
    // Normalizamos para comparar (minusculas y sin espacios extra)
    const excelNameBtn = d.tournament.toLowerCase().trim();
    const appNameBtn = tourName.toLowerCase().trim();

    // Comparación EXACTA del nombre del torneo (ej. "roland garros" === "roland garros")
    const matchTour = excelNameBtn === appNameBtn;
    
    if (!matchTour) return false;
    // Filtro de categoría si está seleccionada
    if (selectedCategory && d.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="w-full max-w-3xl mx-auto animate-in zoom-in-95 duration-300 px-2 md:px-0">
      {/* Botón Volver a la Grilla */}
      <div className="flex justify-start mb-4">
         <Button 
           onClick={() => { setSelectedTourShort(null); setSelectedCategory(null); }} 
           className="bg-white text-slate-600 border-2 border-slate-200 hover:bg-slate-50 font-bold rounded-xl shadow-sm"
         >
           <ArrowLeft className="mr-2 h-4 w-4" /> ELEGIR OTRO TORNEO
         </Button>
      </div>

      {/* HEADER DEL TORNEO MEJORADO */}
      <div className={`${style.color} p-8 rounded-[2.5rem] shadow-xl text-white mb-8 relative overflow-hidden flex items-center justify-center min-h-[180px]`}>
         {/* Logo de fondo "Sombra" completo y centrado */}
         <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
             <div className="relative w-[110%] h-[110%]">
                {style.logo && <Image src={style.logo} alt="Logo BG" fill className="object-contain scale-110" />}
             </div>
         </div>
         
         <div className="relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-wider mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
              {tourName}
            </h2>
            <div className="inline-block bg-white/20 px-6 py-2 rounded-full backdrop-blur-sm">
                <p className="text-white font-bold uppercase text-sm md:text-base tracking-[0.2em]">Galería de Campeones</p>
            </div>
         </div>
      </div>

      {/* FILTROS FLOTANTES */}
      <div className="mb-8 text-center space-y-4 sticky top-4 z-20 bg-[#fffaf5]/80 backdrop-blur-md py-4 rounded-2xl md:static md:bg-transparent md:backdrop-blur-none md:py-0">
         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <Filter className="w-4 h-4" /> Filtrar por categoría
         </p>
         <div className="flex flex-wrap justify-center gap-3">
            {["A", "B1", "B2", "C"].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`px-5 py-2.5 rounded-2xl font-black text-sm md:text-base transition-all duration-200 shadow-md active:scale-95 ${
                  selectedCategory === cat 
                    ? `${style.color} text-white border-2 border-white/20 ring-2 ring-offset-2 ring-${style.color.replace('bg-', '')}`
                    : "bg-white text-slate-500 border-2 border-slate-100 hover:border-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
         </div>
      </div>

      {/* LISTA DE CAMPEONES (MURAL) */}
      <div className="space-y-4 pb-12">
        {filteredData.length > 0 ? (
          filteredData.map((record, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-md p-5 flex items-stretch relative overflow-hidden group transition-all hover:shadow-lg ring-1 ring-slate-100 hover:ring-[#b35a38]/30">
               {/* Barra lateral de color del torneo */}
               <div className={`absolute left-0 top-0 bottom-0 w-2 ${style.color}`}></div>

               {/* Año */}
               <div className="flex flex-col items-center justify-center min-w-[70px] border-r-2 border-slate-100 pr-5 mr-5 pl-2">
                  <span className="text-3xl font-black text-slate-700 tracking-tighter leading-none">{record.year}</span>
                  <span className={`text-[10px] font-black text-white px-2 py-1 rounded-full uppercase mt-2 ${style.color}`}>
                    Cat {record.category}
                  </span>
               </div>

               {/* Datos Jugadores */}
               <div className="flex-1 flex flex-col justify-center gap-2 py-1">
                  {/* CAMPEÓN */}
                  <div className="flex items-center gap-3">
                     <div className="bg-amber-100 p-2 rounded-full">
                        <Trophy className="w-6 h-6 text-amber-500 shrink-0 drop-shadow-sm" />
                     </div>
                     <div className="flex flex-col items-start">
                         <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider leading-none mb-0.5">Campeón</span>
                         <span className="font-black text-xl text-slate-800 uppercase leading-none flex items-baseline gap-2">
                            {record.champion}
                            {record.winCount && record.winCount > 1 && (
                               <span className={`text-sm text-white px-2 rounded-full font-black relative -top-0.5 ${style.color}`}>
                                 x{record.winCount}
                               </span>
                            )}
                         </span>
                     </div>
                  </div>
                  
                  {/* SUBCAMPEÓN (si existe) */}
                  {record.runnerUp && (
                    <div className="flex items-center gap-3 mt-1 ml-1 opacity-70 group-hover:opacity-100 transition-opacity">
                       <div className="p-1.5 rounded-full">
                          <Medal className="w-5 h-5 text-slate-400 shrink-0" />
                       </div>
                       <div className="flex flex-col items-start">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Finalista</span>
                         <span className="font-bold text-base text-slate-500 uppercase leading-none">
                            {record.runnerUp}
                         </span>
                       </div>
                    </div>
                  )}
               </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-[2rem] border-4 border-dashed border-slate-100 shadow-sm mx-4">
             <Trophy className="w-16 h-16 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-400 font-bold text-lg">No hay campeones registrados<br/>para esta selección.</p>
          </div>
        )}
      </div>
    </div>
  );
};