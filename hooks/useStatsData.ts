import { useState, useCallback } from "react";
import { ID_DATOS_GENERALES } from "@/lib/constants";

// CONFIGURACIÓN DEL CACHÉ
const CACHE_KEY_MATCHES = "db_master_cache_v1"; // Nombre para guardar en memoria
const CACHE_TIME = 1000 * 60 * 30; // 30 Minutos (tiempo que duran los datos sin recargar)

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
  score: string;
}

// Parser optimizado
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
      // ... procesamiento ...
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

  // 2. BUSCAR PARTIDOS (CON SISTEMA DE CACHÉ)
  const fetchMatches = useCallback(async () => {
    setIsLoadingStats(true);
    
    // A. REVISAR SI YA TENEMOS LOS DATOS GUARDADOS
    const cached = localStorage.getItem(CACHE_KEY_MATCHES);
    if (cached) {
        try {
            const { data, timestamp } = JSON.parse(cached);
            const now = Date.now();
            // Si los datos son "frescos" (menores a 30 mins), los usamos y NO descargamos nada
            if (now - timestamp < CACHE_TIME) {
                console.log("⚡ Usando datos de caché (Carga Instantánea)");
                setMatches(data);
                setIsLoadingStats(false);
                return; // Salimos de la función aquí
            }
        } catch (e) {
            console.warn("Error leyendo caché, descargando de nuevo...");
        }
    }

    // B. SI NO HAY CACHÉ O ES VIEJO, DESCARGAMOS DE GOOGLE
    const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTh4uKqSzG_egJjJH8uQ53Q2pMLgaidvIkCgR9OcLOilD7IAYq2ubjyXTw-ovOgA8cT6WAtMOKG-QQb/pub?gid=1288809117&single=true&output=csv";

    try {
        const response = await fetch(url);
        const csvText = await response.text();
        const rows = robustCSVParser(csvText);

        const mappedMatches = rows.slice(1).map(row => {
            if (row.length < 4) return null;
            return {
                Torneo: row[0] || "",
                Categoria: row[1] || "",
                Fase: row[2] || "",
                Jugador: row[3] || "",
                Rival: row[4] || "",
                Resultado: row[5] || "",
                Fecha: row[6] || "",
                
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
            if (!m.Jugador || !m.Torneo) return false;
            if (m.Jugador === "Jugador") return false; 
            if (!isNaN(parseFloat(m.Jugador)) && m.Jugador.length < 4) return false;
            return true; 
        });

        console.log(`Datos descargados y guardados: ${mappedMatches.length}`);
        
        // C. GUARDAR EN CACHÉ PARA LA PRÓXIMA VEZ
        localStorage.setItem(CACHE_KEY_MATCHES, JSON.stringify({
            data: mappedMatches,
            timestamp: Date.now()
        }));

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