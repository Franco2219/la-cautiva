"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight, Trophy, Users, Grid3x3 } from "lucide-react"

const ID_2025 = '1lDm83_HR0Cp1wCJV_03qqvnZSfJFf-uU';
const ID_2026 = '2PACX-1vTUo2mnttQPBYkPexcADjIZ3tcCEPgQOgqkB-z2lsx3QcLmLmpfGpdJLd9uxH-gjg';

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
  const [isLoading, setIsLoading] = useState(false)

  const fetchRankingData = async (categoryShort: string, year: string) => {
    setIsLoading(true);
    const sheetName = `${categoryShort} ${year}`;
    const url = year === "2025" 
      ? `https://docs.google.com/spreadsheets/d/${ID_2025}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`
      : `https://docs.google.com/spreadsheets/d/e/${ID_2026}/pub?output=csv&sheet=${encodeURIComponent(sheetName)}`;

    try {
      const response = await fetch(url);
      const csvText = await response.text();
      const rows = csvText.split('\n');
      const parsedData = rows.map(row => {
        const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/"/g, '').trim());
        return {
          name: cols[1],
          ao: parseInt(cols[2]) || 0, iw: parseInt(cols[3]) || 0, mc: parseInt(cols[4]) || 0,
          rg: parseInt(cols[5]) || 0, w: parseInt(cols[6]) || 0, us: parseInt(cols[7]) || 0,
          total: parseInt(cols[8]) || 0
        };
      }).filter(p => p.name && !["nombre completo", "jugador", "nombre"].includes(p.name.toLowerCase())).sort((a, b) => b.total - a.total);
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

  const buttonStyle = "w-full text-lg h-20 border-2 border-slate-200 bg-slate-100/80 backdrop-blur-sm hover:bg-orange-100 text-slate-700 transform hover:scale-[1.01] transition-all duration-300 font-bold shadow-sm rounded-2xl";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-[#fffaf5]">
      <div className={`w-full ${navState.level === 'ranking-view' || navState.level === 'group-phase' ? 'max-w-7xl' : 'max-w-6xl'} mx-auto z-10`}>
        
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

        <div className="space-y-4 max-w-xl mx-auto">
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
              <h2 className="text-2xl font-black text-center mb-4 text-slate-800">TEMPORADA</h2>
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
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-center mb-4 text-slate-800 uppercase">{navState.selectedCategory}</h2>
              {tournaments.map((t) => (
                <Button key={t.id} onClick={() => setNavState({ ...navState, level: "tournament-phases", tournament: t.name })} className={buttonStyle}>{t.name}</Button>
              ))}
            </div>
          )}

          {navState.level === "tournament-phases" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-center mb-4 text-slate-800">{navState.tournament}</h2>
              <Button onClick={() => setNavState({ ...navState, level: "group-phase" })} className={buttonStyle}><Users className="mr-2" /> Fase de Grupos</Button>
              <Button onClick={() => setNavState({ ...navState, level: "bracket-phase" })} className={buttonStyle}><Grid3x3 className="mr-2" /> Cuadro de Eliminación</Button>
            </div>
          )}
        </div>

        {/* VISTA DE GRUPOS (RESTAURADA) */}
        {navState.level === "group-phase" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
            {mockGroupData.map((group) => (
              <div key={group.groupName} className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-xl">
                <h3 className="text-2xl font-black mb-4 text-[#b35a38] text-center">{group.groupName}</h3>
                <table className="w-full text-left font-bold">
                  <thead className="bg-slate-50"><tr><th className="p-3">Jugador</th><th className="p-3 text-center">PTS</th></tr></thead>
                  <tbody>{group.players.map(p => (<tr key={p} className="border-b border-slate-50"><td className="p-3 uppercase text-slate-700">{p}</td><td className="p-3 text-center">0</td></tr>))}</tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* VISTA DE CUADRO (RESTAURADA) */}
        {navState.level === "bracket-phase" && (
          <div className="bg-white border-b-8 border-r-8 border-slate-200 rounded-[2.5rem] p-8 shadow-2xl text-center">
            <Trophy className="w-16 h-16 mx-auto text-orange-400 mb-4" />
            <h2 className="text-3xl font-black text-slate-800 mb-4 uppercase">Cuadro de Eliminación</h2>
            <p className="text-slate-400 font-bold">Los cuadros se generarán al finalizar la fase de grupos.</p>
          </div>
        )}

        {/* VISTA DE RANKING (BLINDADA) */}
        {navState.level === "ranking-view" && (
          <div className="bg-white border-b-8 border-r-8 border-slate-200 rounded-[2.5rem] p-4 md:p-8 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="bg-slate-800 p-6 rounded-2xl mb-8 text-center italic">
              <h2 className="text-3xl md:text-5xl font-black text-white">{navState.selectedCategory} {navState.year}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-lg font-bold">
                <thead>
                  <tr className="bg-slate-100 text-slate-600">
                    <th className="p-4 text-left font-black">POS</th>
                    <th className="p-4 text-left font-black">JUGADOR</th>
                    {['AO','IW','MC','RG','W','US'].map(h => (<th key={h} className="p-4 text-center font-black hidden sm:table-cell">{h}</th>))}
                    <th className="p-4 text-right font-black bg-slate-200">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingData.map((p, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-slate-400">{i + 1}</td>
                      <td className="p-4 uppercase text-slate-700">{p.name}</td>
                      {[p.ao, p.iw, p.mc, p.rg, p.w, p.us].map((val, idx) => (<td key={idx} className="p-4 text-center text-slate-400 hidden sm:table-cell">{val}</td>))}
                      <td className="p-4 text-right text-slate-900 text-2xl font-black bg-slate-50/50">{p.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="text-center text-slate-500/80 mt-12 text-sm font-bold uppercase tracking-widest animate-pulse">
          Sistema de seguimiento de torneos en vivo
        </p>
      </div>
    </div>
  )
}