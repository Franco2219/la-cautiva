"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Grid3x3 } from "lucide-react"

// --- CONFIGURACIÓN DE DATOS ---
const ID_2025 = '1_tDp8BrXZfmmmfyBdLIUhPk7PwwKvJ_t'; 
const ID_2026 = '1RVxm-lcNp2PWDz7HcDyXtq0bWIWA9vtw';

const GID_MAP_2026: Record<string, string> = {
  "A": "952153027", "B1": "675525317", "B2": "1079671299", "C": "498001194"
};

const tournaments = [
  { id: "adelaide", name: "Adelaide", short: "Adelaide", type: "direct" },
  { id: "s8_500", name: "Super 8 / 500", short: "S8 500", type: "direct" },
  { id: "s8_250", name: "Super 8 / 250", short: "S8 250", type: "direct" },
  { id: "ao", name: "Australian Open", type: "full" },
  { id: "iw", name: "Indian Wells", type: "full" },
  { id: "mc", name: "Monte Carlo", type: "full" },
  { id: "rg", name: "Roland Garros", type: "full" },
  { id: "wimbledon", name: "Wimbledon", type: "full" },
  { id: "us", name: "US Open", type: "full" },
]

const mockGroupDataCaballeros = [
  { groupName: "Grupo 1", players: ["Martín Rodríguez", "Santiago Fernández", "Luciano González"] },
  { groupName: "Grupo 2", players: ["Tomás Martínez", "Franco López", "Nicolás Díaz"] },
]

