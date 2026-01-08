"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight, Trophy, Users, Grid3x3 } from "lucide-react"

// --- CONFIGURACIÓN DE GOOGLE SHEETS ---
const SPREADSHEET_ID = '1lDm83_HR0Cp1wCJV_03qqvnZSfJFf-uU';
const getSheetUrl = (sheetName: string) => 
  `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;

type NavigationLevel =
  | "home"
  | "main-menu"
  | "year-selection"
  | "category-selection"
  | "ranking-view"
  | "tournament-selection"
  | "tournament-phases"
  | "group-phase"
  | "bracket-phase"

interface NavState {
  level: NavigationLevel
  type?: "caballeros" | "damas" | "ranking"
  year?: "2025" | "2026"
  category?: "A" | "B1" | "B2" | "C"
  selectedCategory?: string
}

interface PlayerRanking {
  position: string;
  name: string;
  total: string;
}

export default function Home() {
  const [navState, setNavState] = useState<NavState>({ level: "home" })
  const [rankingData, setRankingData] = useState<PlayerRanking[]>([])
  const [isLoading, setIsLoading] = useState(false)

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
          position: cols[0] || "-",
          name: cols[1] || "Jugador",
          total: cols[2] || "0"
        }
      }).filter(p => p.name !== "Jugador")
      setRankingData(parsedData)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const goBack = () => {
    if (navState.level === "main-menu") setNavState({ level: "home" })
    else if (navState.level === "year-selection") setNavState({ level: "main-menu" })
    else if (navState.level === "category-selection") setNavState({ level: navState.type === "ranking" ? "year-selection" : "main-menu" })
    else if (navState.level === "ranking-view") setNavState({ level: "category-selection", type: "ranking", year: "2025" })
  }

  const handleCategoryClick = (category: string) => {
    const catShort = category.replace("Categoría ", "")
    if (navState.type === "ranking") {
      if (navState.year === "2026") {
        alert("Próximamente")
        return
      }
      fetchRankingData(catShort)
      setNavState({ level: "ranking-view", type: "ranking", selectedCategory: category })
    }
  }

  const buttonStyle = "w-full text-lg h-20 border-2 bg-slate-800 text-white border-slate-700 hover:bg-slate-700 transition-all font-semibold"

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-white">
      <div className="w-full max-w-xl mx-auto text-center">
        <Image src="/logo.png" alt="Logo" width={120} height={120} className="mx-auto mb-4 unoptimized" />
        <h1 className="text-4xl font-bold mb-8">La Cautiva</h1>

        {navState.level !== "home" && (
          <Button onClick={goBack} variant="ghost" className="mb-4 text-slate-400">← Volver</Button>
        )}

        <div className="space-y-4">
          {navState.level === "home" && (
            <Button onClick={() => setNavState({ level: "main-menu" })} className="w-full h-20 text-xl bg-blue-600">Ingresar</Button>
          )}

          {navState.level === "main-menu" && (
            <>
              <Button onClick={() => setNavState({ level: "category-selection", type: "caballeros" })} className={buttonStyle}>Caballeros</Button>
              <Button onClick={() => setNavState({ level: "category-selection", type: "damas" })} className={buttonStyle}>Damas</Button>
              <Button onClick={() => setNavState({ level: "year-selection", type: "ranking" })} className={buttonStyle}><Trophy className="mr-2" /> Ranking</Button>
            </>
          )}

          {navState.level === "year-selection" && (
            <>
              <Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2025" })} className={buttonStyle}>Ranking 2025</Button>
              <Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2026" })} className={buttonStyle}>Ranking 2026</Button>
            </>
          )}

          {navState.level === "category-selection" && (
            <>
              <h2 className="text-xl mb-4">Seleccionar Categoría</h2>
              {["Categoría A", "Categoría B1", "Categoría B2", "Categoría C"].map((cat) => (
                <Button key={cat} onClick={() => handleCategoryClick(cat)} className={buttonStyle}>{cat}</Button>
              ))}
            </>
          )}

          {navState.level === "ranking-view" && (
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <h2 className="text-xl font-bold mb-4 text-emerald-400">{navState.selectedCategory} 2025</h2>
              {isLoading ? <p>Cargando...</p> : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800">
                      <th className="p-2">Pos</th>
                      <th className="p-2">Jugador</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingData.map((p, i) => (
                      <tr key={i} className="border-b border-slate-800/50">
                        <td className="p-2 font-bold">{p.position}</td>
                        <td className="p-2">{p.name}</td>
                        <td className="p-2 text-right text-emerald-400 font-bold">{p.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}