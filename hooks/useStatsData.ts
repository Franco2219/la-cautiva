import { useState, useCallback } from "react";
import { ID_DATOS_GENERALES, tournaments } from "@/lib/constants";

// CONFIGURACIÓN DEL CACHÉ
const CACHE_KEY_MATCHES = "db_cache_v10_local_images"; // Versión 10: Fotos Locales
const CACHE_TIME = 1000 * 60 * 30; 

// --- PUNTO 2: REGLA DE PRIORIDAD DE MEJOR ACTUACIÓN ---
// Esta escala asegura que 16avos (3) sea mayor que Grupos (0)
export const performance_map: Record<string, number> = {
  "Campeon": 8,
  "Final": 7,
  "Semifinal": 6,
  "Cuartos": 5,
  "Octavos": 4,
  "16avos": 3,
  "32avos": 2,
  "64avos": 1,
  "Grupos": 0,
};

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

// --- CALCULADOR DE EDAD AUTOMÁTICO ---
const calculateAge = (birthdayStr: string): string => {
    if (!birthdayStr || birthdayStr === "-" || birthdayStr.trim() === "") return "-";
    if (!isNaN(Number(birthdayStr)) && birthdayStr.trim().length <= 2) return birthdayStr;

    try {
        let birthDate: Date;
        if (birthdayStr.includes("/")) {
            const parts = birthdayStr.split("/");
            if (parts.length === 3) {
                birthDate = new Date(parseInt(parts), parseInt(parts) - 1, parseInt(parts));
            } else {
                return birthdayStr;
            }
        } else {
            birthDate = new Date(birthdayStr);
        }

        if (isNaN(birthDate.getTime())) return birthdayStr;

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age.toString();
    } catch (e) {
        return birthdayStr;
    }
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

  const fetchChampionHistory = useCallback(async () => {
    setIsLoadingStats(true);
    const url = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent("Historial Campeones")}`;
    try {
      const response = await fetch(url);
      const csvText = await response.text();
      const rows = robustCSVParser(csvText);
      const rawData = rows.slice(1).map(row => ({
        year: row || "",
        tournament: row || "",
        category: row || "",
        champion: row || "",
        runnerUp: row || ""
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

  const fetchMatches = useCallback(async () => {
    setIsLoadingStats(true);
    
    const profilesUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTh4uKqSzG_egJjJH8uQ53Q2pMLgaidvIkCgR9OcLOilD7IAYq2ubjyXTw-ovOgA8cT6WAtMOKG-QQb/pub?gid=597400315&single=true&output=csv";
    
    try {
        const pResponse = await fetch(profilesUrl);
        if (pResponse.ok) {
            const pText = await pResponse.text();
            const pRows = robustCSVParser(pText);
            const profilesMap: Record<string, PlayerProfile> = {};
            
            pRows.slice(1).forEach(row => {
                if (row) {
                    const nameKey = normalizeName(row); 
                    let photoPath = "";
                    const rawPhoto = row ? row.trim() : "";
                    
                    if (rawPhoto) {
                        if (rawPhoto.startsWith("http")) {
                            photoPath = rawPhoto;
                        } else {
                            photoPath = `/jugadores/${rawPhoto}`;
                        }
                    }

                    profilesMap[nameKey] = {
                        name: row,
                        age: calculateAge(row || "-"), 
                        hand: row || "Diestro", 
                        photo: photoPath
                    };
                }
            });
            setProfiles(profilesMap);
        }
    } catch (e) {
        console.error("❌ Excepción cargando Perfiles:", e);
    }

    const cached = localStorage.getItem(CACHE_KEY_MATCHES);
    if (cached) {
        try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TIME) {
                setMatches(data);
                setIsLoadingStats(false);
                return; 
            }
        } catch (e) { }
    }

    const matchesUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTh4uKqSzG_egJjJH8uQ53Q2pMLgaidvIkCgR9OcLOilD7IAYq2ubjyXTw-ovOgA8cT6WAtMOKG-QQb/pub?gid=1288809117&single=true&output=csv";

    try {
        const response = await fetch(matchesUrl);
        const csvText = await response.text();
        const rows = robustCSVParser(csvText);

        const mappedMatches = rows.slice(1).map(row => {
            if (row.length < 4) return null;
            return {
                Torneo: row || "",
                Categoria: row || "",
                Fase: row || "",
                Jugador: row || "",
                Rival: row || "",
                Resultado: row || "",
                Fecha: row || "",
                tournament: row || "",
                category: row || "",
                round: row || "",
                winner: row || "",
                loser: row || "",
                score: row || "",
                date: row || ""
            };
        }).filter((m): m is MatchRecord => {
            if (!m || !m.Jugador || !m.Torneo || m.Jugador === "Jugador") return false;
            return true; 
        });

        // --- PUNTO 1: ORDEN INVERSO POR TORNEO SEGÚN CONSTANTES ---
        const tourOrder = tournaments.map(t => t.short);
        mappedMatches.sort((a, b) => {
            const indexA = tourOrder.indexOf(a.Torneo);
            const indexB = tourOrder.indexOf(b.Torneo);
            return indexB - indexA;
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