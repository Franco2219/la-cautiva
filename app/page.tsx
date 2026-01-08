"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight, Trophy, Users, Grid3x3 } from "lucide-react"

// --- CONFIGURACIÓN DE DATOS DINÁMICOS Y TORNEOS ---
const SPREADSHEET_ID = '1lDm83_HR0Cp1wCJV_03qqvnZSfJFf-uU';
const getSheetUrl = (sheetName: string) => 
  `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;

const tournaments = [
  { id: "ao", name: "Australian Open", shortName: "AO" },
  { id: "iw", name: "Indian Wells", shortName: "IW" },
  { id: "mc", name: "Monte Carlo", shortName: "MC" },
  { id: "rg", name: "Roland Garros", shortName: "RG" },
  { id: "wimbledon", name: "Wimbledon", shortName: "W" },
  { id: "us", name: "US Open", shortName: "US" },
]

// Datos de prueba para torneos (Mock Data original)
const mockGroupData = [
  { groupName: "Grupo 1", players: ["Martín Rodríguez", "Santiago Fernández", "Luciano González"], results: {} },
  { groupName: "Grupo 2", players: ["Tomás Martínez", "Franco López", "Nicolás Díaz"], results: {} },
]

const mockBracketData = {
  final: { player1: "TBD", score1: "", player2: "TBD", score2: "", date: "DOMINGO 30 DICIEMBRE", time: "18:00 h." },
  thirdPlace: { player1: "TBD", score1: "", player2: "TBD", score2: "", date: "Sábado 29 Dic. 16:00 h." },
}

export default function Home() {
  const [navState, setNavState] = useState<any>({ level: "home" })
  const [rankingData, setRankingData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // --- LÓGICA DEL RANKING (NO TOCAR) ---
  const fetchRankingData = async (categoryShort: string) => {
    setIsLoading(true)
    const sheetName = `${categoryShort} 2025`
    try {
      const response = await fetch(getSheetUrl(sheetName))
      const csvText = await response.text()
      const rows = csvText.split('\n').slice(1)
      const parsedData = rows.map(row => {
        const cols = row.split('","').map(c => c.replace(/"/g, ''))
        return {
          name: cols[1] || "Jugador",
          ao: parseInt(cols[2]) || 0, iw: parseInt(cols[3]) || 0, mc: parseInt(cols[4]) || 0,
          rg: parseInt(cols[5]) || 0, w: parseInt(cols[6]) || 0, us: parseInt(cols[7]) || 0,
          total: parseInt(cols[8]) || 0
        }
      }).sort((a, b) => b.total - a.total).filter(p => p.name !== "Jugador" && p.name !== "")
      setRankingData(parsedData)
    } catch (error) { console.error("Error:", error) } finally { setIsLoading(false) }
  }

  const goBack = () => {
    const levels: any = {
      "main-menu": "home",
      "year-selection": "main-menu",
      "category-selection": "main-menu",
      "tournament-selection": "category-selection",
      "tournament-phases": "tournament-selection",
      "group-phase": "tournament-phases",
      "bracket-phase": "tournament-phases",
      "ranking-view": "category-selection"
    }
    if (navState.level === "category-selection" && navState.type === "ranking") {
        setNavState({ ...navState, level: "year-selection" })
    } else {
        setNavState({ ...navState, level: levels[navState.level] || "home" })
    }
  }

  const buttonStyle = "w-full text-lg h-20 border-2 border-orange-200 bg-white/90 backdrop-blur-sm hover:bg-orange-600 hover:text-white text-orange-950 transform hover:scale-105 transition-all duration-300 font-bold shadow-md rounded-2xl"

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#fffaf5]">
      {/* Fondo decorativo original */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className={`w-full ${navState.level === 'ranking-view' ? 'max-w-7xl' : 'max-w-6xl'} mx-auto z-10 transition-all duration-500`}>
        {/* Header con Glow */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="relative group w-44 h-44">
              <div className="absolute inset-0 bg-gradient-to-r from-[#b35a38]/40 to-orange-400/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <Image src="/logo.png" alt="Logo" width={200} height={200} className="object-contain transition-transform duration-500 group-hover:scale-110 unoptimized" priority />
              </div>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-2 bg-gradient-to-b from-[#8c3d26] to-[#b35a38] bg-clip-text text-transparent italic">La Cautiva</h1>
          <p className="text-xl text-orange-900/40 font-bold uppercase tracking-widest">Club de Tenis</p>
        </div>

        {navState.level !== "home" && (
          <Button onClick={goBack} variant="ghost" className="mb-6 hover:bg-orange-200 text-orange-950 font-bold">← VOLVER</Button>
        )}

        <div className={`space-y-4 ${navState.level === 'ranking-view' ? 'w-full' : 'max-w-xl mx-auto'}`}>
          {navState.level === "home" && (
            <Button onClick={() => setNavState({ level: "main-menu" })} className="w-full h-28 text-2xl bg-[#b35a38] hover:bg-[#8c3d26] text-white font-black rounded-3xl border-b-8 border-[#8c3d26] transform hover:scale-105 transition-all">INGRESAR</Button>
          )}

          {navState.level === "main-menu" && (
            <>
              <Button onClick={() => setNavState({ level: "category-selection", type: "caballeros" })} className={buttonStyle}>CABALLEROS</Button>
              <Button onClick={() => setNavState({ level: "category-selection", type: "damas" })} className={buttonStyle}>DAMAS</Button>
              <Button onClick={() => setNavState({ level: "year-selection", type: "ranking" })} className={buttonStyle}><Trophy className="mr-2 text-[#b35a38]" /> RANKING</Button>
            </>
          )}

          {navState.level === "year-selection" && (
            <>
              <h2 className="text-3xl font-black text-center mb-6 text-orange-950">TEMPORADA</h2>
              <Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2025" })} className={buttonStyle}>RANKING 2025</Button>
              <Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2026" })} className={buttonStyle}>RANKING 2026</Button>
            </>
          )}

          {navState.level === "category-selection" && (
            <>
              <h2 className="text-3xl font-black text-center mb-6 text-orange-950 uppercase">{navState.type}</h2>
              {["Categoría A", "Categoría B1", "Categoría B2", "Categoría C"].map((cat) => (
                <Button key={cat} onClick={() => {
                  const catShort = cat.replace("Categoría ", "");
                  if (navState.type === "ranking") {
                    if (navState.year === "2026") { alert("Próximamente"); return; }
                    fetchRankingData(catShort);
                    setNavState({ ...navState, level: "ranking-view", selectedCategory: cat });
                  } else {
                    setNavState({ ...navState, level: "tournament-selection", category: catShort, selectedCategory: cat });
                  }
                }} className={buttonStyle}>{cat}</Button>
              ))}
            </>
          )}

          {navState.level === "tournament-selection" && (
            <>
              <h2 className="text-3xl font-black text-center mb-6 text-orange-950 uppercase">{navState.selectedCategory}</h2>
              {tournaments.map((t) => (
                <Button key={t.id} onClick={() => setNavState({ ...navState, level: "tournament-phases", tournament: t.name })} className={buttonStyle}>{t.name}</Button>
              ))}
            </>
          )}

          {navState.level === "tournament-phases" && (
            <>
              <h2 className="text-3xl font-black text-center mb-6 text-orange-950">{navState.tournament}</h2>
              <Button onClick={() => setNavState({ ...navState, level: "group-phase" })} className={buttonStyle}><Users className="mr-2" /> Fase de Grupos</Button>
              <Button onClick={() => setNavState({ ...navState, level: "bracket-phase" })} className={buttonStyle}><Grid3x3 className="mr-2" /> Cuadro de Eliminación</Button>
            </>
          )}

          {/* ... Aquí van las vistas de Group y Bracket que ya tenías ... */}

          {navState.level === "ranking-view" && (
            <div className="bg-white border-b-8 border-r-8 border-[#b35a38]/20 rounded-[2.5rem] p-4 md:p-8 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                {/* Tabla de ranking (BLINDADA) */}
                <div className="bg-gradient-to-r from-[#b35a38] to-[#8c3d26] p-6 rounded-2xl mb-8"><h2 className="text-3xl md:text-5xl font-black text-center text-white italic">{navState.selectedCategory} 2025</h2></div>
                <div className="overflow-x-auto"><table className="w-full text-lg">
                    <thead><tr className="bg-[#b35a38] text-white"><th className="p-4 text-left font-black">POS</th><th className="p-4 text-left font-black">JUGADOR</th><th className="p-4 text-center font-black">AO</th><th className="p-4 text-center font-black">IW</th><th className="p-4 text-center font-black">MC</th><th className="p-4 text-center font-black">RG</th><th className="p-4 text-center font-black">W</th><th className="p-4 text-center font-black">US</th><th className="p-4 text-right font-black bg-orange-600">TOTAL</th></tr></thead>
                    <tbody className="font-bold">{rankingData.map((p, i) => (
                        <tr key={i} className="border-b border-orange-100"><td className="p-4"><span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${i < 3 ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-800'}`}>{i + 1}</span></td><td className="p-4 uppercase">{p.name}</td><td className="p-4 text-center text-orange-900/40">{p.ao}</td><td className="p-4 text-center text-orange-900/40">{p.iw}</td><td className="p-4 text-center text-orange-900/40">{p.mc}</td><td className="p-4 text-center text-orange-900/40">{p.rg}</td><td className="p-4 text-center text-orange-900/40">{p.w}</td><td className="p-4 text-center text-orange-900/40">{p.us}</td><td className="p-4 text-right text-[#b35a38] text-2xl font-black bg-orange-50/50">{p.total}</td></tr>
                    ))}</tbody>
                </table></div>
            </div>
          )}
        </div>

        {/* LEYENDA RESTAURADA AL PIE */}
        <p className="text-center text-orange-800/40 mt-12 text-sm md:text-base font-bold uppercase tracking-widest animate-pulse">
          Sistema de seguimiento de torneos en vivo
        </p>
      </div>
    </div>
  )
}