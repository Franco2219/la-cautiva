import React, { useState, useMemo } from "react";
import { Search, Filter, User } from "lucide-react";
import { useStatsData } from "@/hooks/useStatsData";

// Definimos una interfaz básica para lo que esperamos de un partido en Db_Master
// Ajusta estos campos si en tu DB se llaman diferente (ej: 'ganador', 'perdedor', etc.)
interface MatchData {
  winner: string;
  loser: string;
  category: string;
  // ... otros campos
}

export const PlayerStatsView = () => {
  // Asumimos que el hook nos provee la data maestra de partidos.
  // NOTA: Si tu hook 'useStatsData' aún no exporta 'matches' (o dbMaster),
  // asegúrate de retornarlo ahí.
  const { matches, isLoadingStats } = useStatsData(); 
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Lógica para extraer jugadores únicos y filtrarlos
  const filteredPlayers = useMemo(() => {
    if (!matches || matches.length === 0) return [];

    // 1. Primero filtramos los partidos según la categoría seleccionada (si hay una)
    const matchesInCategory = selectedCategory
      ? matches.filter((m: MatchData) => m.category === selectedCategory)
      : matches;

    // 2. Extraemos todos los nombres únicos (ganadores y perdedores) de esos partidos
    const uniqueNames = new Set<string>();
    matchesInCategory.forEach((m: MatchData) => {
      if (m.winner) uniqueNames.add(m.winner.trim());
      if (m.loser) uniqueNames.add(m.loser.trim());
    });

    // 3. Convertimos a array
    let players = Array.from(uniqueNames).sort();

    // 4. Aplicamos el buscador por nombre
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      players = players.filter((name) =>
        name.toLowerCase().includes(lowerSearch)
      );
    }

    return players;
  }, [matches, selectedCategory, searchTerm]);

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500 px-2 md:px-0 pb-20">
      
      {/* --- TÍTULO --- */}
      <h2 className="text-3xl md:text-4xl font-black text-[#b35a38] uppercase italic mb-6 text-center mt-4 drop-shadow-sm">
        Estadísticas por Jugador
      </h2>

      {/* --- BARRA DE BÚSQUEDA --- */}
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

      {/* --- FILTROS DE CATEGORÍA --- */}
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

      {/* --- LISTADO DE JUGADORES --- */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden min-h-[300px]">
        {isLoadingStats ? (
           <div className="flex justify-center items-center py-20">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#b35a38]"></div>
           </div>
        ) : filteredPlayers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 gap-px bg-slate-100">
            {filteredPlayers.map((player, idx) => (
              <div 
                key={idx}
                // Aquí dejaremos el onClick listo para la "Segunda Tarea"
                onClick={() => console.log("Click en jugador:", player)}
                className="bg-white p-5 flex items-center gap-4 cursor-pointer hover:bg-orange-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-[#b35a38] group-hover:text-white transition-colors duration-300">
                    <User className="w-5 h-5 text-slate-400 group-hover:text-white" />
                </div>
                <span className="font-bold text-slate-700 text-lg group-hover:text-[#b35a38] transition-colors truncate">
                    {player}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4">
             <p className="text-slate-400 font-bold text-lg">
                {searchTerm ? "No encontramos jugadores con ese nombre." : "No hay jugadores registrados en esta categoría."}
             </p>
          </div>
        )}
      </div>
    </div>
  );
};