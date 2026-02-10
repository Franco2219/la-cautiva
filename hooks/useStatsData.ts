import { useState, useCallback } from "react";
import { ID_DATOS_GENERALES } from "@/lib/constants";
import { parseCSV } from "@/lib/utils";

export interface ChampionRecord {
  year: string;
  tournament: string;
  category: string;
  champion: string;
  runnerUp: string;
  winCount?: number; 
}

// Nueva interfaz para los partidos de DB_Master
export interface MatchRecord {
  Torneo: string;
  Categoria: string;
  Fase: string;
  Jugador: string;
  Rival: string;
  Resultado: string;
  Fecha: string;
  // Alias en minúscula por compatibilidad
  tournament: string;
  category: string;
  round: string;
  winner: string; // Usaremos Jugador como winner genérico para compatibilidad
  loser: string;  // Usaremos Rival como loser genérico
  date: string;
}

export const useStatsData = () => {
  const [historyData, setHistoryData] = useState<ChampionRecord[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>([]); // <--- ESTADO NUEVO
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // 1. TRAER HISTORIAL DE CAMPEONES
  const fetchChampionHistory = useCallback(async () => {
    setIsLoadingStats(true);
    const url = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent("Historial Campeones")}`;

    try {
      const response = await fetch(url);
      const csvText = await response.text();
      const rows = parseCSV(csvText);

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

  // 2. TRAER PARTIDOS DE DB_MASTER (NUEVA FUNCIÓN)
  const fetchMatches = useCallback(async () => {
    setIsLoadingStats(true);
    // Conectamos con la hoja "DB_Master"
    const url = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=DB_Master`;

    try {
        const response = await fetch(url);
        const csvText = await response.text();
        const rows = parseCSV(csvText);

        // Mapeamos las columnas segun tu foto:
        // A=Torneo, B=Categoria, C=Fase, D=Jugador, E=Rival, F=Resultado, G=Fecha
        const mappedMatches = rows.slice(1).map(row => ({
            Torneo: row[0] || "",
            Categoria: row[1] || "",
            Fase: row[2] || "",
            Jugador: row[3] || "",
            Rival: row[4] || "",
            Resultado: row[5] || "",
            Fecha: row[6] || "",
            
            // Duplicamos datos en inglés/minúscula para que los componentes lo encuentren fácil
            tournament: row[0] || "",
            category: row[1] || "",
            round: row[2] || "",
            winner: row[3] || "", // Asumimos Jugador en col D
            loser: row[4] || "",  // Asumimos Rival en col E
            score: row[5] || "",
            date: row[6] || ""
        })).filter(m => m.Jugador && m.Torneo); // Filtramos filas vacías

        setMatches(mappedMatches);
    } catch (error) {
        console.error("Error fetching matches:", error);
    } finally {
        setIsLoadingStats(false);
    }
  }, []);

  return {
    historyData,
    matches,               // <--- EXPORTAMOS LOS PARTIDOS
    isLoadingStats,
    fetchChampionHistory,
    fetchMatches           // <--- EXPORTAMOS LA FUNCIÓN DE CARGA
  };
};