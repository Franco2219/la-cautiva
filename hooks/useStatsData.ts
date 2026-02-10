import { useState, useCallback } from "react";
import { ID_DATOS_GENERALES } from "@/lib/constants";

// CONFIGURACIÓN DEL CACHÉ
const CACHE_KEY_MATCHES = "db_cache_v10_local_images"; // Versión 10: Fotos Locales
const CACHE_TIME = 1000 * 60 * 30; 

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

export interface PlayerProfile {
  name: string;
  age: string;
  hand: string;
  photo: string;
}

// --- NORMALIZADOR ---
const normalizeName = (name: string) => {
    if (!name) return "";
    return name.toLowerCase().replace(/[^a-z0-9]/g, ''); 
};

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
  const [profiles, setProfiles] = useState<Record<string, PlayerProfile>>({});
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // 1. HISTORIAL CAMPEONES
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

  // 2. BUSCAR PARTIDOS Y PERFILES
  const fetchMatches = useCallback(async () => {
    setIsLoadingStats(true);
    
    // A. CARGAR PERFILES (EXCEL TORNEOS 2026)
    const profilesUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTh4uKqSzG_egJjJH8uQ53Q2pMLgaidvIkCgR9OcLOilD7IAYq2ubjyXTw-ovOgA8cT6WAtMOKG-QQb/pub?gid=597400315&single=true&output=csv";
    
    try {
        const pResponse = await fetch(profilesUrl);
        if (pResponse.ok) {
            const pText = await pResponse.text();
            const pRows = robustCSVParser(pText);
            const profilesMap: Record<string, PlayerProfile> = {};
            
            pRows.slice(1).forEach(row => {
                // A: Jugador, B: Edad, C: Mano, D: Foto (Nombre del archivo)
                if (row[0]) {
                    const nameKey = normalizeName(row[0]); 
                    
                    // LÓGICA INTELIGENTE DE FOTO:
                    // Si la celda D tiene texto, le agregamos la ruta "/jugadores/"
                    // Si empieza con "http", respetamos el link externo (por si acaso dejaste alguno viejo)
                    let photoPath = "";
                    const rawPhoto = row[3] ? row[3].trim() : "";
                    
                    if (rawPhoto) {
                        if (rawPhoto.startsWith("http")) {
                            photoPath = rawPhoto; // Es un link de internet
                        } else {
                            photoPath = `/jugadores/${rawPhoto}`; // Es un archivo local
                        }
                    }

                    profilesMap[nameKey] = {
                        name: row[0],
                        age: row[1] || "-",
                        hand: row[2] || "Diestro", 
                        photo: photoPath
                    };
                }
            });
            console.log("✅ Perfiles cargados:", Object.keys(profilesMap).length);
            setProfiles(profilesMap);
        } else {
            console.error("❌ Error descargando perfiles. Status:", pResponse.status);
        }
    } catch (e) {
        console.error("❌ Excepción cargando Perfiles:", e);
    }

    // B. REVISAR CACHÉ DE PARTIDOS
    const cached = localStorage.getItem(CACHE_KEY_MATCHES);
    if (cached) {
        try {
            const { data, timestamp } = JSON.parse(cached);
            const now = Date.now();
            if (now - timestamp < CACHE_TIME) {
                console.log("⚡ Usando datos de caché (Partidos)");
                setMatches(data);
                setIsLoadingStats(false);
                return; 
            }
        } catch (e) { console.warn("Cache error"); }
    }

    // C. DESCARGAR PARTIDOS
    const matchesUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTh4uKqSzG_egJjJH8uQ53Q2pMLgaidvIkCgR9OcLOilD7IAYq2ubjyXTw-ovOgA8cT6WAtMOKG-QQb/pub?gid=1288809117&single=true&output=csv";

    try {
        const response = await fetch(matchesUrl);
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
    profiles,
    isLoadingStats,
    fetchChampionHistory,
    fetchMatches
  };
};