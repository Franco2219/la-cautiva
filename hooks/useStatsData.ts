import { useState, useCallback } from "react";
import { ID_DATOS_GENERALES } from "@/lib/constants";

// ESTE ES EL ID DE TU HOJA "DATA" (DB_Master) QUE VIMOS EN TU CAPTURA
// Al usar export + GID, obligamos a Google a darnos esta hoja exacta.
const SHEET_GID_DATA = "1288809117"; 

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
  // Alias
  tournament: string;
  category: string;
  round: string;
  winner: string; 
  loser: string;  
  date: string;
}

// Parser robusto (Maneja comas dentro de las comillas)
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

  // 1. HISTORIAL CAMPEONES (Sin cambios)
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

  // 2. BUSCAR PARTIDOS (USANDO EXPORT + GID + FILTROS DE SEGURIDAD)
  const fetchMatches = useCallback(async () => {
    setIsLoadingStats(true);
    
    // USAMOS EL ENDPOINT DE EXPORTACIÓN DIRECTA CON EL GID
    const url = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/export?format=csv&gid=${SHEET_GID_DATA}`;

    try {
        const response = await fetch(url);
        const csvText = await response.text();
        const rows = robustCSVParser(csvText);

        const mappedMatches = rows.slice(1).map(row => {
            // Mapeo basado en tu hoja DATA:
            // A=0, B=1, C=2, D=3, E=4, F=5, G=6
            if (row.length < 4) return null; // Si la fila está muy vacía, la descartamos

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
            // --- FILTROS DE SEGURIDAD ---
            
            // 1. Que el objeto exista
            if (!m) return false;
            
            // 2. Que tenga datos esenciales
            if (!m.Jugador || !m.Torneo) return false;
            
            // 3. Que no sea el encabezado repetido
            if (m.Jugador === "Jugador") return false;

            // 4. FILTRO ANTI-NÚMEROS (CRUCIAL):
            // Si el nombre del jugador es un número (ej: "100"), lo ignoramos.
            // Esto evita que salga basura si Google lee la hoja incorrecta.
            if (!isNaN(parseFloat(m.Jugador)) && m.Jugador.length < 5) return false;
            
            return true; 
        });

        console.log(`Partidos cargados correctamente: ${mappedMatches.length}`);
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