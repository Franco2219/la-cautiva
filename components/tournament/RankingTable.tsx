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
        <div className="overflow-x-auto text-center">
          <table className="w-full text-lg font-bold text-center">
            <thead>
              <tr className="bg-[#b35a38] text-white">
                <th className="p-4 text-center font-black first:rounded-tl-xl">POS</th>
                <th className="p-4 text-center font-black">JUGADOR</th>
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
                <tr key={i} className="border-b border-[#fffaf5] hover:bg-[#fffaf5] text-center">
                  <td className="p-4 text-slate-400 text-center">{i + 1}</td>
                  <td className="p-4 uppercase text-slate-700 text-center">{p.name}</td>
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
      ) : (
        <div className="h-64 flex items-center justify-center text-slate-300 uppercase font-black animate-pulse text-center">
          Cargando datos...
        </div>
      )}
    </div>
  );
};