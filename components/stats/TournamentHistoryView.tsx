import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Filter, Trophy, Medal } from "lucide-react";
import { tournaments } from "@/lib/constants";
import { getTournamentStyle, getTournamentName } from "@/lib/utils";
import { useStatsData } from "@/hooks/useStatsData";

interface TournamentHistoryViewProps {
  selectedTour: string | null;
  onSelectTour: (tour: string | null) => void;
}

export const TournamentHistoryView = ({ selectedTour, onSelectTour }: TournamentHistoryViewProps) => {
  const { historyData, isLoadingStats, fetchChampionHistory } = useStatsData();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchChampionHistory();
  }, [fetchChampionHistory]);

  // --- VISTA ESPECIAL: MÁS GANADORES POR CATEGORÍA ---
  if (selectedTour === "most_winners") {
      // 1. Filtrar por categoría si existe
      const filteredByCat = selectedCategory 
        ? historyData.filter(d => d.category === selectedCategory)
        : historyData;

      // 2. Contar victorias y GUARDAR TORNEOS por jugador
      const winCounts: Record<string, number> = {};
      const winTrophies: Record<string, string[]> = {}; 

      filteredByCat.forEach(record => {
          const name = record.champion.trim();
          winCounts[name] = (winCounts[name] || 0) + 1;

          if (!winTrophies[name]) winTrophies[name] = [];
          
          const tourObj = tournaments.find(t => t.name.toLowerCase() === record.tournament.toLowerCase().trim()) 
                          || tournaments.find(t => t.id.toLowerCase() === record.tournament.toLowerCase().trim());
          
          const tourCode = tourObj ? tourObj.short : record.tournament;
          winTrophies[name].push(tourCode);
      });

      // 3. Convertir a array y ordenar
      const ranking = Object.entries(winCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      let currentRank = 0;
      let lastCount = -1;

      return (
        <div className="w-full max-w-3xl mx-auto animate-in zoom-in-95 duration-300 px-2 md:px-0">
            {/* Header Naranja */}
            <div className="bg-[#b35a38] p-8 rounded-[2.5rem] shadow-xl text-white mb-8 relative overflow-hidden flex items-center justify-center min-h-[180px] mt-4">
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
                    <Trophy className="w-64 h-64 scale-150" />
                </div>
                <div className="relative z-10 text-center">
                    <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-wider mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                    Máximos Ganadores
                    </h2>
                    <div className="inline-block bg-white/20 px-6 py-2 rounded-full backdrop-blur-sm">
                        <p className="text-white font-bold uppercase text-sm md:text-base tracking-[0.2em]">Ranking por Títulos</p>
                    </div>
                </div>
            </div>

            {/* LEYENDA */}
            <p className="text-center text-slate-400 font-bold text-xs uppercase tracking-widest mb-2 opacity-80">
                Incluye Torneos Atp 500 y 250
            </p>

            {/* Filtros */}
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
                            ? "bg-[#b35a38] text-white border-2 border-white/20 ring-2 ring-offset-2 ring-[#b35a38]"
                            : "bg-white text-slate-500 border-2 border-slate-100 hover:border-slate-300"
                        }`}
                    >
                        {cat}
                    </button>
                    ))}
                </div>
            </div>

            {/* Lista de Ganadores (DISEÑO INVERTIDO) */}
            <div className="space-y-3 pb-12">
                {ranking.length > 0 ? (
                    ranking.map((player, idx) => {
                        if (player.count !== lastCount) {
                            currentRank = idx + 1;
                            lastCount = player.count;
                        }
                        
                        const isFirst = currentRank === 1;

                        return (
                            <div key={idx} className="bg-[#b35a38] rounded-2xl shadow-sm p-5 flex flex-col md:flex-row items-start md:items-center border-l-8 border-white hover:shadow-md transition-all group gap-2 md:gap-0">
                                <div className="flex items-center w-full md:w-auto">
                                    {/* POSICIÓN EN BLANCO TRASLUCIDO */}
                                    <div className="w-14 text-center font-black text-white/50 text-3xl italic mr-2 shrink-0">
                                        #{currentRank}
                                    </div>
                                    <div className="flex-1 flex flex-wrap items-baseline gap-2">
                                        {/* NOMBRE EN NEGRO */}
                                        <span className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight leading-none drop-shadow-sm">
                                            {player.name}
                                        </span>
                                        {/* CONTADOR EN BLANCO */}
                                        {player.count > 1 && (
                                            <span className="text-white font-black text-xl leading-none">
                                                ({player.count})
                                            </span>
                                        )}
                                        {/* COPA EN BLANCO (Móvil) */}
                                        {isFirst && <Trophy className="w-6 h-6 text-white drop-shadow-sm shrink-0 md:hidden ml-2" />}
                                    </div>
                                </div>

                                {/* LOGOS DE LOS TORNEOS GANADOS */}
                                <div className="flex flex-wrap gap-1.5 ml-14 md:ml-4 mt-1 md:mt-0">
                                    {winTrophies[player.name] && winTrophies[player.name].map((tourCode, tIdx) => {
                                        const tStyle = getTournamentStyle(tourCode);
                                        if (!tStyle.logo) return null;
                                        return (
                                            <div key={tIdx} className="relative w-6 h-6 md:w-7 md:h-7 hover:scale-125 transition-transform" title={tourCode}>
                                                <Image 
                                                    src={tStyle.logo} 
                                                    alt={tourCode} 
                                                    fill 
                                                    className="object-contain" 
                                                />
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* COPA EN BLANCO (Desktop) */}
                                {isFirst && <Trophy className="w-8 h-8 text-white drop-shadow-sm shrink-0 ml-auto hidden md:block" />}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-16 bg-white rounded-[2rem] border-4 border-dashed border-slate-100 shadow-sm mx-4">
                        <p className="text-slate-400 font-bold text-lg">No hay campeones registrados<br/>para esta selección.</p>
                    </div>
                )}
            </div>
        </div>
      );
  }

  // --- VISTA 1: GRILLA DE SELECCIÓN DE TORNEOS ---
  if (!selectedTour) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-4xl mx-auto px-2 md:px-0">
        <h2 className="text-3xl font-black text-[#b35a38] uppercase italic mb-8 text-center mt-4">
          Historial de Campeones
        </h2>
        
        {isLoadingStats ? (
           <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 text-[#b35a38] animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {tournaments
              .filter(t => !t.id.toLowerCase().includes("adelaide") && !t.id.toLowerCase().includes("s8"))
              .map((t) => {
              const style = getTournamentStyle(t.short);
              return (
                <div 
                  key={t.id}
                  onClick={() => onSelectTour(t.short)}
                  className={`${style.color} border-4 border-white/20 rounded-[2rem] p-4 md:p-6 flex flex-col items-center justify-center gap-3 cursor-pointer shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 aspect-square group relative overflow-hidden`}
                >
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
                  <h3 className="font-black text-white uppercase text-sm md:text-lg text-center leading-tight drop-shadow-sm tracking-wider">
                    {t.name}
                  </h3>
                </div>
              );
            })}

            {/* --- BOTÓN MAS GANADORES POR CATEGORIA --- */}
            <div 
                onClick={() => onSelectTour("most_winners")}
                className="bg-[#b35a38] border-4 border-white/20 rounded-[2rem] p-4 md:p-6 flex flex-col items-center justify-center gap-3 cursor-pointer shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 aspect-square group relative overflow-hidden text-center"
            >
                <div className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)] transition-transform group-hover:scale-110 duration-300">
                    <Trophy className="w-full h-full text-white" />
                </div>
                <h3 className="font-black text-white uppercase text-xs md:text-sm text-center leading-tight drop-shadow-sm tracking-wider">
                    MÁS GANADORES<br/>POR CATEGORÍA
                </h3>
            </div>

          </div>
        )}
      </div>
    );
  }

  // --- VISTA 2: DETALLE DEL TORNEO SELECCIONADO (LÓGICA INTACTA) ---
  const style = getTournamentStyle(selectedTour);
  const tourName = getTournamentName(selectedTour);
  
  const textColorClass = style.color.replace('bg-', 'text-');

  const filteredData = historyData.filter(d => {
    const excelNameBtn = d.tournament.toLowerCase().trim();
    const appNameBtn = tourName.toLowerCase().trim();
    const matchTour = excelNameBtn === appNameBtn;
    
    if (!matchTour) return false;
    if (selectedCategory && d.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="w-full max-w-3xl mx-auto animate-in zoom-in-95 duration-300 px-2 md:px-0">
      
      {/* HEADER DEL TORNEO */}
      <div className={`${style.color} p-8 rounded-[2.5rem] shadow-xl text-white mb-8 relative overflow-hidden flex items-center justify-center min-h-[180px] mt-4`}>
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

      {/* LISTA DE CAMPEONES */}
      <div className="space-y-4 pb-12">
        {filteredData.length > 0 ? (
          filteredData.map((record, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-md p-5 flex items-stretch relative overflow-hidden group transition-all hover:shadow-lg ring-1 ring-slate-100 hover:ring-[#b35a38]/30">
               <div className={`absolute left-0 top-0 bottom-0 w-2 ${style.color}`}></div>

               <div className="flex flex-col items-center justify-center min-w-[70px] border-r-2 border-slate-100 pr-5 mr-5 pl-2">
                  <span className="text-3xl font-black text-slate-700 tracking-tighter leading-none">{record.year}</span>
                  <span className={`text-[10px] font-black text-white px-2 py-1 rounded-full uppercase mt-2 ${style.color}`}>
                    Cat {record.category}
                  </span>
               </div>

               <div className="flex-1 flex flex-col justify-center gap-2 py-1">
                  <div className="flex items-center gap-3">
                     <div className="bg-amber-100 p-2 rounded-full">
                        <Trophy className="w-6 h-6 text-amber-500 shrink-0 drop-shadow-sm" />
                     </div>
                     <div className="flex flex-col items-start">
                         <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider leading-none mb-0.5">Campeón</span>
                         <span className="font-black text-xl text-slate-800 uppercase leading-none flex items-baseline gap-2">
                            {record.champion}
                            {/* CONTADOR EN PARENTESIS COLOR */}
                            {record.winCount && record.winCount > 1 && (
                               <span className={`text-lg font-black ml-1 ${textColorClass}`}>
                                 ({record.winCount})
                               </span>
                            )}
                         </span>
                     </div>
                  </div>
                  
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