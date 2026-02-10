import React, { useState, useMemo } from "react";
import Image from "next/image";
import { ArrowLeft, Search, Trophy, Calendar, user } from "lucide-react";
import { useStatsData } from "@/hooks/useStatsData"; // Asegúrate de importar tu hook

// Tipos de datos (ajusta si tus campos se llaman distinto en la DB)
interface MatchData {
  date: string | Date; // Puede venir como string ISO o Date
  tournament: string;
  category: string;
  round: string; // Ej: "Final", "Semi", "Cuartos", "Zona"
  winner: string;
  loser: string;
  score: string;
  year?: number; // Si ya lo tienes procesado, sino lo sacamos de date
}

interface PlayerDetailViewProps {
  playerName: string;
  onBack: () => void;
}

export const PlayerDetailView = ({ playerName, onBack }: PlayerDetailViewProps) => {
  const { matches } = useStatsData(); // Traemos todos los partidos
  const [rivalSearch, setRivalSearch] = useState("");

  // 1. FILTRAR PARTIDOS DEL JUGADOR
  const playerMatches = useMemo(() => {
    if (!matches) return [];
    return matches.filter((m: MatchData) => 
      m.winner.trim() === playerName || m.loser.trim() === playerName
    ).sort((a: MatchData, b: MatchData) => {
        // Ordenar por fecha descendente (lo más nuevo primero)
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
    });
  }, [matches, playerName]);

  // 2. LÓGICA DE MEJOR RESULTADO 2026
  const bestResults2026 = useMemo(() => {
    const matches2026 = playerMatches.filter((m: MatchData) => {
       const d = new Date(m.date);
       return d.getFullYear() === 2026 || m.year === 2026;
    });

    if (matches2026.length === 0) return ["Sin torneos en 2026"];

    // Definimos jerarquía de rondas para comparar
    const roundHierarchy: Record<string, number> = {
        "final": 10,
        "semifinal": 8,
        "semi": 8,
        "cuartos": 6,
        "octavos": 4,
        "16avos": 3,
        "zona": 1,
        "grupo": 1
    };

    let maxPoints = 0;
    let bestTournaments: string[] = [];

    matches2026.forEach((m: MatchData) => {
        const roundKey = m.round.toLowerCase().trim();
        let points = roundHierarchy[roundKey] || 0;
        let resultLabel = "";

        // Si ganó la final, es CAMPEÓN (puntos extra)
        if (roundKey === "final" && m.winner.trim() === playerName) {
            points = 12; 
            resultLabel = `Campeón ${m.tournament}`;
        } else {
             // Si perdió, esa fue su instancia alcanzada.
             // Si ganó en semis, llegó a final (ya lo veremos en el partido de la final).
             // Por ende, nos fijamos "hasta donde llegó" revisando donde perdió o si ganó la final.
             
             // Simplificación: Vamos a guardar los "Hitos".
             if (roundKey === "final") resultLabel = `Finalista ${m.tournament}`;
             if (roundKey.includes("semi")) resultLabel = `Semifinal ${m.tournament}`;
             if (roundKey.includes("cuartos")) resultLabel = `Cuartos ${m.tournament}`;
        }

        if (points > maxPoints) {
            maxPoints = points;
            bestTournaments = [resultLabel];
        } else if (points === maxPoints && points > 0) {
            // Si empató su mejor marca en otro torneo, lo agregamos
            if (!bestTournaments.includes(resultLabel)) {
                bestTournaments.push(resultLabel);
            }
        }
    });
    
    // Si no encontró nada relevante (ej. solo jugó zonas y ganó/perdió sin clasificar)
    if (bestTournaments.length === 0) return ["Participante"];

    return bestTournaments;
  }, [playerMatches, playerName]);


  // 3. FILTRO HEAD TO HEAD (RIVAL)
  const displayedMatches = useMemo(() => {
    if (!rivalSearch) return playerMatches;
    
    const search = rivalSearch.toLowerCase();
    return playerMatches.filter((m: MatchData) => {
        const rival = m.winner.trim() === playerName ? m.loser : m.winner;
        return rival.toLowerCase().includes(search);
    });
  }, [playerMatches, rivalSearch, playerName]);


  // --- DATOS FICTICIOS O CALCULADOS ---
  // Como Db_Master suele tener solo partidos, estos datos a veces no están.
  // Ponemos lógica para deducirlos o placeholders.
  const lastCategory = playerMatches.length > 0 ? playerMatches[0].category : "-";
  
  // Función para formatear fecha (Mes Año)
  const formatDate = (dateStr: string | Date) => {
      const d = new Date(dateStr);
      // Array de meses corto en español
      const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
      return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-in slide-in-from-right duration-500 px-2 md:px-0 pb-20">
      
      {/* BOTÓN VOLVER */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 font-bold hover:text-[#b35a38] transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" /> Volver al listado
      </button>

      {/* --- TARJETA DE PERFIL (HEADER) --- */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 flex flex-col items-center text-center mb-8 relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#b35a38]/10 to-transparent pointer-events-none" />

        {/* FOTO */}
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg bg-slate-200 overflow-hidden relative mb-4 z-10">
            {/* Aquí iría la lógica: si existe foto del jugador, mostrarla. Sino, placeholder */}
            <div className="w-full h-full flex items-center justify-center bg-slate-300 text-slate-400">
               <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
        </div>

        {/* NOMBRE */}
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 uppercase tracking-tight mb-6 z-10">
            {playerName}
        </h1>

        {/* ROW DE INFO (Mano, Edad, Cat, Mejor Resultado) */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 w-full z-10">
            {/* CADA CAJITA DE INFO */}
            <InfoBox label="Mano Habil" value="Diestro" /> {/* Placeholder, cambiar si tienes el dato */}
            <InfoBox label="Edad" value="28 Años" />       {/* Placeholder */}
            <InfoBox label="Categoría" value={`Cat ${lastCategory}`} highlight />
            
            {/* CAJA ESPECIAL: MEJOR RESULTADO 2026 */}
            <div className="bg-[#b35a38] text-white px-6 py-3 rounded-2xl shadow-md flex flex-col min-w-[140px]">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Mejor 2026</span>
                {bestResults2026.map((res, i) => (
                    <span key={i} className="font-black text-sm md:text-base leading-tight">
                        {res}
                    </span>
                ))}
            </div>
        </div>
      </div>

      {/* --- BARRA DE BÚSQUEDA (HEAD TO HEAD) --- */}
      <div className="flex items-center gap-4 mb-6 bg-slate-100 p-2 rounded-2xl md:w-2/3 mx-auto">
         <div className="bg-white p-2 rounded-xl shadow-sm">
            <Search className="w-5 h-5 text-[#b35a38]" />
         </div>
         <input 
            type="text" 
            placeholder="Buscar historial contra un rival..." 
            value={rivalSearch}
            onChange={(e) => setRivalSearch(e.target.value)}
            className="bg-transparent w-full font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none"
         />
      </div>

      {/* --- LISTADO DE PARTIDOS --- */}
      <div className="space-y-3">
        {displayedMatches.length > 0 ? (
            displayedMatches.map((match, idx) => {
                const isWinner = match.winner.trim() === playerName;
                const rivalName = isWinner ? match.loser : match.winner;
                const resultColor = isWinner ? "text-green-600" : "text-red-500";
                const borderClass = isWinner ? "border-l-4 border-green-500" : "border-l-4 border-red-400";

                return (
                    <div key={idx} className={`bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-4 ${borderClass}`}>
                        
                        {/* FECHA (Mes Año) */}
                        <div className="flex flex-col items-center min-w-[60px] border-r border-slate-100 pr-4">
                            <span className="text-xs font-black text-slate-400 uppercase">
                                {formatDate(match.date)}
                            </span>
                            <span className="text-[10px] font-bold text-[#b35a38] bg-[#b35a38]/10 px-2 py-0.5 rounded-full mt-1">
                                {match.tournament}
                            </span>
                        </div>

                        {/* DETALLE DEL PARTIDO */}
                        <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-4 text-center">
                            {/* JUGADOR (Siempre a la izquierda para referencia visual o mantenemos lógica real?) 
                                -> Mejor mantener lógica real: Winner vs Loser para ver el resultado claro */}
                            
                            <div className={`text-right font-bold text-sm md:text-base ${match.winner.trim() === playerName ? 'text-slate-900' : 'text-slate-500'}`}>
                                {match.winner}
                            </div>

                            <div className="bg-slate-100 px-3 py-1 rounded-lg font-black text-slate-700 tracking-widest text-sm whitespace-nowrap">
                                {match.score}
                            </div>

                            <div className={`text-left font-bold text-sm md:text-base ${match.loser.trim() === playerName ? 'text-slate-900' : 'text-slate-500'}`}>
                                {match.loser}
                            </div>
                        </div>

                        {/* INSTANCIA */}
                        <div className="hidden md:flex flex-col items-end min-w-[80px] pl-4 border-l border-slate-100">
                             <span className="text-xs font-bold text-slate-400 uppercase">Instancia</span>
                             <span className="font-black text-slate-700 text-sm uppercase">{match.round}</span>
                             <span className={`text-xs font-bold mt-1 ${isWinner ? "text-green-600" : "text-red-500"}`}>
                                {isWinner ? "VICTORIA" : "DERROTA"}
                             </span>
                        </div>
                    </div>
                );
            })
        ) : (
            <div className="text-center py-12">
                <p className="text-slate-400 font-bold">
                    {rivalSearch ? "No hay partidos contra este rival." : "No hay partidos registrados."}
                </p>
            </div>
        )}
      </div>

    </div>
  );
};

// Subcomponente simple para las cajitas de info
const InfoBox = ({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) => (
    <div className={`flex flex-col items-center justify-center p-3 rounded-2xl min-w-[100px] ${highlight ? 'bg-orange-50 border border-orange-100' : 'bg-slate-50 border border-slate-100'}`}>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</span>
        <span className={`font-black text-base ${highlight ? 'text-[#b35a38]' : 'text-slate-700'}`}>
            {value}
        </span>
    </div>
);