import { getTournamentStyle } from "../../lib/utils";

interface GroupTableProps {
  group: any;
  tournamentShort: string;
}

export const GroupTable = ({ group, tournamentShort }: GroupTableProps) => {
  const totalPlayers = group.players.length;
  let isComplete = true;

  // Verificar si todos los partidos se jugaron
  for (let i = 0; i < totalPlayers; i++) {
      for (let j = 0; j < totalPlayers; j++) {
         if (i === j) continue; 
         const val = group.results[i]?.[j];
         if (!val || val.trim() === "-" || val.trim().length < 2) {
           isComplete = false;
           break;
         }
      }
      if (isComplete) break;
  }

  const hasTies = () => {
      if (!group.points || !group.diff) return false;
      const signatures = group.points.map((p: any, i: number) => `${p}|${group.diff[i]}`);
      const unique = new Set(signatures);
      return unique.size !== signatures.length; 
  };
  
  const showGames = hasTies();

  const calculateRanks = () => {
    return group.positions || [];
  };

  const displayRanks = calculateRanks();
  // Usamos la utilidad que ya moviste a utils.ts
  const style = getTournamentStyle(tournamentShort);

  return (
    // CORRECCIÓN AQUÍ: Agregamos 'md:' a overflow-hidden para que en notebooks no corte el contenido
    <div className={`bg-white border-2 border-opacity-20 rounded-2xl shadow-lg mb-4 text-center h-fit md:overflow-hidden ${style.borderColor}`}>
      <div className={`${style.color} p-3 text-white font-black italic text-center uppercase tracking-wider relative flex items-center justify-center`}>
          <span className="text-3xl">{group.groupName}</span>
      </div>
      <style jsx>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="overflow-x-auto w-full hide-scroll">
          <table className="w-max min-w-full text-[11px] md:text-xs">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-3 border-r w-32 text-left font-bold text-black min-w-[120px] whitespace-nowrap">JUGADOR</th>
                {group.players && group.players.map((p: string, i: number) => {
                  let shortName = p;
                  if (p) {
                      const clean = p.replace(/,/g, "").trim().split(/\s+/);
                      if (clean.length > 1) shortName = `${clean[0]} ${clean[1].charAt(0)}.`;
                      else shortName = clean[0];
                  }
                  return (
                    <th key={i} className={`p-3 border-r text-center font-black uppercase min-w-[80px] whitespace-nowrap ${style.textColor}`}>
                        {shortName}
                    </th>
                  )
                })}
                {isComplete && (
                    <>
                        <th className="p-2 text-center font-black text-slate-600 bg-slate-100 whitespace-nowrap">PTS</th>
                        <th className="p-2 text-center font-black text-slate-600 bg-slate-100 whitespace-nowrap">SETS</th>
                        {showGames && <th className="p-2 text-center font-black text-slate-600 bg-slate-100 whitespace-nowrap">GAMES</th>}
                        <th className="p-3 text-center font-black text-black bg-slate-100 w-12 whitespace-nowrap">POS</th>
                    </>
                )}
              </tr>
            </thead>
            <tbody>
              {group.players && group.players.map((p1: string, i: number) => (
                <tr key={i} className="border-b">
                  <td className={`p-3 border-r font-black bg-slate-50 uppercase text-left whitespace-nowrap ${style.textColor}`}>{p1}</td>
                  {group.players.map((p2: string, j: number) => (
                    <td key={j} className={`p-2 border-r text-center font-black text-slate-700 whitespace-nowrap text-sm md:text-base ${i === j ? 'bg-slate-100 text-slate-300' : ''}`}>
                      {i === j ? "/" : (group.results[i] && group.results[i][j] ? group.results[i][j] : "-")}
                    </td>
                  ))}
                  {isComplete && (
                      <>
                          <td className="p-2 text-center font-bold text-slate-700 bg-slate-50">{group.points ? group.points[i] : "-"}</td>
                          <td className="p-2 text-center font-bold text-slate-700 bg-slate-50">{group.diff ? group.diff[i] : "-"}</td>
                          {showGames && <td className="p-2 text-center font-bold text-slate-700 bg-slate-50">{group.gamesDiff ? group.gamesDiff[i] : "-"}</td>}
                          <td className={`p-3 text-center font-black text-xl bg-slate-50 whitespace-nowrap ${style.textColor}`}>
                              {displayRanks[i] || "-"}°
                          </td>
                      </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
};