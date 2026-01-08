"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight, Trophy, Users, Grid3x3 } from "lucide-react"

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
      .sort((a, b) => b.total - a.total)
      .filter(p => p.name !== "Jugador" && p.name !== "")
      
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
    else if (navState.level === "category-selection") setNavState({ level: "year-selection", type: "ranking" })
    else if (navState.level === "ranking-view") setNavState({ level: "category-selection", type: "ranking", year: "2025" })
  }

  // Estilo de botón original
  const buttonStyle = "w-full text-lg h-20 border-2 border-orange-200 bg-white/80 backdrop-blur-sm hover:bg-orange-100 text-orange-900 transform hover:scale-105 transition-all duration-300 font-semibold shadow-md rounded-xl"

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#fffaf5]">
      {/* Fondo decorativo original con animaciones */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-6xl mx-auto z-10">
        {/* Header con Efecto de Logo Original */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top duration-1000">
          <div className="flex justify-center mb-5">
            <div className="relative group w-44 h-44">
              {/* Resplandor al pasar el mouse */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="La Cautiva Tennis Club"
                  width={180}
                  height={180}
                  className="object-contain transition-transform duration-500 group-hover:scale-105 unoptimized"
                  priority
                />
              </div>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-[#b35a38] via-[#d97706] to-[#b35a38] bg-clip-text text-transparent">
            La Cautiva
          </h1>
          <p className="text-lg md:text-xl text-orange-800/60 font-medium">Club de Tenis</p>
        </div>

        {navState.level !== "home" && (
          <div className="mb-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <Button onClick={goBack} variant="ghost" className="hover:bg-orange-100 text-orange-900">
              ← Volver
            </Button>
          </div>
        )}

        <div className="space-y-4 max-w-xl mx-auto">
          {navState.level === "home" && (
            <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Button
                size="lg"
                onClick={() => setNavState({ level: "main-menu" })}
                className="w-full max-w-md text-xl h-24 bg-[#b35a38] hover:bg-[#964a2e] text-white transform hover:scale-105 hover:shadow-2xl transition-all duration-300 font-bold rounded-2xl"
              >
                <ChevronRight className="w-8 h-8 mr-3" />
                Ingresar
              </Button>
            </div>
          )}

          {navState.level === "main-menu" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <Button onClick={() => setNavState({ level: "category-selection", type: "caballeros" })} className={buttonStyle}>Caballeros</Button>
              <Button onClick={() => setNavState({ level: "category-selection", type: "damas" })} className={buttonStyle}>Damas</Button>
              <Button onClick={() => setNavState({ level: "year-selection", type: "ranking" })} className={buttonStyle}>
                <Trophy className="w-6 h-6 mr-3 text-[#b35a38]" />
                Ranking
              </Button>
            </div>
          )}

          {navState.level === "year-selection" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold text-center mb-6 text-orange-900">Seleccionar Año</h2>
              <Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2025" })} className={buttonStyle}>Ranking 2025</Button>
              <Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2026" })} className={buttonStyle}>Ranking 2026</Button>
            </div>
          )}

          {navState.level === "category-selection" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold text-center mb-6 text-orange-900 capitalize">
                {navState.type} {navState.year}
              </h2>
              {["Categoría A", "Categoría B1", "Categoría B2", "Categoría C"].map((cat) => (
                <Button key={cat} onClick={() => {
                  if (navState.year === "2026") {
                    alert("El Ranking 2026 estará disponible al inicio de la temporada.");
                    return;
                  }
                  const catShort = cat.replace("Categoría ", "");
                  fetchRankingData(catShort);
                  setNavState({ level: "ranking-view", selectedCategory: cat });
                }} className={buttonStyle}>
                  {cat}
                </Button>
              ))}
            </div>
          )}

          {navState.level === "ranking-view" && (
            <div className="bg-white/90 backdrop-blur-md border-2 border-orange-100 rounded-3xl p-5 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
              <h2 className="text-2xl font-bold text-center mb-6 text-[#b35a38]">{navState.selectedCategory} 2025</h2>
              {isLoading ? (
                <div className="flex flex-col items-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#b35a38] mb-4"></div>
                  <p className="text-orange-800 font-medium">Actualizando ranking en vivo...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-orange-50 text-orange-900">
                        <th className="p-3 text-left rounded-tl-xl">Pos</th>
                        <th className="p-3 text-left">Jugador</th>
                        <th className="p-3 text-center">AO</th>
                        <th className="p-3 text-center">IW</th>
                        <th className="p-3 text-center">MC</th>
                        <th className="p-3 text-center">RG</th>
                        <th className="p-3 text-center">W</th>
                        <th className="p-3 text-center">US</th>
                        <th className="p-3 text-right bg-orange-100 font-bold rounded-tr-xl">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankingData.map((p, i) => (
                        <tr key={i} className="border-b border-orange-50 hover:bg-orange-50/50 transition-colors">
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
        <p className="text-center text-orange-800/40 mt-10 text-sm font-medium">
          Sistema de seguimiento de torneos en vivo
        </p>
      </div>
    </div>
  )
}