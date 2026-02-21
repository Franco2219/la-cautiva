import React, { useState, useMemo } from "react";
import { ArrowLeft, Search, User, Crown } from "lucide-react"; 

interface MatchRecord {
  Torneo: string;
  Categoria: string;
  Fase: string;
  Jugador: string;
  Rival: string;
  Resultado: string;
  Fecha: string;
  tournament: string;
  category: string;
  round: string;
  winner: string;
  loser: string;
  date: string;
  score: string;
}

interface ProfileData {
  name: string;
  age: string;
  hand: string;
  photo: string;
}

interface PlayerDetailViewProps {
  playerName: string;
  onBack: () => void; 
  matchesData: MatchRecord[];
  profileData?: ProfileData | null;
}

export const PlayerDetailView = ({ playerName, onBack, matchesData, profileData }: PlayerDetailViewProps) => {
  const [rivalSearch, setRivalSearch] = useState("");

  const safeStr = (val: any) => {
      if (val === null || val === undefined) return "";
      return String(val).trim();
  };

  const getP1 = (m: any) => safeStr(m.jugador || m.Jugador); 
  const getP2 = (m: any) => safeStr(m.rival || m.Rival);     
  const getRound = (m: any) => safeStr(m.round || m.Fase || "-");
  const getScore = (m: any) => safeStr(m.score || m.Resultado || "-");
  const getTour = (m: any) => safeStr(m.tournament || m.Torneo || "-");
  const getDate = (m: any) => safeStr(m.date || m.Fecha || "");

  const parseDate = (dateVal: any): Date | null => {
    const dateStr = safeStr(dateVal);
    if (!dateStr) return null;

    try {
        if (dateStr.includes("/")) {
            const parts = dateStr.split("/");
            if (parts.length === 3) {
                const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                if (!isNaN(d.getTime())) return d;
            }
        }
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    } catch (e) {
        return null;
    }
  };

  const playerMatches = useMemo(() => {
    if (!matchesData || !Array.isArray(matchesData)) return [];

    return matchesData.filter((m: any) => {
      const p1 = getP1(m);
      const p2 = getP2(m);
      return p1 === playerName || p2 === playerName;
    }).sort((a: any, b: any) => {
        const dateA = parseDate(getDate(a));
        const dateB = parseDate(getDate(b));
        const timeA = dateA ? dateA.getTime() : 0;
        const timeB = dateB ? dateB.getTime() : 0;
        return timeB - timeA; 
    });
  }, [matchesData, playerName]);

  const bestResults2026 = useMemo(() => {
    const matches2026 = playerMatches.filter((m: any) => {
       const d = parseDate(getDate(m));
       return d && d.getFullYear() === 2026;
    });

    if (matches2026.length === 0) return ["Sin torneos en 2026"];

    const roundHierarchy: Record<string, number> = {
        "campeon": 12, 
        "final": 10, "semifinal": 8, "semi": 8, "cuartos": 6, "octavos": 4, "zona": 1, "grupo": 1
    };

    let maxPoints = 0;
    let bestTournaments: string[] = [];

    matches2026.forEach((m: any) => {
        const roundKey = getRound(m).toLowerCase();
        let points = roundHierarchy[roundKey] || 0;
        
        let resultLabel = "";
        const tourName = getTour(m);
        const niceRound = getRound(m);

        if (roundKey === "final") {
            const p1 = getP1(m);
            // Acá también usamos el cálculo de ganador por score si quisieramos más precisión
            // pero mantenemos tu lógica intacta para el resumen
            if (p1 === playerName) {
                points = 12;
                resultLabel = `Campeón ${tourName}`;
            } else {
                points = 10;
                resultLabel = `Finalista ${tourName}`;
            }
        }
        else if (points === 0) {
            if (roundKey.includes("semi")) points = 8;
            else if (roundKey.includes("cuartos")) points = 6;
            else if (roundKey.includes("octavos")) points = 4;
            else if (roundKey.includes("zona") || roundKey.includes("grupo")) points = 1;
        }

        if (!resultLabel) {
            if (roundKey.includes("semi")) resultLabel = `Semifinal ${tourName}`;
            else if (roundKey.includes("cuartos")) resultLabel = `Cuartos ${tourName}`;
            else if (roundKey.includes("octavos")) resultLabel = `Octavos ${tourName}`;
            else resultLabel = `${niceRound} ${tourName}`;
        }

        if (points >= maxPoints) {
            if (points > maxPoints) {
                maxPoints = points;
                bestTournaments = [resultLabel];
            } else if (!bestTournaments.includes(resultLabel)) {
                bestTournaments.push(resultLabel);
            }
        }
    });
    
    if (bestTournaments.length === 0) return ["Participante"];
    return [...new Set(bestTournaments)];
  }, [playerMatches, playerName]);

  const displayedMatches = useMemo(() => {
    if (!rivalSearch) return playerMatches;
    const search = rivalSearch.toLowerCase();
    return playerMatches.filter((m: any) => {
        const p1 = getP1(m);
        const p2 = getP2(m);
        const rival = p1 === playerName ? p2 : p1;
        return rival.toLowerCase().includes(search);
    });
  }, [playerMatches, rivalSearch, playerName]);

  const lastCategory = playerMatches.length > 0 ? safeStr((playerMatches[0] as any).Categoria || (playerMatches[0] as any).category) : "-";
  
  const formatDateDisplay = (dateVal: any) => {
      try {
        const d = parseDate(dateVal);
        if (!d) return "-";
        const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
        return `${months[d.getMonth()]} ${d.getFullYear()}`;
      } catch (e) { return "-"; }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-in slide-in-from-right duration-500 px-2 md:px-0 pb-20">
      
      {/* HEADER PERFIL */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 flex flex-col items-center text-center mb-8 relative overflow-hidden mt-8">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#b35a38]/10 to-transparent pointer-events-none" />
        
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg bg-slate-200 overflow-hidden relative mb-4 z-10 flex items-center justify-center">
             {profileData && profileData.photo ? (
                 <img 
                    src={profileData.photo} 
                    alt={playerName} 
                    className="w-full h-full object-cover"
                 />
             ) : (
                 <User className="w-20 h-20 text-slate-400" />
             )}
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-slate-800 uppercase tracking-tight mb-6 z-10">
            {playerName}
        </h1>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 w-full z-10">
            <InfoBox label="Mano Habil" value={profileData?.hand || "-"} />
            <InfoBox label="Edad" value={profileData?.age || "-"} />
            
            <InfoBox label="Categoría" value={`Cat ${lastCategory}`} highlight />
            <div className="bg-[#b35a38] text-white px-6 py-3 rounded-2xl shadow-md flex flex-col min-w-[140px]">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Mejor 2026</span>
                {bestResults2026.map((res, i) => (
                    <span key={i} className="font-black text-sm md:text-base leading-tight block">{res}</span>
                ))}
            </div>
        </div>
      </div>

      {/* BUSCADOR RIVAL */}
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

      {/* LISTADO PARTIDOS */}
      <div className="space-y-3">
        {displayedMatches.length > 0 ? (
            displayedMatches.map((match, idx) => {
                const originalP1 = getP1(match); 
                const originalP2 = getP2(match); 
                const originalScore = getScore(match);
                
                // --- 1. Calcular Ganador Analizando el Score ---
                let winnerNum = 1; 
                let p1Sets = 0;
                let p2Sets = 0;
                
                const sets = originalScore.trim().split(/\s+/);
                sets.forEach(s => {
                    let p1Games, p2Games;
                    if (s.includes('/')) {
                        const parts = s.split('/');
                        p1Games = parseInt(parts[0], 10);
                        p2Games = parseInt(parts[1], 10);
                    } else if (s.includes('-')) {
                        const parts = s.split('-');
                        p1Games = parseInt(parts[0], 10);
                        p2Games = parseInt(parts[1], 10);
                    }
                    
                    if (p1Games !== undefined && p2Games !== undefined && !isNaN(p1Games) && !isNaN(p2Games)) {
                        if (p1Games > p2Games) p1Sets++;
                        else if (p2Games > p1Games) p2Sets++;
                    }
                });
                
                if (p2Sets > p1Sets) winnerNum = 2;
                
                const actualWinnerName = winnerNum === 1 ? originalP1 : originalP2;
                const didProfileWin = actualWinnerName === playerName;
                
                // --- 2. Anclar jugador del perfil a la izquierda siempre ---
                const isProfileP1 = originalP1 === playerName;
                const displayLeftName = playerName;
                const displayRightName = isProfileP1 ? originalP2 : originalP1;
                
                // --- 3. Invertir el resultado visualmente si se cambiaron de lado ---
                let displayScore = originalScore;
                if (!isProfileP1) {
                    displayScore = sets.map(s => {
                        if (s.includes('/')) {
                            const [g1, g2] = s.split('/');
                            return `${g2}/${g1}`;
                        } else if (s.includes('-')) {
                            const [g1, g2] = s.split('-');
                            return `${g2}-${g1}`;
                        }
                        return s;
                    }).join(' ');
                }

                return (
                    <div key={idx} className={`bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-4 border-l-4 ${didProfileWin ? 'border-green-500' : 'border-red-400'}`}>
                        <div className="flex flex-col items-center min-w-[60px] border-r border-slate-100 pr-4">
                            <span className="text-xs font-black text-slate-400 uppercase">{formatDateDisplay(getDate(match))}</span>
                            <span className="text-[10px] font-bold text-[#b35a38] bg-[#b35a38]/10 px-2 py-0.5 rounded-full mt-1">{getTour(match)}</span>
                        </div>
                        
                        <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-4 text-center">
                            
                            {/* LADO IZQUIERDO: PERFIL ACTUAL */}
                            <div className={`flex items-center justify-end gap-1 font-bold text-sm md:text-base text-slate-900`}>
                                {displayLeftName} 
                                {didProfileWin && <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />}
                            </div>

                            {/* SCORE (SE ADAPTA DINAMICAMENTE) */}
                            <div className={`px-3 py-1 rounded-lg font-black tracking-widest text-sm whitespace-nowrap border-2 ${
                                didProfileWin 
                                ? 'bg-green-100 text-green-700 border-green-200' 
                                : 'bg-red-50 text-red-700 border-red-100'
                            }`}>
                                {displayScore}
                            </div>

                            {/* LADO DERECHO: RIVAL */}
                            <div className={`flex items-center justify-start gap-1 font-bold text-sm md:text-base text-slate-500`}>
                                {!didProfileWin && <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />} 
                                {displayRightName}
                            </div>
                        </div>

                        <div className="hidden md:flex flex-col items-end min-w-[80px] pl-4 border-l border-slate-100">
                             <span className="text-xs font-bold text-slate-400 uppercase">Instancia</span>
                             <span className="font-black text-slate-700 text-sm uppercase">{getRound(match)}</span>
                        </div>
                    </div>
                );
            })
        ) : (
            <div className="text-center py-12">
                <p className="text-slate-400 font-bold">No hay partidos registrados.</p>
            </div>
        )}
      </div>
    </div>
  );
};

const InfoBox = ({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) => (
    <div className={`flex flex-col items-center justify-center p-3 rounded-2xl min-w-[100px] ${highlight ? 'bg-orange-50 border border-orange-100' : 'bg-slate-50 border border-slate-100'}`}>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</span>
        <span className={`font-black text-base ${highlight ? 'text-[#b35a38]' : 'text-slate-700'}`}>{value}</span>
    </div>
);