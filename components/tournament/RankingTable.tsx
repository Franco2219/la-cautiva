import React from "react";

interface RankingTableProps {
  headers: string[];
  data: any[];
  category: string;
  year: string;
}

export const RankingTable = ({ headers, data, category, year }: RankingTableProps) => {
  return (
    <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden text-center">
      {/* Header Naranja */}
      <div className="bg-[#b35a38] p-6 rounded-2xl mb-8 text-white italic text-center">
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-wider text-center">
          {category} {year}
        </h2>
      </div>

      {headers.length > 0 && data.length > 0 ? (
        <div className="overflow-x-auto overflow-y-auto max-h-[70vh] text-center">
          <table className="w-full min-w-max text-lg font-bold text-center">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#b35a38] text-white">
                <th className="sticky left-0 top-0 z-30 w-20 p-4 text-center font-black bg-[#b35a38] first:rounded-tl-xl">POS</th>
                <th className="sticky left-20 top-0 z-30 min-w-[200px] p-4 text-center font-black bg-[#b35a38]">JUGADOR</th>
                {headers.map((h, i) => (
                  <th key={i} className="p-4 text-center font-black hidden sm:table-cell">
                    {h}
                  </th>
                ))}
                <th className="p-4 text-center font-black bg-[#8c3d26] last:rounded-tr-xl">
                  TOTAL
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((p, i) => (
                <tr key={i} className="group border-b border-[#fffaf5] hover:bg-[#fffaf5] text-center">
                  <td className="sticky left-0 z-20 w-20 p-4 text-slate-400 text-center bg-white group-hover:bg-[#fffaf5]">{i + 1}</td>
                  <td className="sticky left-20 z-20 min-w-[200px] p-4 uppercase text-slate-700 text-center bg-white group-hover:bg-[#fffaf5]">{p.name}</td>
                  {p.points.map((val: any, idx: number) => (
                    <td key={idx} className="p-4 text-center text-slate-400 hidden sm:table-cell">
                      {val || 0}
                    </td>
                  ))}
                  <td className="p-4 text-[#b35a38] text-2xl font-black bg-[#fffaf5] text-center">
                    {p.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : headers.length > 0 && data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-slate-400 uppercase font-bold text-center p-8">
          Todavía no hay jugadores con puntos para esta sección
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-slate-300 uppercase font-black animate-pulse text-center">
          Cargando datos...
        </div>
      )}
    </div>
  );
};