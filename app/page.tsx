"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight, Trophy, Users, Grid3x3, Calendar } from "lucide-react"

// --- CONFIGURACIÓN DE GOOGLE SHEETS ---
const SPREADSHEET_ID = '1lDm83_HR0Cp1wCJV_03qqvnZSfJFf-uU';
const getSheetUrl = (sheetName: string) => 
  `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;

type NavigationLevel =
  | "home"
  | "main-menu"
  | "year-selection" // Nuevo nivel para elegir 2025 o 2026
  | "category-selection"
  | "tournament-selection"
  | "tournament-phases"
  | "group-phase"
  | "bracket-phase"
  | "ranking-view"

interface NavState {
  level: NavigationLevel
  type?: "caballeros" | "damas" | "ranking"
  year?: "2025" | "2026"
  category?: "A" | "B1" | "B2" | "C"
  selectedCategory?: string
  tournament?: string
  tournamentId?: string
}

// Interfaz para los datos del ranking
interface PlayerRanking {
  position: string;
  name: string;
  total: string;
}

const tournaments = [
  { id: "ao", name: "Australian Open", shortName: "AO" },
  { id: "iw", name: "Indian Wells", shortName: "IW" },
  { id: "mc", name: "Monte Carlo", shortName: "MC" },
  { id: "rg", name: "Roland Garros", shortName: "RG" },
  { id: "wimbledon", name: "Wimbledon", shortName: "W" },
  { id: "us", name: "US Open", shortName: "US" },
]

export default function Home() {
  const [navState, setNavState] = useState<NavState>({ level: "home" })
  const [rankingData, setRankingData] = useState<PlayerRanking[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Función para cargar datos reales de Google Sheets
  const fetchRankingData = async (categoryShort: string) => {
    setIsLoading(true)
    const sheetName = `${categoryShort} 2025`
    try {
      const response = await fetch(getSheetUrl(sheetName))
      const csvText = await response.text()
      
      // Procesar CSV (asumiendo formato estándar de Google Sheets export)
      const rows = csvText.split('\n').slice(1) // Ignorar encabezado
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
      console.error("Error cargando Excel:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const goBack = () => {
    const levels: Record<NavigationLevel, NavigationLevel | "home"> = {
      "home": "home",
      "main-menu": "home",
      "year-selection": "main-menu",
      "category-selection": "year-selection",
      "ranking-view": "category-selection",
      "tournament-selection": "category-selection",
      "tournament-phases": "tournament-selection",
      "group-phase": "tournament-phases",
      "bracket-phase": "tournament-phases"
    }
    setNavState(prev => ({ ...prev, level: levels[prev.level] || "home" }))
  }

  const handleYearSelect = (year: "2025" | "2026") => {
    setNavState(prev => ({ ...prev, level: "category-selection", year }))
  }

  const handleCategoryClick = (category: string) => {
    const categoryShort = category.replace("Categoría ", "")
    
    if (navState.type === "ranking") {
      if (navState.year === "2026") {
        alert("Ranking 2026 estará disponible próximamente.")
        return
      }
      fetchRankingData(categoryShort)
      setNavState(prev => ({ ...prev, level: "ranking-view", selectedCategory: category }))
    } else {
      setNavState(prev => ({ ...prev, level: "tournament-selection", category: categoryShort as any, selectedCategory: category }))
    }
  }

  // Estilo unificado para todos los botones
  const buttonStyle = "w-full text-lg h-20 border-2 bg-slate-800 text-white border-slate-700 hover:bg-slate-700 hover:border-primary transform hover:scale-[1.02] transition-all duration-300 font-semibold shadow-md"

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden bg-slate-950 text-slate-100">
      <div className="w-full max-w-6xl mx-auto z-10">
        
        {/* Header con Logo */}
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="Logo" width={150} height={150} className="mx-auto mb-4 unoptimized" />
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">La Cautiva</h1>
          <p className="text-slate-400">Club de Tenis</p>
        </div>

        {navState.level !== "home" && (
          <Button onClick={goBack} variant="ghost" className="mb-6 text-slate-300 hover:text-white">← Volver</Button>
        )}

        <div className="space-y-4 max-w-xl mx-auto">
          
          {navState.level === "home" && (
            <Button size="lg" onClick={() => setNavState({ level: "main-menu" })} className="w-full h-24 bg-blue-600 hover:bg-blue-500 text-2xl font-bold">
              Ingresar <ChevronRight className="ml-2" />
            </Button>
          )}

          {navState.level === "main-menu" && (
            <>
              <Button onClick={() => setNavState({ level: "category-selection", type: "caballeros" })} className={buttonStyle}>Caballeros</Button>
              <Button onClick={() => setNavState({ level: "category-selection", type: "damas" })} className={buttonStyle}>Damas</Button>
              <Button onClick={() => setNavState({ level: "year-selection", type: "ranking" })} className={buttonStyle}>
                <Trophy className="mr-2" /> Ranking
              </Button>
            </>
          )}

          {navState.level === "year-selection" && (
            <>
              <h2 className="text-2xl font-bold text-center mb-4">Seleccionar Año</h2>
              <Button onClick={() => handleYearSelect("2025")} className={buttonStyle}>Ranking 2025</Button>
              <Button onClick={() => handleYearSelect("2026")} className={buttonStyle}>Ranking 2026</Button>
            </>
          )}

          {navState.level === "category-selection" && (
            <>
              <h2 className="text-2xl font-bold text-center mb-4 capitalize">{navState.type} {navState.year}</h2>
              {["Categoría A", "Categoría B1", "Categoría B2", "Categoría C"].map((cat) => (
                <Button key={cat} onClick={() => handleCategoryClick(cat)} className={buttonStyle}>{cat}</Button>
              ))}
            </>