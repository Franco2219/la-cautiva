import React, { useState, useMemo, useEffect } from "react";
import { Search, Filter, User } from "lucide-react";
import { useStatsData, MatchRecord } from "@/hooks/useStatsData";
import { PlayerDetailView } from "./PlayerDetailView"; 

// Interfaz para el mapeo de datos
interface MatchData {
  jugador?: string;
  Jugador?: string;
  rival?: string;
  Rival?: string;
  categoria?: string;
  Categoria?: string;
  category?: string; 
}

export const PlayerStatsView = () => {
  // 1. TODOS LOS HOOKS PRIMERO (SIEMPRE ARRIBA)
  const { matches, isLoadingStats, fetchMatches } = useStatsData(); 
  
  useEffect(() => {
     fetchMatches();
  }, [fetchMatches]);

  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // MOVIDO ARRIBA: El useMemo debe estar antes de cualquier return
  const filteredPlayers = useMemo(() => {
    if (!matches || matches.length === 0) return [];

    const getCat = (m: any) => m.categoria || m.Categoria || m.category;

    const matchesInCategory = selectedCategory
      ? matches.filter((m: any) => getCat(m) === selectedCategory)
      : matches;

    const uniqueNames = new Set<string>();
    
    matchesInCategory.forEach((m: any) => {
      const p1 = m.jugador || m.Jugador;
      const p2 = m.rival || m.Rival;

      if (p1 && p1.trim() !== "" && p1 !== "BYE") uniqueNames.add(p1.trim());
      if (p2 && p2.trim() !== "" && p2 !== "BYE") uniqueNames.add(p2.trim());
    });

    let players = Array.from(uniqueNames).sort();

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      players = players.filter((name) =>
        name.toLowerCase().includes(lowerSearch)
      );
    }

    return players;
  }, [matches, selectedCategory, searchTerm]);

  // 2. AHORA SÍ, LOS CONDICIONALES (RETURN)
  if (selectedPlayer) {
      return (
          <PlayerDetailView 
              playerName={selectedPlayer} 
              onBack={() => setSelectedPlayer(null)}
              matchesData={matches} 
          />
      );
  }

  // 3. RENDERIZADO PRINCIPAL
  return (
    <div className="w-full max-w-4xl lg:max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-500 px-2 md:px-0 pb-20">
      
      {/* TÍTULO */}
      <div className="text-center mb-8 relative">
        <h2 className="text-3xl md:text-4xl font-black text-[#b35a38] uppercase italic drop-shadow-sm mt-4">
            Estadísticas por Jugador
        </h2>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="relative max-w-xl mx-auto mb-6">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Escriba acá su nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-slate-100 bg-white text-slate-700 placeholder:text-slate-400 font-bold focus:outline-none focus:border-[#b35a38] focus:ring-2 focus:ring-[#b35a38]/20 transition-all shadow-sm hover:shadow-md"
        />
      </div>

      {/* FILTROS DE CATEGORÍA */}
      <div className="mb-10 text-center space-y-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
           <Filter className="w-3 h-3" /> Filtrar por categoría
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {["A", "B1", "B2", "C"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`px-6 py-2 rounded-xl font-black text-sm transition-all duration-200 shadow-sm active:scale-95 ${
                selectedCategory === cat
                  ? "bg-[#b35a38] text-white ring-2 ring-offset-2 ring-[#b35a38]"
                  : "bg-white text-slate-500 border-2 border-slate-100 hover:border-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* GRILLA DE JUGADORES */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden min-h-[300px]">
        {isLoadingStats ? (
           <div className="flex flex-col justify-center items-center py-20 gap-4">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#b35a38]"></div>
             <p className="text-slate-400 font-bold text-sm">Cargando base de datos...</p>
           </div>
        ) : filteredPlayers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 gap-px bg-slate-100">
            {filteredPlayers.map((player, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedPlayer(player)}
                className="bg-white p-5 flex items-center gap-4 cursor-pointer hover:bg-orange-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-[#b35a38] group-hover:text-white transition-colors duration-300 shadow-sm shrink-0">
                    <User className="w-5 h-5 text-slate-400 group-hover:text-white" />
                </div>
                {/* CAMBIO 2: Quitamos 'truncate' y agregamos leading-tight */}
                <span className="font-bold text-slate-700 text-lg group-hover:text-[#b35a38] transition-colors leading-tight">
                    {player}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4">
             <p className="text-slate-400 font-bold text-lg mb-2">
                No se encontraron jugadores.
             </p>
             <p className="text-slate-300 text-sm font-medium">
                {searchTerm ? `Sin resultados para "${searchTerm}"` : "Intenta cambiar el filtro de categoría."}
             </p>
          </div>
        )}
      </div>
    </div>
  );
};