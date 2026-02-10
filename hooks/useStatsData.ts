import { useState, useCallback } from "react";
import { ID_DATOS_GENERALES } from "@/lib/constants";

// --- PEGA AQUÍ EL NÚMERO GID QUE COPIASTE DE LA URL ---
// Ejemplo: const SHEET_GID_DB_MASTER = "165432987";
const SHEET_GID_DB_MASTER = "1288809117"; // <--- ¡¡CAMBIA ESTO POR TU NÚMERO!!

// --- INTERFACES ---
export interface ChampionRecord {
  year: string;
  tournament: string;
  category: string;
  champion: string;
  runnerUp: string;
  winCount?: number; 
}

export interface MatchRecord {
  Torneo: string;
  Categoria: string;
  Fase: string;
  Jugador: string;
  Rival: string;
  Resultado: string;
  Fecha: string;
  tournament: string;
  category: string;
  round: string;
  winner: string; 
  loser: string;  
  date: string;
}

// Parser robusto para manejar comas dentro de los nombres
const robustCSVParser = (csvText: string) => {
  const lines = csvText.split(/\r?\n/);
  return lines.map(line => {
    const values = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        values.push(current.trim().replace(/^"|"$/g, '')); 
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));
    return values;
  });
};

export const useStatsData = () => {
  const [historyData, setHistoryData] = useState<ChampionRecord[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // 1. TRAER HISTORIAL DE CAMPEONES (Esta usa nombre, si funciona no la tocamos)
  const fetchChampionHistory = useCallback(async () => {
    setIsLoadingStats(true);
    const url = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent("Historial Campeones")}`;

    try {
      const response = await fetch(url);
      const csvText = await response.text();
      const rows = robustCSVParser(csvText);

      const rawData = rows.slice(1).map(row => ({
        year: row[0] || "",
        tournament: row[1] || "",
        category: row[2] || "",
        champion: row[3] || "",
        runnerUp: row[4] || ""
      })).filter(r => r.year && r.tournament && r.champion);

      rawData.sort((a, b) => parseInt(a.year) - parseInt(b.year));
      const winCounts: Record<string, number> = {};
      
      const processedData = rawData.map(record => {
        const key = `${record.tournament.toLowerCase()}-${record.category.toLowerCase()}-${record.champion.toLowerCase().trim()}`;
        if (!winCounts[key]) winCounts[key] = 0;
        winCounts[key]++;
        return { ...record, winCount: winCounts[key] };
      });

      processedData.sort((a, b) => parseInt(b.year) - parseInt(a.year));
      setHistoryData(processedData);

    } catch (error) {
      console.error("Error fetching history stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // 2. TRAER PARTIDOS DE DB_MASTER (AHORA USANDO GID)
  const fetchMatches = useCallback(async () => {
    setIsLoadingStats(true);
    
    // AQUÍ ESTÁ LA MAGIA: Usamos 'gid' en vez de 'sheet'
    const url = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&gid=${SHEET_GID_DB_MASTER}`;

    try {
        const response = await fetch(url);
        const csvText = await response.text();
        const rows = robustCSVParser(csvText);

        const mappedMatches = rows.slice(1).map(row => {
            if (row.length < 5) return null;

            // Mapeo directo según tu hoja DB_Master
            // 0: Torneo, 1: Categoria, 2: Fase, 3: Jugador, 4: Rival, 5: Resultado, 6: Fecha
            return {
                Torneo: row[0] || "",
                Categoria: row[1] || "",
                Fase: row[2] || "",
                Jugador: row[3] || "",
                Rival: row[4] || "",
                Resultado: row[5] || "",
                Fecha: row[6] || "",
                
                // Alias
                tournament: row[0] || "",
                category: row[1] || "",
                round: row[2] || "",
                winner: row[3] || "",
                loser: row[4] || "",
                score: row[5] || "",
                date: row[6] || ""
            };
        }).filter((m): m is MatchRecord => {
            if (!m) return false;
            // Filtro básico: debe tener Jugador y Torneo
            if (!m.Jugador || !m.Torneo) return false;
            // Filtramos el header si se coló
            if (m.Jugador === "Jugador") return false;
            
            // Ya no necesitamos el filtro de números tan agresivo 
            // porque ahora estamos seguros de leer la hoja correcta.
            // Pero lo dejamos suave por si acaso.
            return true; 
        });

        console.log(`Cargados ${mappedMatches.length} partidos desde DB_Master`);
        setMatches(mappedMatches);
    } catch (error) {
        console.error("Error fetching matches:", error);
    } finally {
        setIsLoadingStats(false);
    }
  }, []);

  return {
    historyData,
    matches,
    isLoadingStats,
    fetchChampionHistory,
    fetchMatches
  };
};