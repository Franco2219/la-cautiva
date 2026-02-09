{
    type: "file",
    fileName: "src/hooks/useStatsData.ts",
    content: `import { useState, useCallback } from "react";
    import { ID_DATOS_GENERALES } from "@/lib/constants";
    import { parseCSV } from "@/lib/utils";
    
    export interface ChampionRecord {
      year: string;
      tournament: string;
      category: string;
      champion: string;
      runnerUp: string;
      winCount?: number; // El número de título (ej: 2, 3)
    }
    
    export const useStatsData = () => {
      const [historyData, setHistoryData] = useState<ChampionRecord[]>([]);
      const [isLoadingStats, setIsLoadingStats] = useState(false);
    
      const fetchChampionHistory = useCallback(async () => {
        setIsLoadingStats(true);
        // URL a la pestaña "Historial Campeones"
        const url = \`https://docs.google.com/spreadsheets/d/\${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=\${encodeURIComponent("Historial Campeones")}\`;
    
        try {
          const response = await fetch(url);
          const csvText = await response.text();
          const rows = parseCSV(csvText);
    
          // Asumimos estructura: [0] Año, [1] Torneo, [2] Categoria, [3] Campeon, [4] Subcampeon
          // Saltamos header
          const rawData = rows.slice(1).map(row => ({
            year: row[0] || "",
            tournament: row[1] || "",
            category: row[2] || "",
            champion: row[3] || "",
            runnerUp: row[4] || ""
          })).filter(r => r.year && r.tournament && r.champion);
    
          // --- LÓGICA DE CONTEO DE TÍTULOS ---
          // 1. Ordenamos por año ASCENDENTE para contar cronológicamente
          rawData.sort((a, b) => parseInt(a.year) - parseInt(b.year));
    
          const winCounts: Record<string, number> = {};
          
          const processedData = rawData.map(record => {
            // Clave única: Torneo + Categoría + Jugador
            // Así contamos "Cuántas veces ganó Perez el US Open en la A"
            const key = \`\${record.tournament.toLowerCase()}-\${record.category.toLowerCase()}-\${record.champion.toLowerCase().trim()}\`;
            
            if (!winCounts[key]) winCounts[key] = 0;
            winCounts[key]++;
    
            return {
              ...record,
              winCount: winCounts[key]
            };
          });
    
          // 2. Ordenamos por año DESCENDENTE para mostrar (el más nuevo arriba)
          processedData.sort((a, b) => parseInt(b.year) - parseInt(a.year));
    
          setHistoryData(processedData);
    
        } catch (error) {
          console.error("Error fetching history stats:", error);
        } finally {
          setIsLoadingStats(false);
        }
      }, []);
    
      return {
        historyData,
        isLoadingStats,
        fetchChampionHistory
      };
    };`
    }