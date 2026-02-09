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

  // Si no hay torneo seleccionado, mostramos la GRILLA
  if (!selectedTourShort) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-4xl mx-auto">
        <div className="flex justify-start mb-6">
           <Button onClick={onBack} variant="outline" className="border-slate-300 text-slate-600 font-bold">
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
            {tournaments.filter(t => t.id !== "adelaide_250" && t.id !== "s8_250").map((t) => {
              const style = getTournamentStyle(t.short);
              return (
                <div 
                  key={t.id}
                  onClick={() => setSelectedTourShort(t.short)}
                  className="bg-white border-2 border-slate-200 hover:border-[#b35a38] rounded-3xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 aspect-square"
                >
                  <div className="relative w-24 h-24 md:w-32 md:h-32">
                    {style.logo && (
                      <Image 
                        src={style.logo} 
                        alt={t.name} 
                        fill 
                        className="object-contain"
                      />
                    )}
                  </div>
                  <h3 className="font-black text-slate-700 uppercase text-sm md:text-lg text-center leading-tight">
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

  // VISTA DETALLADA DEL TORNEO
  const style = getTournamentStyle(selectedTourShort);
  const tourName = getTournamentName(selectedTourShort);
  
  // Filtramos los datos
  const filteredData = historyData.filter(d => {
    // Coincidencia laxa de nombre de torneo
    const matchTour = d.tournament.toLowerCase().includes(selectedTourShort.toLowerCase()) || 
                      selectedTourShort.toLowerCase().includes(d.tournament.toLowerCase());
    
    if (!matchTour) return false;
    if (selectedCategory && d.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="w-full max-w-3xl mx-auto animate-in zoom-in-95 duration-300">
      {/* Botón Volver a la Grilla */}
      <div className="flex justify-start mb-4">
         <Button 
           onClick={() => { setSelectedTourShort(null); setSelectedCategory(null); }} 
           className="bg-white text-slate-600 border-2 border-slate-200 hover:bg-slate-50 font-bold rounded-xl"
         >
           <ArrowLeft className="mr-2 h-4 w-4" /> VOLVER A TORNEOS
         </Button>
      </div>

      {/* HEADER DEL TORNEO */}
      <div className={`${style.color} p-6 rounded-[2rem] shadow-xl text-white mb-6 relative overflow-hidden`}>
         <div className="absolute top-0 right-0 w-32 h-32 opacity-10 transform translate-x-8 -translate-y-8">
            {style.logo && <Image src={style.logo} alt="Logo BG" fill className="object-contain" />}
         </div>
         <div className="relative z-10 text-center">
            <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-wider mb-1 drop-shadow-md">
              {tourName}
            </h2>
            <p className="text-white/80 font-bold uppercase text-sm tracking-widest">Galería de Campeones</p>
         </div>
      </div>

      {/* FILTROS FLOTANTES */}
      <div className="mb-8 text-center space-y-3">
         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <Filter className="w-3 h-3" /> Haga click en una categoría para filtrar
         </p>
         <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {["A", "B1", "B2", "C"].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`px-6 py-2 rounded-full font-black text-sm md:text-base transition-all duration-300 shadow-sm border-b-4 active:border-b-0 active:translate-y-1 ${
                  selectedCategory === cat 
                    ? "bg-[#b35a38] text-white border-[#8c3d26]" 
                    : "bg-white text-slate-500 border-slate-200 hover:text-[#b35a38] hover:border-[#b35a38]/30"
                }`}
              >
                {cat}
              </button>
            ))}
         </div>
      </div>

      {/* LISTA DE CAMPEONES (MURAL) */}
      <div className="space-y-4">
        {filteredData.length > 0 ? (
          filteredData.map((record, idx) => (
            <div key={idx} className="bg-white border-l-8 border-slate-200 rounded-r-2xl shadow-md p-4 flex items-center justify-between hover:border-[#b35a38] transition-colors group">
               {/* Año y Categoría */}
               <div className="flex flex-col items-center justify-center min-w-[60px] border-r border-slate-100 pr-4 mr-4">
                  <span className="text-2xl font-black text-slate-700">{record.year}</span>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase mt-1">Cat {record.category}</span>
               </div>

               {/* Datos Jugadores */}
               <div className="flex-1 text-left">
                  {/* CAMPEÓN */}
                  <div className="flex items-center gap-2 mb-2">
                     <Trophy className="w-5 h-5 text-amber-400 shrink-0 drop-shadow-sm" />
                     <span className="font-black text-lg text-slate-800 uppercase leading-none">
                        {record.champion}
                        {record.winCount && record.winCount > 1 && (
                           <span className="ml-2 text-xs text-[#b35a38] font-black align-top relative -top-1">
                             ({record.winCount})
                           </span>
                        )}
                     </span>
                  </div>
                  {/* SUBCAMPEÓN */}
                  {record.runnerUp && (
                    <div className="flex items-center gap-2 pl-1">
                       <Medal className="w-4 h-4 text-slate-300 shrink-0" />
                       <span className="font-bold text-sm text-slate-400 uppercase leading-none">
                          {record.runnerUp}
                       </span>
                    </div>
                  )}
               </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
             <p className="text-slate-400 font-bold">No se encontraron registros para esta selección.</p>
          </div>
        )}
      </div>
    </div>
  );
};