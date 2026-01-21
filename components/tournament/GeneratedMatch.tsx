import React from "react";

interface MatchProps {
  match: {
    p1: { name: string; rank?: number; groupIndex?: number } | null;
    p2: { name: string; rank?: number; groupIndex?: number } | null;
  };
}

export const GeneratedMatch = ({ match }: MatchProps) => {
  return (
    <div className="relative flex flex-col space-y-4 mb-8 w-full max-w-md mx-auto">
      {/* Jugador 1 */}
      <div className="flex items-center gap-4 border-b-2 border-slate-300 pb-2 relative bg-white">
        {match.p1 && (
          <span className="text-orange-500 font-black text-lg w-24 text-right whitespace-nowrap">
            {match.p1.rank && match.p1.rank > 0
              ? match.p1.groupIndex !== undefined
                ? `${match.p1.rank} ZN ${match.p1.groupIndex + 1}`
                : `${match.p1.rank}.`
              : ""}
          </span>
        )}
        <span
          className={`font-black text-xl uppercase truncate ${
            match.p1 ? "text-slate-800" : "text-slate-300"
          }`}
        >
          {match.p1 ? match.p1.name : ""}
        </span>
      </div>

      {/* Jugador 2 */}
      <div className="flex items-center gap-4 border-b-2 border-slate-300 pb-2 relative bg-white">
        {match.p2 && match.p2.name !== "BYE" && (
          <span className="text-orange-500 font-black text-lg w-24 text-right whitespace-nowrap">
            {match.p2.rank && match.p2.rank > 0
              ? match.p2.groupIndex !== undefined
                ? `${match.p2.rank} ZN ${match.p2.groupIndex + 1}`
                : `${match.p2.rank}.`
              : ""}
          </span>
        )}
        <span
          className={`font-black text-xl uppercase truncate ${
            match.p2?.name === "BYE"
              ? "text-green-600"
              : match.p2
              ? "text-slate-800"
              : "text-slate-300"
          }`}
        >
          {match.p2 ? match.p2.name : ""}
        </span>
      </div>
    </div>
  );
};