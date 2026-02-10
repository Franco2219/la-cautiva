import { useState, useCallback } from "react";
import { ID_DATOS_GENERALES } from "@/lib/constants";

// --- GID COPIADO DE TU CAPTURA DE PANTALLA ---
const SHEET_GID_DB_MASTER = "1288809117"; 

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

// Parser que respeta las comas dentro de las comillas (Ej: "Perez, Juan")
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

  // 1. HISTORIAL CAMPEONES (Este funciona bien, lo dejamos igual)
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

      // Lógica de conteo...
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

  // 2. DB_MASTER (CAMBIADO A MÉTODO "EXPORT")
  const fetchMatches = useCallback(async () => {
    setIsLoadingStats(true);
    
    // CAMBIO CLAVE: Usamos /export?format=csv en lugar de /gviz/tq
    // Este enlace obliga a Google a descargar la hoja específica del GID.
    const url = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/export?format=csv&gid=${SHEET_GID_DB_MASTER}`;

    try {
        const response = await fetch(url);
        const csvText = await response.text();
        const rows = robustCSVParser(csvText);

        const mappedMatches = rows.slice(1).map(row => {
            // Mapeo basado en tu DB_Master
            // A=0, B=1, C=2, D=3, E=4, F=5, G=6
            if (row.length < 5) return null;

            return {
                Torneo: row[0] || "",
                Categoria: row[1] || "",
                Fase: row[2] || "",
                Jugador: row[3] || "",
                Rival: row[4] || "",
                Resultado: row[5] || "",
                Fecha: row[6] || "",
                
                // Alias para los componentes
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
            // Filtro de seguridad: Si trae numeros (puntos del ranking), los ignoramos
            // Esto es un doble seguro por si Google fallara de nuevo
            if (!isNaN(parseFloat(m.Jugador)) && m.Jugador.length < 4) return false;
            
            return !!(m.Jugador && m.Torneo && m.Jugador !== "Jugador");
        });

        console.log(`Cargados ${mappedMatches.length} partidos.`);
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