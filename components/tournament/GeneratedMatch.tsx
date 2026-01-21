import React from "react";

interface MatchProps {
  match: {
    // Aceptamos que el jugador pueda venir con ranking
    p1: { name: string; rank?: number; groupIndex?: number } | null;
    p2: { name: string; rank?: number; groupIndex?: number } | null;
  };
}

export const GeneratedMatch = ({ match }: MatchProps) => {
  
  // Función para construir la etiqueta del seed (1. o 1 ZN 2)
  const getSeedLabel = (player: any) => {
    // Si no hay jugador, o es BYE, o no tiene ranking > 0, devolvemos vacío
    if (!player || player.name === "BYE" || !player.rank || player.rank <= 0) return "";

    // Opción A: Viene de Grupos (tiene groupIndex) -> "1 ZN 2"
    if (player.groupIndex !== undefined && player.groupIndex !== null) {
      return `${player.rank} ZN ${player.groupIndex + 1}`;
    }

    // Opción B: Torneo Directo (tiene rank pero no groupIndex) -> "1."
    return `${player.rank}.`;
  };

  return (
    <div className="relative flex flex-col space-y-4 mb-8 w-full max-w-md mx-auto">
      {/* Jugador 1 */}
      <div className="flex items-center gap-4 border-b-2 border-slate-300 pb-2 relative bg-white">
        {/* Mostramos el ranking si existe */}
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