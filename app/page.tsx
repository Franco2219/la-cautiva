"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight, Trophy, Users, Grid3x3 } from "lucide-react"

// --- CONFIGURACIÓN DE GOOGLE SHEETS ---
const SPREADSHEET_2025 = '1lDm83_HR0Cp1wCJV_03qqvnZSfJFf-uU';
// Link público de 2026 convertido a formato de datos (ID extraído del link)
const SPREADSHEET_2026 = '2PACX-1vTUo2mnttQPBYkPexcADjIZ3tcCEPgQOgqkB-z2lsx3QcLmLmpfGpdJLd9uxH-gjg';

const getSheetUrl = (year: string, sheetName: string) => {
  if (year === "2025") {
    return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_2025}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  }
  // Para 2026 usamos el formato de publicación web directa
  return `https://docs.google.com/spreadsheets/d/e/${SPREADSHEET_2026}/pub?output=csv&sheet=${encodeURIComponent(sheetName)}`;
}

const tournaments = [
  { id: "ao", name: "Australian Open" },
  { id: "iw", name: "Indian Wells" },
  { id: "mc", name: "Monte Carlo" },
  { id: "rg", name: "Roland Garros" },
  { id: "wimbledon", name: "Wimbledon" },
  { id: "us", name: "US Open" },
]

export default function Home() {
  const [navState, setNavState] = useState<any>({ level: "home" })
  const [rankingData, setRankingData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchRankingData = async (categoryShort: string, year: string) => {
    setIsLoading(true)
    const sheetName = `${categoryShort} ${year}`
    try {
      const response = await fetch(getSheetUrl(year, sheetName))
      const csvText = await response.text()
      const rows = csvText.split('\n').slice(1)
      const parsedData = rows.map(row => {
        const cols = row.split(',').map(c => c.replace(/"/g, ''))
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
      "ranking-view": "category-selection"
    }
    if (navState.level === "category-selection" && navState.type === "ranking") {
        setNavState({ ...navState, level: "year-selection" })
    } else {
        setNavState({ ...navState, level: levels[navState.level] || "home" })
    }
  }

  // BOTONES MÁS OPACOS Y ELEGANTES
  const buttonStyle = "w-full text-lg h-20 border-2 border-slate-200 bg-slate-100/80 backdrop-blur-sm hover:bg-orange-200/50 text-slate-700 transform hover:scale-[1.02] transition-all duration-300 font-bold shadow-sm rounded-2xl"

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#fffaf5]">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-slate-500/5 rounded-full blur-3xl" />
      </div>

      <div className={`w-full ${navState.level === 'ranking-view' ? 'max-w-7xl' : 'max-w-6xl'} mx-auto z-10 transition-all duration-500`}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="relative group w-44 h-44">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-slate-400/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Image src="/logo.png" alt="Logo" width={200} height={200} className="relative z-10 object-contain transition-transform duration-500 group-hover:scale-110 unoptimized" priority />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-2 text-[#b35a38] italic">La Cautiva</h1>
          <p className="text-xl text-slate-400 font-bold uppercase tracking-widest">Club de Tenis</p>
        </div>

        {navState.level !== "home" && (
          <Button onClick={goBack} variant="ghost" className="mb-6 hover:bg-slate-200 text-slate-600 font-bold">← VOLVER</Button>
        )}

        <div className={`space-y-4 ${navState.level === 'ranking-view' ? 'w-full' : 'max-w-xl mx-auto'}`}>
          {navState.level === "home" && (
            <Button onClick={() => setNavState({ level: "main-menu" })} className="w-full h-28 text-2xl bg-[#b35a38] hover:bg-[#964a2e] text-white font-black rounded-3xl border-b-8 border-[#8c3d26] transform hover:scale-105 transition-all">INGRESAR</Button>
          )}

          {navState.level === "main-menu" && (
            <>
              <Button onClick={() => setNavState({ level: "category-selection", type: "caballeros" })} className={buttonStyle}>CABALLEROS</Button>
              <Button onClick={() => setNavState({ level: "category-selection", type: "damas" })} className={buttonStyle}>DAMAS</Button>
              <Button onClick={() => setNavState({ level: "year-selection", type: "ranking" })} className={buttonStyle}><Trophy className="mr-2 text-slate-400" /> RANKING</Button>
            </>
          )}

          {navState.level === "year-selection" && (
            <>
              <h2 className="text-3xl font-black text-center mb-6 text-slate-800">TEMPORADA</h2>
              <Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2025" })} className={buttonStyle}>RANKING 2025</Button>
              <Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2026" })} className={buttonStyle}>RANKING 2026</Button>
            </>
          )}

          {navState.level === "category-selection" && (
            <>
              <h2 className="text-3xl font-black text-center mb-6 text-slate-800 uppercase">{navState.type}</h2>
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
            </>
          )}

          {navState.level === "ranking-view" && (
            <div className="bg-white border-b-8 border-r-8 border-slate-200 rounded-[2.5rem] p-4 md:p-8 shadow-2xl overflow-hidden">
                <div className="bg-slate-800 p-6 rounded-2xl mb-8">
                  <h2 className="text-3xl md:text-5xl font-black text-center text-white italic">{navState.selectedCategory} {navState.year}</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-lg">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600">
                        <th className="p-4 text-left font-black">POS</th>
                        <th className="p-4 text-left font-black">JUGADOR</th>
                        <th className="p-4 text-right font-black bg-slate-200">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody className="font-bold">
                      {rankingData.map((p, i) => (
                        <tr key={i} className="border-b border-slate-50"><td className="p-4"><span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-500">{i + 1}</span></td><td className="p-4 uppercase text-slate-700">{p.name}</td><td className="p-4 text-right text-slate-900 text-2xl font-black bg-slate-50/50">{p.total}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </div>
          )}
        </div>

        <p className="text-center text-slate-500/80 mt-12 text-sm md:text-base font-bold uppercase tracking-widest">
          Sistema de seguimiento de torneos en vivo
        </p>
      </div>
    </div>
  )
}