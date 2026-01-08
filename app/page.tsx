"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight, Trophy, Users, Grid3x3 } from "lucide-react"

// --- CONFIGURACIÓN DE GOOGLE SHEETS ---
const SPREADSHEET_ID = '1lDm83_HR0Cp1wCJV_03qqvnZSfJFf-uU';
const getSheetUrl = (sheetName: string) => 
  `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;

export default function Home() {
  const [navState, setNavState] = useState<any>({ level: "home" })
  const [rankingData, setRankingData] = useState<any[]>([])
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
          name: cols[1] || "Jugador",
          ao: parseInt(cols[2]) || 0,
          iw: parseInt(cols[3]) || 0,
          mc: parseInt(cols[4]) || 0,
          rg: parseInt(cols[5]) || 0,
          w: parseInt(cols[6]) || 0,
          us: parseInt(cols[7]) || 0,
          total: parseInt(cols[8]) || 0
        }
      })
      // ORDENAR POR TOTAL DESCENDENTE
      .sort((a, b) => b.total - a.total)
      .filter(p => p.name !== "Jugador")
      
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
    else if (navState.level === "category-selection") setNavState({ level: "year-selection" })
    else if (navState.level === "ranking-view") setNavState({ level: "category-selection", type: "ranking", year: "2025" })
  }

  // Estilo original "Arcilla / La Cautiva"
  const buttonStyle = "w-full text-lg h-20 border-2 border-primary/20 bg-white hover:bg-orange-50 text-orange-900 transform hover:scale-105 transition-all duration-300 font-semibold shadow-md"

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#fffaf5]">
      {/* Fondo decorativo arcilla */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-6xl mx-auto z-10">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="Logo" width={180} height={180} className="mx-auto mb-4 unoptimized" priority />
          <h1 className="text-4xl md:text-6xl font-bold text-[#b35a38]">La Cautiva</h1>
          <p className="text-orange-800/60 font-medium">Club de Tenis</p>
        </div>

        {navState.level !== "home" && (
          <Button onClick={goBack} variant="ghost" className="mb-6 hover:bg-orange-100 text-orange-900">← Volver</Button>
        )}

        <div className="space-y-4 max-w-xl mx-auto">
          {navState.level === "home" && (
            <Button onClick={() => setNavState({ level: "main-menu" })} className="w-full h-24 text-xl bg-[#b35a38] hover:bg-[#964a2e] text-white font-bold shadow-xl transition-all transform hover:scale-105">
              Ingresar <ChevronRight className="ml-2" />
            </Button>
          )}

          {navState.level === "main-menu" && (
            <>
              <Button onClick={() => setNavState({ level: "category-selection", type: "caballeros" })} className={buttonStyle}>Caballeros</Button>
              <Button onClick={() => setNavState({ level: "category-selection", type: "damas" })} className={buttonStyle}>Damas</Button>
              <Button onClick={() => setNavState({ level: "year-selection", type: "ranking" })} className={buttonStyle}><Trophy className="mr-2 text-orange-600" /> Ranking</Button>
            </>
          )}

          {navState.level === "year-selection" && (
            <>
              <h2 className="text-2xl font-bold text-center mb-4 text-orange-900">Seleccionar Año</h2>
              <Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2025" })} className={buttonStyle}>Ranking 2025</Button>
              <Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2026" })} className={buttonStyle}>Ranking 2026</Button>
            </>
          )}

          {navState.level === "category-selection" && (
            <>
              <h2 className="text-2xl font-bold text-center mb-4 text-orange-900 capitalize">{navState.type} {navState.year}</h2>
              {["Categoría A", "Categoría B1", "Categoría B2", "Categoría C"].map((cat) => (
                <Button key={cat} onClick={() => {
                  const catShort = cat.replace("Categoría ", "");
                  fetchRankingData(catShort);
                  setNavState({ level: "ranking-view", selectedCategory: cat });
                }} className={buttonStyle}>{cat}</Button>
              ))}
            </>
          )}

          {navState.level === "ranking-view" && (
            <div className="bg-white border-2 border-orange-200 rounded-2xl p-4 shadow-2xl overflow-hidden">
              <h2 className="text-2xl font-bold text-center mb-6 text-[#b35a38]">{navState.selectedCategory} 2025</h2>
              {isLoading ? <p className="text-center py-10 text-orange-800">Cargando ranking en vivo...</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-orange-50 text-orange-900">
                      <tr>
                        <th className="p-3 text-left">Pos</th>
                        <th className="p-3 text-left">Jugador</th>
                        <th className="p-3 text-center">AO</th>
                        <th className="p-3 text-center">IW</th>
                        <th className="p-3 text-center">MC</th>
                        <th className="p-3 text-center">RG</th>
                        <th className="p-3 text-center">W</th>
                        <th className="p-3 text-center">US</th>
                        <th className="p-3 text-right bg-orange-100 font-bold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankingData.map((p, i) => (
                        <tr key={i} className="border-b border-orange-100 hover:bg-orange-50/50">
                          <td className="p-3 font-bold text-orange-700">{i + 1}</td>
                          <td className="p-3 font-semibold text-slate-800">{p.name}</td>
                          <td className="p-3 text-center text-slate-500">{p.ao}</td>
                          <td className="p-3 text-center text-slate-500">{p.iw}</td>
                          <td className="p-3 text-center text-slate-500">{p.mc}</td>
                          <td className="p-3 text-center text-slate-500">{p.rg}</td>
                          <td className="p-3 text-center text-slate-500">{p.w}</td>
                          <td className="p-3 text-center text-slate-500">{p.us}</td>
                          <td className="p-3 text-right font-bold text-[#b35a38] bg-orange-50/30">{p.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="text-center text-orange-800/40 mt-8 text-sm font-medium">Sistema de seguimiento de torneos en vivo</p>
      </div>
    </div>
  )
}