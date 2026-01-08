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

  const buttonStyle = "w-full text-lg h-20 border-2 border-orange-200 bg-white/90 backdrop-blur-sm hover:bg-orange-600 hover:text-white text-orange-950 transform hover:scale-105 transition-all duration-300 font-bold shadow-md rounded-2xl"

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#fffaf5]">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className={`w-full ${navState.level === 'ranking-view' ? 'max-w-7xl' : 'max-w-6xl'} mx-auto z-10 transition-all duration-500`}>
        {/* Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top duration-1000">
          <div className="flex justify-center mb-5">
            <div className="relative group w-44 h-44">
              <div className="absolute inset-0 bg-gradient-to-r from-[#b35a38]/40 to-orange-400/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="La Cautiva"
                  width={200}
                  height={200}
                  className="object-contain transition-transform duration-500 group-hover:scale-110 unoptimized"
                  priority
                />
              </div>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-2 bg-gradient-to-b from-[#8c3d26] to-[#b35a38] bg-clip-text text-transparent tracking-tighter">
            La Cautiva
          </h1>
          <p className="text-xl text-orange-900/40 font-bold tracking-[0.2em] uppercase">Club de Tenis</p>
        </div>

        {navState.level !== "home" && (
          <div className="mb-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <Button onClick={goBack} variant="ghost" className="hover:bg-orange-200 text-orange-950 font-bold">
              ← VOLVER
            </Button>
          </div>
        )}

        <div className={`space-y-4 ${navState.level === 'ranking-view' ? 'w-full' : 'max-w-xl mx-auto'}`}>
          {navState.level === "home" && (
            <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Button
                size="lg"
                onClick={() => setNavState({ level: "main-menu" })}
                className="w-full max-w-md text-2xl h-28 bg-[#b35a38] hover:bg-[#8c3d26] text-white transform hover:scale-105 hover:shadow-[0_20px_50px_rgba(179,90,56,0.3)] transition-all duration-300 font-black rounded-3xl border-b-8 border-[#8c3d26]"
              >
                INGRESAR
              </Button>
            </div>
          )}

          {navState.level === "main-menu" && (
            <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-right-4">
              <Button onClick={() => setNavState({ level: "category-selection", type: "caballeros" })} className={buttonStyle}>CABALLEROS</Button>
              <Button onClick={() => setNavState({ level: "category-selection", type: "damas" })} className={buttonStyle}>DAMAS</Button>
              <Button onClick={() => setNavState({ level: "year-selection", type: "ranking" })} className={buttonStyle}>
                <Trophy className="w-7 h-7 mr-3 text-[#b35a38]" /> RANKING
              </Button>
            </div>
          )}

          {navState.level === "year-selection" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-3xl font-black text-center mb-6 text-orange-950">TEMPORADA</h2>
              <Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2025" })} className={buttonStyle}>RANKING 2025</Button>
              <Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2026" })} className={buttonStyle}>RANKING 2026</Button>
            </div>
          )}

          {navState.level === "category-selection" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-3xl font-black text-center mb-6 text-orange-950 uppercase">{navState.type} {navState.year}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["Categoría A", "Categoría B1", "Categoría B2", "Categoría C"].map((cat) => (
                  <Button key={cat} onClick={() => {
                    if (navState.year === "2026") { alert("Ranking 2026 próximamente"); return; }
                    const catShort = cat.replace("Categoría ", "");
                    fetchRankingData(catShort);
                    setNavState({ level: "ranking-view", selectedCategory: cat });
                  }} className={buttonStyle}>{cat}</Button>
                ))}
              </div>
            </div>
          )}

          {navState.level === "ranking-view" && (
            <div className="bg-white border-b-8 border-r-8 border-[#b35a38]/20 rounded-[2.5rem] p-4 md:p-8 shadow-2xl animate-in zoom-in-95 duration-500">
              <div className="bg-gradient-to-r from-[#b35a38] to-[#8c3d26] p-6 rounded-2xl mb-8 shadow-inner">
                <h2 className="text-3xl md:text-5xl font-black text-center text-white italic tracking-tighter">
                  {navState.selectedCategory} 2025
                </h2>
              </div>
              
              {isLoading ? (
                <div className="flex flex-col items-center py-20">
                  <div className="w-16 h-16 border-4 border-[#b35a38] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-[#b35a38] font-black animate-pulse">SINCRONIZANDO CON EL CLUB...</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl">
                  <table className="w-full text-base md:text-lg">
                    <thead>
                      <tr className="bg-[#b35a38] text-white">
                        <th className="p-4 text-left first:rounded-tl-xl font-black">POS</th>
                        <th className="p-4 text-left font-black">JUGADOR</th>
                        {['AO','IW','MC','RG','W','US'].map(h => (
                          <th key={h} className="p-4 text-center font-black hidden sm:table-cell">{h}</th>
                        ))}
                        <th className="p-4 text-right last:rounded-tr-xl font-black bg-orange-600">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody className="font-bold">
                      {rankingData.map((p, i) => (
                        <tr key={i} className="border-b border-orange-100 hover:bg-orange-50 transition-all">
                          <td className="p-4">
                            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${i < 3 ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-800'}`}>
                              {i + 1}
                            </span>
                          </td>
                          <td className="p-4 text-orange-950 uppercase">{p.name}</td>
                          {[p.ao, p.iw, p.mc, p.rg, p.w, p.us].map((val, idx) => (
                            <td key={idx} className="p-4 text-center text-orange-900/40 hidden sm:table-cell">{val}</td>
                          ))}
                          <td className="p-4 text-right text-[#b35a38] text-2xl font-black bg-orange-50/50">{p.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}