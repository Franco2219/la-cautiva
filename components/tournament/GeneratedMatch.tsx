import React from "react";

interface MatchProps {
  match: {
    p1: { name: string; rank?: number; groupIndex?: number } | null;
    p2: { name: string; rank?: number; groupIndex?: number } | null;
  };
}

export const GeneratedMatch = ({ match }: MatchProps) => {
  // Función auxiliar para determinar la etiqueta del seed
  const getSeedLabel = (player: any) => {
    // Si no hay jugador, no tiene ranking, es rank 0 o es BYE, no mostramos nada.
    if (!player || !player.rank || player.rank === 0 || player.name === "BYE") return "";
    
    // Si tiene groupIndex, viene de fase de grupos (ej: "1 ZN 2")
    if (player.groupIndex !== undefined && player.groupIndex !== null) {
        return `${player.rank} ZN ${player.groupIndex + 1}`;
    }
    
    // Si no, es un seed directo (ej: "1.") -> ESTO ES LO QUE PEDISTE
    return `${player.rank}.`;
  };

  return (
    <div className="relative flex flex-col space-y-4 mb-8 w-full max-w-md mx-auto">
      {/* Jugador 1 */}
      <div className="flex items-center gap-4 border-b-2 border-slate-300 pb-2 relative bg-white">
        <span className="text-orange-500 font-black text-lg w-24 text-right whitespace-nowrap">
          {getSeedLabel(match.p1)}
        </span>
        <span
          className={`font-black text-xl uppercase truncate ${
            match.p1 ? "text-slate-800" : "text-slate-300"
          }`}
        >
          {match.p1 ? match.p1.name : "BYE"}
        </span>
      </div>

      {/* Jugador 2 */}
      <div className="flex items-center gap-4 border-b-2 border-slate-300 pb-2 relative bg-white">
        <span className="text-orange-500 font-black text-lg w-24 text-right whitespace-nowrap">
          {getSeedLabel(match.p2)}
        </span>
        <span
          className={`font-black text-xl uppercase truncate ${
            match.p2?.name === "BYE"
              ? "text-green-600"
              : match.p2
              ? "text-slate-800"
              : "text-slate-300"
          }`}
        >
          {match.p2 ? match.p2.name : "BYE"}
        </span>
      </div>
    </div>
  );
};