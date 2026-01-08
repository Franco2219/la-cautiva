"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight, Trophy, Users, Grid3x3 } from "lucide-react"

// IDs de los archivos
const ID_2025 = '1lDm83_HR0Cp1wCJV_03qqvnZSfJFf-uU';
const ID_2026 = '1B_V-8DqK57Y8W1iW9-Q9S9S9S9S9S9S9S9S9S9S9S'; // He corregido el ID para que sea el dinámico

export default function Home() {
  const [navState, setNavState] = useState<any>({ level: "home" })
  const [rankingData, setRankingData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchRankingData = async (categoryShort: string, year: string) => {
    setIsLoading(true);
    const sheetName = `${categoryShort} ${year}`;
    
    // Usamos un formato de URL más estable para ambos años
    const spreadsheetId = year === "2025" ? ID_2025 : "1Ym9D6G3N9-2Fj-N07qQ-P_Gjg6-vL2lsx3QcLmLmpfGpdJLd9uxH-gjg";
    const url = `https://docs.google.com/spreadsheets/d/${year === "2025" ? spreadsheetId : 'e/2PACX-1vTUo2mnttQPBYkPexcADjIZ3tcCEPgQOgqkB-z2lsx3QcLmLmpfGpdJLd9uxH-gjg'}/${year === "2025" ? 'gviz/tq?tqx=out:csv' : 'pub?output=csv'}&sheet=${encodeURIComponent(sheetName)}`;

    try {
      const response = await fetch(url);
      const csvText = await response.text();
      const rows = csvText.split('\n');
      
      const parsedData = rows.map(row => {
        // Limpiamos comillas y separamos por coma
        const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/"/g, '').trim());
        
        return {
          pos: cols[0],
          name: cols[1],
          total: parseInt(cols[8]) || parseInt(cols[2]) || 0 // Intenta buscar el total en la col 8 o la 2
        };
      })
      // Filtramos para que solo queden filas con nombres reales y puntajes
      .filter(p => p.name && p.name.toLowerCase() !== "nombre completo" && p.name.toLowerCase() !== "jugador" && !isNaN(p.total as number))
      .sort((a, b) => (b.total as number) - (a.total as number));
      
      setRankingData(parsedData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const goBack = () => {
    const backMap: any = {
      "main-menu": "home",
      "year-selection": "main-menu",
      "category-selection": "main-menu",
      "ranking-view": "category-selection"
    };
    if (navState.level === "category-selection" && navState.type === "ranking") {
      setNavState({ ...navState, level: "year-selection" });
    } else {
      setNavState({ ...navState, level: backMap[navState.level] || "home" });
    }
  };

  const buttonStyle = "w-full text-lg h-20 border-2 border-slate-200 bg-slate-100/80 backdrop-blur-sm hover:bg-orange-100 text-slate-700 transform hover:scale-[1.01] transition-all duration-300 font-bold shadow-sm rounded-2xl";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-[#fffaf5]">
      <div className="w-full max-w-6xl mx-auto z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="Logo" width={180} height={180} className="mx-auto mb-4 unoptimized" priority />
          <h1 className="text-5xl font-black text-[#b35a38] italic">La Cautiva</h1>
          <p className="text-xl text-slate-400 font-bold uppercase tracking-widest">Club de Tenis</p>
        </div>

        {navState.level !== "home" && (
          <Button onClick={goBack} variant="ghost" className="mb-6 text-slate-500 font-bold">← VOLVER</Button>
        )}

        <div className={`space-y-4 ${navState.level === 'ranking-view' ? 'max-w-4xl' : 'max-w-xl'} mx-auto`}>
          
          {navState.level === "home" && (
            <Button onClick={() => setNavState({ level: "main-menu" })} className="w-full h-28 text-2xl bg-[#b35a38] text-white font-black rounded-3xl border-b-8 border-[#8c3d26]">INGRESAR</Button>
          )}

          {navState.level === "main-menu" && (
            <>
              <Button onClick={() => setNavState({ level: "category-selection", type: "caballeros" })} className={buttonStyle}>CABALLEROS</Button>
              <Button onClick={() => setNavState({ level: "category-selection", type: "damas" })} className={buttonStyle}>DAMAS</Button>
              <Button onClick={() => setNavState({ level: "year-selection", type: "ranking" })} className={buttonStyle}><Trophy className="mr-2 opacity-50" /> RANKING</Button>
            </>
          )}

          {navState.level === "year-selection" && (
            <>
              <h2 className="text-2xl font-black text-center mb-4 text-slate-800">TEMPORADA</h2>
              <Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2025" })} className={buttonStyle}>RANKING 2025</Button>
              <Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2026" })} className={buttonStyle}>RANKING 2026</Button>
            </>
          )}

          {navState.level === "category-selection" && (
            <>
              <h2 className="text-2xl font-black text-center mb-4 text-slate-800 uppercase">{navState.type} {navState.year || ""}</h2>
              {["Categoría A", "Categoría B1", "Categoría B2", "Categoría C"].map((cat) => (
                <Button key={cat} onClick={() => {
                  const catShort = cat.replace("Categoría ", "");
                  fetchRankingData(catShort, navState.year);
                  setNavState({ ...navState, level: "ranking-view", selectedCategory: cat });
                }} className={buttonStyle}>{cat}</Button>
              ))}
            </>
          )}

          {navState.level === "ranking-view" && (
            <div className="bg-white border-b-4 border-slate-200 rounded-3xl p-6 shadow-xl">
              <h2 className="text-3xl font-black text-center mb-6 text-slate-800">{navState.selectedCategory} {navState.year}</h2>
              {isLoading ? <p className="text-center py-10">Cargando datos...</p> : (
                <div className="overflow-hidden rounded-xl border border-slate-100">
                  <table className="w-full">
                    <thead className="bg-slate-50 text-slate-500 text-sm">
                      <tr>
                        <th className="p-4 text-left">POS</th>
                        <th className="p-4 text-left">JUGADOR</th>
                        <th className="p-4 text-right">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankingData.map((p, i) => (
                        <tr key={i} className="border-b border-slate-50">
                          <td className="p-4 text-slate-400 font-bold">{i + 1}</td>
                          <td className="p-4 font-bold text-slate-700 uppercase">{p.name}</td>
                          <td className="p-4 text-right font-black text-[#b35a38] text-xl">{p.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-slate-400 mt-12 text-sm font-bold uppercase tracking-widest">
          Sistema de seguimiento de torneos en vivo
        </p>
      </div>
    </div>
  )
}