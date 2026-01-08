"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight, Trophy, Users, Grid3x3 } from "lucide-react"

// --- CONFIGURACIÓN DE DATOS (IDs ACTUALIZADOS) ---
const ID_2025 = '1lDm83_HR0Cp1wCJV_03qqvnZSfJFf-uU';
const ID_2026 = '1RVxm-lcNp2PWDz7HcDyXtq0bWIWA9vtw'; // Nuevo ID con Gviz activado

const GID_MAP_2026: Record<string, string> = {
  "A": "952153027",
  "B1": "675525317", 
  "B2": "1079671299",
  "C": "498001194"
};

const tournaments = [
  { id: "ao", name: "Australian Open" },
  { id: "iw", name: "Indian Wells" },
  { id: "mc", name: "Monte Carlo" },
  { id: "rg", name: "Roland Garros" },
  { id: "wimbledon", name: "Wimbledon" },
  { id: "us", name: "US Open" },
]

const mockGroupData = [
  { groupName: "Grupo 1", players: ["Martín Rodríguez", "Santiago Fernández", "Luciano González"], results: {} },
  { groupName: "Grupo 2", players: ["Tomás Martínez", "Franco López", "Nicolás Díaz"], results: {} },
]

export default function Home() {
  const [navState, setNavState] = useState<any>({ level: "home" })
  const [rankingData, setRankingData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchRankingData = async (categoryShort: string, year: string) => {
    setIsLoading(true);
    const sheetName = `${categoryShort} ${year}`;
    
    // Ahora AMBOS años usan la tecnología gviz para actualización instantánea
    const spreadsheetId = year === "2025" ? ID_2025 : ID_2026;
    const gid = year === "2026" ? GID_MAP_2026[categoryShort] : null;
    
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv${gid ? `&gid=${gid}` : `&sheet=${encodeURIComponent(sheetName)}`}`;

    try {
      const response = await fetch(url);
      const csvText = await response.text();
      const rows = csvText.split('\n');
      
      const firstRow = rows[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/"/g, '').trim());
      
      // Definimos encabezados dinámicos según el año
      const dynamicHeaders = year === "2025" 
        ? ['AO','IW','MC','RG','W','US'] 
        : [firstRow[2], firstRow[3], firstRow[4], firstRow[5], firstRow[6], firstRow[7], firstRow[8], firstRow[9], firstRow[10]];
      
      setHeaders(dynamicHeaders);

      const parsedData = rows.slice(1).map(row => {
        const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/"/g, '').trim());
        return {
          name: cols[1],
          points: year === "2025" 
            ? [cols[2], cols[3], cols[4], cols[5], cols[6], cols[7]] 
            : [cols[2], cols[3], cols[4], cols[5], cols[6], cols[7], cols[8], cols[9], cols[10]],
          total: year === "2025" ? (parseInt(cols[8]) || 0) : (parseInt(cols[11]) || 0)
        };
      }).filter(p => p.name && !["nombre completo", "jugador", "nombre", "NOMBRE"].includes(p.name.toLowerCase()) && p.name !== "")
      .sort((a, b) => b.total - a.total);
      
      setRankingData(parsedData);
    } catch (error) { console.error("Error:", error); } finally { setIsLoading(false); }
  }

  const goBack = () => {
    const levels: any = { 
      "main-menu": "home", "year-selection": "main-menu", "category-selection": "main-menu", 
      "tournament-selection": "category-selection", "tournament-phases": "tournament-selection",
      "group-phase": "tournament-phases", "bracket-phase": "tournament-phases", "ranking-view": "category-selection" 
    };
    if (navState.level === "category-selection" && navState.type === "ranking") setNavState({ ...navState, level: "year-selection" });
    else setNavState({ ...navState, level: levels[navState.level] || "home" });
  }

  const buttonStyle = "w-full text-lg h-20 border-2 border-[#b35a38]/20 bg-white text-[#b35a38] hover:bg-[#b35a38] hover:text-white transform hover:scale-[1.01] transition-all duration-300 font-semibold shadow-md rounded-2xl";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-[#fffaf5]">
      <div className={`w-full ${navState.level === 'ranking-view' || navState.level === 'group-phase' ? 'max-w-7xl' : 'max-w-6xl'} mx-auto z-10`}>
        
        {/* HEADER CON GLOW */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="relative group w-44 h-44">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/30 to-[#b35a38]/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Image src="/logo.png" alt="Logo" width={200} height={200} className="relative z-10 object-contain transition-transform duration-500 group-hover:scale-110 unoptimized" priority />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-2 text-[#b35a38] italic">La Cautiva</h1>
          <p className="text-xl text-slate-400 font-bold uppercase tracking-widest">Club de Tenis</p>
        </div>

        {navState.level !== "home" && (
          <Button onClick={goBack} variant="ghost" className="mb-6 text-slate-500 font-bold">← VOLVER</Button>
        )}

        <div className={`space-y-4 ${navState.level === 'ranking-view' || navState.level === 'group-phase' ? 'w-full' : 'max-w-xl mx-auto'}`}>
          {/* ... Se mantienen todas las secciones de navegación de botones intactas ... */}
          {navState.level === "home" && (
            <Button onClick={() => setNavState({ level: "main-menu" })} className="w-full h-28 text-2xl bg-[#b35a38] text-white font-black rounded-3xl border-b-8 border-[#8c3d26]">INGRESAR</Button>
          )}

          {navState.level === "main-menu" && (
            <div className="grid grid-cols-1 gap-4">
              <Button onClick={() => setNavState({ level: "category-selection", type: "caballeros" })} className={buttonStyle}>CABALLEROS</Button>
              <Button onClick={() => setNavState({ level: "category-selection", type: "damas" })} className={buttonStyle}>DAMAS</Button>
              <Button onClick={() => setNavState({ level: "year-selection", type: "ranking" })} className={buttonStyle}><Trophy className="mr-2 opacity-50" /> RANKING</Button>
            </div>
          )}

          {navState.level === "year-selection" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-center mb-4 text-slate-800 uppercase">Temporada</h2>
              <Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2025" })} className={buttonStyle}>Ranking 2025</Button>
              <Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2026" })} className={buttonStyle}>Ranking 2026</Button>
            </div>
          )}

          {navState.level === "category-selection" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-center mb-4 text-slate-800 uppercase">{navState.type} {navState.year || ""}</h2>
              {["Categoría A", "Categoría B1", "Categoría B2", "Categoría C"].map((cat) => (
                <Button key={cat} onClick={() => {
                  const catShort = cat.replace("Categoría ", "");
                  if (navState.type === "ranking") {
                    fetchRankingData(catShort, navState.year);
                    setNavState({ ...navState, level: "ranking-view", selectedCategory: cat });
                  } else {
                    setNavState({ ...navState, level: "tournament-selection", category: catShort, selectedCategory: cat });
                  }
                }} className={buttonStyle}>{cat}</Button>
              ))}
            </div>
          )}

          {navState.level === "tournament-selection" && (
            <div className="space-y-4 max-w-xl mx-auto">
              <h2 className="text-2xl font-black text-center mb-4 text-slate-800 uppercase">{navState.selectedCategory}</h2>
              {tournaments.map((t) => (
                <Button key={t.id} onClick={() => setNavState({ ...navState, level: "tournament-phases", tournament: t.name })} className={buttonStyle}>{t.name}</Button>
              ))}
            </div>
          )}

          {navState.level === "tournament-phases" && (
            <div className="space-y-4 max-w-xl mx-auto">
              <h2 className="text-2xl font-black text-center mb-4 text-slate-800">{navState.tournament}</h2>
              <Button onClick={() => setNavState({ ...navState, level: "group-phase" })} className={buttonStyle}><Users className="mr-2" /> Fase de Grupos</Button>
              <Button onClick={() => setNavState({ ...navState, level: "bracket-phase" })} className={buttonStyle}><Grid3x3 className="mr-2" /> Cuadro de Eliminación</Button>
            </div>
          )}

          {navState.level === "group-phase" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
              {mockGroupData.map((group) => (
                <div key={group.groupName} className="bg-white border-2 border-[#b35a38]/10 rounded-2xl p-6 shadow-md">
                  <h3 className="text-2xl font-black mb-4 text-[#b35a38] text-center">{group.groupName}</h3>
                  <table className="w-full text-left font-bold">
                    <thead className="bg-[#fffaf5] text-slate-400"><tr><th className="p-3">Jugador</th><th className="p-3 text-center">PTS</th></tr></thead>
                    <tbody>{group.players.map(p => (<tr key={p} className="border-b border-[#fffaf5] hover:bg-[#fffaf5]/50"><td className="p-3 uppercase text-slate-700">{p}</td><td className="p-3 text-center text-slate-700">0</td></tr>))}</tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {navState.level === "bracket-phase" && (
            <div className="bg-white border-b-8 border-r-8 border-slate-200 rounded-[2.5rem] p-8 shadow-2xl text-center max-w-2xl mx-auto">
              <Trophy className="w-16 h-16 mx-auto text-orange-400 mb-4" />
              <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase">Cuadro de Eliminación</h2>
              <p className="text-slate-400 font-bold">Los cuadros se generarán al finalizar la fase de grupos.</p>
            </div>
          )}

          {navState.level === "ranking-view" && (
            <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-4 md:p-8 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="bg-[#b35a38] p-6 rounded-2xl mb-8 text-center italic">
                <h2 className="text-3xl md:text-5xl font-black text-white">{navState.selectedCategory} {navState.year}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-lg font-bold">
                  <thead>
                    <tr className="bg-[#b35a38] text-white">
                      <th className="p-4 text-left font-black first:rounded-tl-xl">POS</th>
                      <th className="p-4 text-left font-black">JUGADOR</th>
                      {headers.map(h => (<th key={h} className="p-4 text-center font-black hidden sm:table-cell">{h}</th>))}
                      <th className="p-4 text-right font-black bg-[#8c3d26] last:rounded-tr-xl">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingData.map((p, i) => (
                      <tr key={i} className="border-b border-[#fffaf5] hover:bg-[#fffaf5]">
                        <td className="p-4 text-slate-400">{i + 1}</td>
                        <td className="p-4 uppercase text-slate-700">{p.name}</td>
                        {p.points.map((val: any, idx: number) => (<td key={idx} className="p-4 text-center text-slate-400 hidden sm:table-cell">{val || 0}</td>))}
                        <td className="p-4 text-right text-[#b35a38] text-2xl font-black bg-[#fffaf5]">{p.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-slate-500/80 mt-12 text-sm font-bold uppercase tracking-widest animate-pulse">
          Sistema de seguimiento de torneos en vivo
        </p>
      </div>
    </div>
  )
}