export default function Home() {
  const [navState, setNavState] = useState<any>({ level: "home" })
  const [rankingData, setRankingData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [bracketData, setBracketData] = useState<any>({ 
    r1: [], s1: [], r2: [], s2: [], r3: [], s3: [], r4: [], s4: [], winner: "", isLarge: false 
  });
  const [isLoading, setIsLoading] = useState(false)

  const fetchBracketData = async (category: string, tournamentShort: string) => {
    setIsLoading(true);
    const sheetName = `${category} ${tournamentShort}`;
    const url = `https://docs.google.com/spreadsheets/d/${ID_2026}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    try {
      const response = await fetch(url);
      const csvText = await response.text();
      const rows = csvText.split('\n').map(row => 
        row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/"/g, '').trim())
      );

      // Inteligencia: Si hay datos en la fila 9 de la columna A, es un cuadro de 16
      const isLarge = rows.length > 8 && rows[8][0] !== "";

      if (isLarge) {
        setBracketData({
          r1: rows.map(r => r[0]).slice(0, 16), s1: rows.map(r => r[1]).slice(0, 16),
          r2: rows.map(r => r[2]).slice(0, 8), s2: rows.map(r => r[3]).slice(0, 8),
          r3: rows.map(r => r[4]).slice(0, 4), s3: rows.map(r => r[5]).slice(0, 4),
          r4: rows.map(r => r[6]).slice(0, 2), s4: rows.map(r => r[7]).slice(0, 2),
          winner: rows[0][8] || "",
          isLarge: true
        });
      } else {
        setBracketData({
          r1: rows.map(r => r[0]).slice(0, 8), s1: rows.map(r => r[1]).slice(0, 8),
          r2: rows.map(r => r[2]).slice(0, 4), s2: rows.map(r => r[3]).slice(0, 4),
          r3: rows.map(r => r[4]).slice(0, 2), s3: rows.map(r => r[5]).slice(0, 2),
          winner: rows[0][6] || "",
          isLarge: false
        });
      }
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  }

  const fetchRankingData = async (categoryShort: string, year: string) => {
    setIsLoading(true);
    const spreadsheetId = year === "2025" ? ID_2025 : ID_2026;
    const gid = year === "2026" ? GID_MAP_2026[categoryShort] : null;
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv${gid ? `&gid=${gid}` : `&sheet=${encodeURIComponent(`${categoryShort} ${year}`)}`}`;
    try {
      const response = await fetch(url);
      const csvText = await response.text();
      const rows = csvText.split('\n');
      const firstRow = rows[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/"/g, '').trim());
      setHeaders(year === "2025" ? [firstRow[2], firstRow[3], firstRow[4], firstRow[5], firstRow[6], firstRow[7], firstRow[8]] : [firstRow[2], firstRow[3], firstRow[4], firstRow[5], firstRow[6], firstRow[7], firstRow[8], firstRow[9], firstRow[10]]);
      const parsedData = rows.slice(1).map(row => {
        const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/"/g, '').trim());
        return {
          name: cols[1],
          points: year === "2025" ? [cols[2], cols[3], cols[4], cols[5], cols[6], cols[7], cols[8]] : [cols[2], cols[3], cols[4], cols[5], cols[6], cols[7], cols[8], cols[9], cols[10]],
          total: year === "2025" ? (parseInt(cols[9]) || 0) : (parseInt(cols[11]) || 0)
        };
      }).filter(p => p.name && p.name !== "").sort((a, b) => b.total - a.total);
      setRankingData(parsedData);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  }

  const goBack = () => {
    const levels: any = { "main-menu": "home", "year-selection": "main-menu", "category-selection": "main-menu", "tournament-selection": "category-selection", "tournament-phases": "tournament-selection", "group-phase": "tournament-phases", "bracket-phase": "tournament-phases", "ranking-view": "category-selection", "direct-bracket": "tournament-selection" };
    setNavState({ ...navState, level: levels[navState.level] || "home" });
  }

  const buttonStyle = "w-full text-lg h-20 border-2 border-[#b35a38]/20 bg-white text-[#b35a38] hover:bg-[#b35a38] hover:text-white transform hover:scale-[1.01] transition-all duration-300 font-semibold shadow-md rounded-2xl flex items-center justify-center";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-[#fffaf5]">
      <div className={`w-full ${['ranking-view', 'direct-bracket'].includes(navState.level) ? 'max-w-7xl' : 'max-w-6xl'} mx-auto z-10`}>
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="relative group w-64 h-64">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/30 to-[#b35a38]/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Image src="/logo.png" alt="Logo" width={280} height={280} className="relative z-10 object-contain transition-transform duration-500 group-hover:scale-110 unoptimized" priority />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-2 text-[#b35a38] italic text-center">La Cautiva</h1>
          <p className="text-xl text-slate-400 font-bold uppercase tracking-widest text-center italic">Club de Tenis</p>
        </div>

        {navState.level !== "home" && <Button onClick={goBack} variant="ghost" className="mb-6 text-slate-500 font-bold">← VOLVER</Button>}

        <div className="space-y-4 max-w-xl mx-auto">
          {navState.level === "home" && <Button onClick={() => setNavState({ level: "main-menu" })} className="w-full h-28 text-2xl bg-[#b35a38] text-white font-black rounded-3xl border-b-8 border-[#8c3d26]">INGRESAR</Button>}
          {navState.level === "main-menu" && <div className="grid grid-cols-1 gap-4"><Button onClick={() => setNavState({ level: "category-selection", type: "caballeros" })} className={buttonStyle}>CABALLEROS</Button><Button onClick={() => setNavState({ level: "category-selection", type: "damas" })} className={buttonStyle}>DAMAS</Button><Button onClick={() => setNavState({ level: "year-selection", type: "ranking" })} className={buttonStyle}><Trophy className="mr-2 opacity-50" /> RANKING</Button></div>}
          
          {navState.level === "year-selection" && (
            <div className="space-y-4 text-center">
              <Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2025" })} className={buttonStyle}>Ranking 2025</Button>
              <Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2026" })} className={buttonStyle}>Ranking 2026</Button>
            </div>
          )}

          {navState.level === "category-selection" && (
            <div className="space-y-4 text-center">
              {["Categoría A", "Categoría B1", "Categoría B2", "Categoría C"].map((cat) => (
                <Button key={cat} onClick={() => {
                  const catShort = cat.replace("Categoría ", "");
                  if (navState.type === "ranking") {
                    fetchRankingData(catShort, navState.year);
                    setNavState({ ...navState, level: "ranking-view", selectedCategory: cat });
                  } else {
                    setNavState({ ...navState, level: "tournament-selection", category: catShort, selectedCategory: cat, gender: navState.type });
                  }
                }} className={buttonStyle}>{cat}</Button>
              ))}
            </div>
          )}

          {navState.level === "tournament-selection" && (
            <div className="space-y-4 text-center">
              {tournaments.filter(t => {
                if (t.id === "adelaide" && navState.gender === "damas") return false;
                if (t.id === "s8_500") return ["B1", "B2", "C"].includes(navState.category);
                if (t.id === "s8_250") return ["B1", "B2"].includes(navState.category);
                return true;
              }).map((t) => (
                <Button key={t.id} onClick={() => {
                  if (t.type === "direct" && navState.gender === "caballeros") {
                    fetchBracketData(navState.category, t.short || "");
                    setNavState({ ...navState, level: "direct-bracket", tournament: t.name });
                  } else {
                    setNavState({ ...navState, level: "tournament-phases", tournament: t.name });
                  }
                }} className={buttonStyle}>{t.name}</Button>
              ))}
            </div>
          )}

          {navState.level === "tournament-phases" && (
            <div className="space-y-4 text-center">
              <h2 className="text-2xl font-black mb-4 text-slate-800 uppercase">{navState.tournament}</h2>
              <Button onClick={() => setNavState({ ...navState, level: "group-phase" })} className={buttonStyle}><Users className="mr-2" /> Fase de Grupos</Button>
              <Button onClick={() => setNavState({ ...navState, level: "bracket-phase" })} className={buttonStyle}><Grid3x3 className="mr-2" /> Cuadro de Eliminación</Button>
            </div>
          )}

          {navState.level === "direct-bracket" && (
            <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-8 shadow-2xl overflow-x-auto">
              <div className="bg-[#b35a38] p-6 rounded-2xl mb-12 text-center text-white italic min-w-[800px]">
                <h2 className="text-3xl font-black uppercase">{navState.tournament} - {navState.selectedCategory}</h2>
              </div>
              <div className="flex flex-row items-center min-w-[1000px] py-10 relative">
                
                {/* R1 - Solo para cuadros de 16 */}
                {bracketData.isLarge && (
                  <div className="flex flex-col space-y-4 w-64 mr-12 relative">
                    {[0, 2, 4, 6, 8, 10, 12, 14].map((idx) => (
                      <div key={idx} className="relative flex flex-col space-y-4 mb-4">
                        <div className="h-6 border-b-2 border-slate-300 flex justify-between items-end relative bg-white">
                          <span className="text-[9px] font-bold uppercase truncate">{bracketData.r1[idx] || "TBD"}</span>
                          <span className="text-[#b35a38] font-black text-[8px] ml-1">{bracketData.s1[idx]}</span>
                          <div className="absolute -right-[20px] bottom-[-2px] w-[20px] h-[2px] bg-slate-300" />
                        </div>
                        <div className="h-6 border-b-2 border-slate-300 flex justify-between items-end relative bg-white">
                          <span className="text-[9px] font-bold uppercase truncate">{bracketData.r1[idx+1] || "TBD"}</span>
                          <span className="text-[#b35a38] font-black text-[8px] ml-1">{bracketData.s1[idx+1]}</span>
                          <div className="absolute -right-[20px] bottom-[-2px] w-[20px] h-[2px] bg-slate-300" />
                        </div>
                        <div className="absolute top-[22px] bottom-[22px] -right-[20px] w-[2px] bg-slate-300" />
                        <div className="absolute top-[32px] -right-[40px] w-5 h-[2px] bg-slate-300" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Cuartos (o R2) */}
                <div className="flex flex-col space-y-12 w-72 relative text-left">
                  {[0, 2, 4, 6].map((idx) => {
                    const p1 = bracketData.isLarge ? bracketData.r2[idx] : bracketData.r1[idx];
                    const p2 = bracketData.isLarge ? bracketData.r2[idx+1] : bracketData.r1[idx+1];
                    const s1 = bracketData.isLarge ? bracketData.s2[idx] : bracketData.s1[idx];
                    const s2 = bracketData.isLarge ? bracketData.s2[idx+1] : bracketData.s1[idx+1];
                    return (
                      <div key={idx} className="relative flex flex-col space-y-6">
                        <div className="h-8 border-b-2 border-slate-300 flex justify-between items-end bg-white relative">
                          <span className="text-[10px] font-bold uppercase truncate">{p1 || "TBD"}</span>
                          <span className="text-[#b35a38] font-black text-[9px] ml-2">{s1}</span>
                          <div className="absolute -right-[48px] bottom-[-2px] w-[48px] h-[2px] bg-slate-300" />
                        </div>
                        <div className="h-8 border-b-2 border-slate-300 flex justify-between items-end relative bg-white">
                          <span className="text-[10px] font-bold uppercase truncate">{p2 || "TBD"}</span>
                          <span className="text-[#b35a38] font-black text-[9px] ml-2">{s2}</span>
                          <div className="absolute -right-[48px] bottom-[-2px] w-[48px] h-[2px] bg-slate-300" />
                        </div>
                        <div className="absolute top-[50px] -right-[78px] w-8 h-[2px] bg-slate-300" />
                      </div>
                    )
                  })}
                </div>

                {/* Semis (o R3) */}
                <div className="flex flex-col space-y-[158px] w-64 ml-24 relative text-left">
                  {[0, 2].map((idx) => {
                    const p1 = bracketData.isLarge ? bracketData.r3[idx] : bracketData.r2[idx];
                    const p2 = bracketData.isLarge ? bracketData.r3[idx+1] : bracketData.r2[idx+1];
                    const s1 = bracketData.isLarge ? bracketData.s3[idx] : bracketData.s2[idx];
                    const s2 = bracketData.isLarge ? bracketData.s3[idx+1] : bracketData.s2[idx+1];
                    return (
                      <div key={idx} className="relative flex flex-col space-y-10">
                        <div className="h-8 border-b-2 border-slate-300 flex justify-between items-end bg-white relative">
                          <span className="text-[10px] font-bold uppercase">{p1 || ""}</span>
                          <span className="text-[#b35a38] font-black text-[9px] ml-2">{s1}</span>
                          <div className="absolute -right-[48px] bottom-[-2px] w-[48px] h-[2px] bg-slate-300" />
                        </div>
                        <div className="h-8 border-b-2 border-slate-300 flex justify-between items-end bg-white relative">
                          <span className="text-[10px] font-bold uppercase">{p2 || ""}</span>
                          <span className="text-[#b35a38] font-black text-[9px] ml-2">{s2}</span>
                          <div className="absolute -right-[48px] bottom-[-2px] w-[48px] h-[2px] bg-slate-300" />
                        </div>
                        <div className="absolute top-[60px] -right-[78px] w-8 h-[2px] bg-slate-300" />
                      </div>
                    )
                  })}
                </div>

                {/* Final (o R4) */}
                <div className="flex flex-col items-center ml-24 w-80 relative text-center">
                  <div className="w-full space-y-12 mb-16">
                    {[0, 1].map((idx) => {
                      const p = bracketData.isLarge ? bracketData.r4[idx] : bracketData.r3[idx];
                      const s = bracketData.isLarge ? bracketData.s4[idx] : bracketData.s3[idx];
                      const win = p && p === bracketData.winner;
                      return (
                        <div key={idx} className={`h-10 border-b-4 ${win ? 'border-[#b35a38]' : 'border-slate-200'} flex justify-between items-end bg-white text-center`}>
                          <span className={`${win ? 'text-[#b35a38] font-black' : 'text-slate-800 font-bold'} uppercase text-xs`}>{p || ""}</span>
                          <span className="text-[#b35a38] font-black text-[10px] ml-2">{s}</span>
                        </div>
                      )
                    })}
                  </div>
                  <Trophy className="w-20 h-20 text-orange-400 mx-auto" />
                  <span className="text-[#b35a38] font-black text-3xl mt-2 italic uppercase block w-full text-center">{bracketData.winner || "Campeón"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Vistas de Grupos y Rankings (Intactas) */}
          {navState.level === "group-phase" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockGroupDataCaballeros.map((group) => (
                <div key={group.groupName} className="bg-white border-2 border-[#b35a38]/10 rounded-2xl p-6 shadow-md text-center">
                  <h3 className="text-2xl font-black mb-4 text-[#b35a38] text-center">{group.groupName}</h3>
                  <table className="w-full text-left font-bold text-center">
                    <thead className="bg-[#fffaf5] text-slate-400 text-center">
                      <tr><th className="p-3">Jugador</th><th className="p-3 text-center">PTS</th></tr>
                    </thead>
                    <tbody>
                      {group.players.map(p => (
                        <tr key={p} className="border-b border-[#fffaf5] text-center">
                          <td className="p-3 uppercase text-slate-700">{p}</td>
                          <td className="p-3 text-center text-slate-700">0</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {navState.level === "ranking-view" && (
            <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 text-center">
              <div className="bg-[#b35a38] p-6 rounded-2xl mb-8 text-center italic text-white text-center">
                <h2 className="text-3xl md:text-5xl font-black uppercase text-center">{navState.selectedCategory} {navState.year}</h2>
              </div>
              <div className="overflow-x-auto text-center">
                <table className="w-full text-lg font-bold text-center">
                  <thead>
                    <tr className="bg-[#b35a38] text-white text-center">
                      <th className="p-4 text-left font-black first:rounded-tl-xl text-center">POS</th>
                      <th className="p-4 text-left font-black text-center">JUGADOR</th>
                      {headers.map(h => (<th key={h} className="p-4 text-center font-black hidden sm:table-cell text-center">{h}</th>))}
                      <th className="p-4 text-right font-black bg-[#8c3d26] last:rounded-tr-xl text-center">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingData.map((p, i) => (
                      <tr key={i} className="border-b border-[#fffaf5] hover:bg-[#fffaf5] text-center">
                        <td className="p-4 text-slate-400 text-center">{i + 1}</td>
                        <td className="p-4 uppercase text-slate-700 text-center">{p.name}</td>
                        {p.points.map((val: any, idx: number) => (<td key={idx} className="p-4 text-center text-slate-400 hidden sm:table-cell text-center">{val || 0}</td>))}
                        <td className="p-4 text-right text-[#b35a38] text-2xl font-black bg-[#fffaf5] text-center">{p.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <p className="text-center text-slate-500/80 mt-12 text-sm font-bold uppercase tracking-widest animate-pulse text-center">Sistema de seguimiento de torneos en vivo</p>
      </div>
    </div>
  )
}