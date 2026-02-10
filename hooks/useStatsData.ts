import { useState, useCallback } from "react";
import { ID_DATOS_GENERALES } from "@/lib/constants";

// EL GID DE TU HOJA "DATA" (Confirmado por tu captura)
const SHEET_GID_DATA = "1288809117"; 

export interface ChampionRecord {
  year: string;
  tournament: string;
  category: string;
  champion: string;
  runnerUp: string;
  winCount?: number; 
}

export interface MatchRecord {
  // Campos obligatorios para que no te de error la línea roja
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
  score: string;
}

// Parser CSV
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

  // 1. HISTORIAL CAMPEONES
  const fetchChampionHistory = useCallback(async () => {
    setIsLoadingStats(true);
    // Este endpoint suele funcionar bien por nombre de hoja
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

  // 2. BUSCAR PARTIDOS (Usando endpoint PUB + GID)
  const fetchMatches = useCallback(async () => {
    setIsLoadingStats(true);
    
    // CAMBIO CLAVE: Usamos 'pub' en vez de 'gviz'. Esto OBLIGA a Google a respetar el GID.
    // Requiere que hayas hecho el Paso 1 (Publicar en la web)
    const url = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/pub?gid=${SHEET_GID_DATA}&single=true&output=csv`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error de red o hoja no publicada");
        
        const csvText = await response.text();
        const rows = robustCSVParser(csvText);

        const mappedMatches = rows.slice(1).map(row => {
            // Verificación básica de columnas
            if (row.length < 4) return null;

            // Mapeo completo (¡NO BORRES ESTAS LÍNEAS! Son las que faltaban en tu captura)
            return {
                Torneo: row[0] || "",
                Categoria: row[1] || "",
                Fase: row[2] || "",
                Jugador: row[3] || "",
                Rival: row[4] || "",
                Resultado: row[5] || "",
                Fecha: row[6] || "",
                
                // Alias en inglés
                tournament: row[0] || "",
                category: row[1] || "",
                round: row[2] || "",
                winner: row[3] || "",
                loser: row[4] || "",
                score: row[5] || "",
                date: row[6] || ""
            };
        }).filter((m): m is MatchRecord => {
            // Filtros de seguridad
            if (!m) return false;
            if (!m.Jugador || !m.Torneo) return false;
            if (m.Jugador === "Jugador") return false; // Ignorar header repetido
            
            // Filtro anti-basura (por si acaso)
            if (!isNaN(parseFloat(m.Jugador)) && m.Jugador.length < 4) return false;
            
            return true; 
        });

        console.log(`Partidos cargados: ${mappedMatches.length}`);
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