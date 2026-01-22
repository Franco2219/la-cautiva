"use client";

import { useState } from "react";
import { 
  ID_2025, ID_DATOS_GENERALES, ID_TORNEOS, MI_TELEFONO, TELEFONO_BASTI, tournaments 
} from "../lib/constants";
import { parseCSV, getTournamentName } from "../lib/utils";

export const useTournamentData = () => {
  const [navState, setNavState] = useState<any>({ level: "home" });
  const [rankingData, setRankingData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [bracketData, setBracketData] = useState<any>({ r1: [], s1: [], r2: [], s2: [], r3: [], s3: [], r4: [], s4: [], r5: [], s5: [], winner: "", runnerUp: "", bracketSize: 16, hasData: false, canGenerate: false, seeds: {} });
  const [groupData, setGroupData] = useState<any[]>([]);
  const [isSorteoConfirmado, setIsSorteoConfirmado] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedBracket, setGeneratedBracket] = useState<any[]>([]);
  const [isFixedData, setIsFixedData] = useState(false);
  const [footerClicks, setFooterClicks] = useState(0);
  const [showRankingCalc, setShowRankingCalc] = useState(false);
  const [calculatedRanking, setCalculatedRanking] = useState<any[]>([]);
  
  // --- NUEVO: ESTADOS PARA INSCRIPTOS ---
  const [inscriptosList, setInscriptosList] = useState<string[]>([]);
  const [showInscriptosModal, setShowInscriptosModal] = useState(false);

  // --- LÓGICA DE RANKING ---
  const fetchRankingData = async (categoryShort: string, year: string) => {
    setIsLoading(true); setRankingData([]); setHeaders([]);
    const sheetId = year === "2025" ? ID_2025 : ID_DATOS_GENERALES;
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(`${categoryShort} ${year}`)}`;
    try {
      const response = await fetch(url);
      const csvText = await response.text();
      const rows = parseCSV(csvText);
      if (rows.length > 0) {
        setHeaders(year === "2025" ? rows[0].slice(2, 9) : rows[0].slice(2, 11));
        setRankingData(rows.slice(1).map(row => ({
          name: row[1],
          points: year === "2025" ? row.slice(2, 9) : row.slice(2, 11),
          total: year === "2025" ? (parseInt(row[9]) || 0) : (parseInt(row[11]) || 0)
        })).filter(p => p.name).sort((a, b) => b.total - a.total));
      }
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  }

  // --- NUEVO: LÓGICA PARA TRAER INSCRIPTOS ---
  const fetchInscriptos = async (category: string, tournamentShort: string) => {
    setIsLoading(true);
    setInscriptosList([]);
    // Usamos ID_DATOS_GENERALES que es donde está el Excel "Cautiva Ranking e Inscriptos 2026"
    const url = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent("Boton Inscriptos")}`;
    
    try {
        const response = await fetch(url);
        const csvText = await response.text();
        const rows = parseCSV(csvText);
        
        // Asumimos estructura: Col 0 = Torneo, Col 1 = Categoria, Col 2 = Jugador
        // Filtramos por torneo y categoría actual
        const filteredPlayers = rows.slice(1) // Ignoramos header
            .filter(row => 
                row[0] && row[0].trim().toLowerCase() === tournamentShort.toLowerCase() && 
                row[1] && row[1].trim().toLowerCase() === category.toLowerCase()
            )
            .map(row => row[2]); // Nos quedamos con el nombre del jugador

        if (filteredPlayers.length > 0) {
            setInscriptosList(filteredPlayers);
            setShowInscriptosModal(true);
        } else {
            alert("No hay inscriptos cargados para este torneo y categoría todavía.");
        }

    } catch (error) {
        console.error("Error trayendo inscriptos:", error);
        alert("Error al cargar inscriptos.");
    } finally {
        setIsLoading(false);
    }
  };

  // --- LÓGICA DEL CUADRO DE ELIMINACIÓN ---
  const generatePlayoffBracket = (qualifiers: any[]) => {
      const totalPlayers = qualifiers.length;
      let bracketSize = 4;
      if (totalPlayers > 32) bracketSize = 64;
      else if (totalPlayers > 16) bracketSize = 32; 
      else if (totalPlayers > 8) bracketSize = 16; 
      else if (totalPlayers > 4) bracketSize = 8; 

      const numMatches = bracketSize / 2;
      const halfMatches = numMatches / 2;
      const byeCount = bracketSize - totalPlayers;

      const winners = qualifiers.filter(q => q.rank === 1).sort((a, b) => a.groupIndex - b.groupIndex); 
      const runners = qualifiers.filter(q => q.rank === 2).sort(() => Math.random() - 0.5); 

      // Prioridad Byes
      const playersWithBye = new Set();
      const priorityByes = Math.min(winners.length, byeCount);
      for(let i=0; i < priorityByes; i++) {
          if(winners[i]) playersWithBye.add(winners[i].name);
      }
      if (byeCount > priorityByes) {
          for(let i=0; i < (byeCount - priorityByes); i++) {
              if(runners[i]) playersWithBye.add(runners[i].name);
          }
      }

      let matches: any[] = Array(numMatches).fill(null).map(() => ({ p1: null, p2: null }));
      
      // 1. SEEDS FIJOS
      const wZ1 = winners.find(w => w.groupIndex === 0);
      const wZ2 = winners.find(w => w.groupIndex === 1);
      const wZ3 = winners.find(w => w.groupIndex === 2);
      const wZ4 = winners.find(w => w.groupIndex === 3);
      
      const idxTop = 0; 
      const idxBottom = numMatches - 1;
      const idxMidTop = halfMatches - 1; 
      const idxMidBottom = halfMatches; 

      if (wZ1) { matches[idxTop].p1 = wZ1; if(playersWithBye.has(wZ1.name)) matches[idxTop].p2 = { name: "BYE", rank: 0 }; }
      if (wZ2) { matches[idxBottom].p2 = wZ2; if(playersWithBye.has(wZ2.name)) matches[idxBottom].p1 = { name: "BYE", rank: 0 }; }
      
      const mids = [wZ3, wZ4].filter(Boolean).sort(() => Math.random() - 0.5);
      if (mids.length > 0) {
          matches[idxMidTop].p2 = mids[0];
          if(playersWithBye.has(mids[0].name)) matches[idxMidTop].p1 = { name: "BYE", rank: 0 };
      }
      if (mids.length > 1) {
          matches[idxMidBottom].p1 = mids[1];
          if(playersWithBye.has(mids[1].name)) matches[idxMidBottom].p2 = { name: "BYE", rank: 0 };
      }
      
      // Llenar el resto de ganadores
      const otherWinners = winners.filter(w => w.groupIndex > 3).sort(() => Math.random() - 0.5);
      
      if (bracketSize === 64) {
          otherWinners.forEach(w => {
             const blockCounts = Array(16).fill(0); 
             matches.forEach((m, i) => {
                 if ((m.p1 && m.p1.rank === 1) || (m.p2 && m.p2.rank === 1)) {
                     blockCounts[Math.floor(i / 2)]++;
                 }
             });
             const candidates = matches.map((m, i) => (!m.p1 && !m.p2) ? i : -1).filter(i => i !== -1);
             candidates.sort((a, b) => {
                 const countA = blockCounts[Math.floor(a / 2)];
                 const countB = blockCounts[Math.floor(b / 2)];
                 if (countA !== countB) return countA - countB;
                 return Math.random() - 0.5;
             });
             if (candidates.length > 0) {
                 const idx = candidates[0];
                 matches[idx].p1 = w;
                 if(playersWithBye.has(w.name)) matches[idx].p2 = { name: "BYE", rank: 0 };
             }
          });
      } else {
          const availableMatches = matches.map((m, i) => (!m.p1 && !m.p2) ? i : -1).filter(i => i !== -1).sort(() => Math.random() - 0.5);
          otherWinners.forEach(w => {
              if (availableMatches.length > 0) {
                  const idx = availableMatches.pop()!;
                  matches[idx].p1 = w;
                  if(playersWithBye.has(w.name)) matches[idx].p2 = { name: "BYE", rank: 0 };
              }
          });
      }

      const topMatches = matches.slice(0, halfMatches);
      const bottomMatches = matches.slice(halfMatches);
      
      const getZones = (matchList: any[]) => {
          const zones = new Set();
          matchList.forEach(m => {
              if (m.p1 && m.p1.groupIndex !== undefined) zones.add(m.p1.groupIndex);
              if (m.p2 && m.p2.groupIndex !== undefined) zones.add(m.p2.groupIndex);
          });
          return zones;
      };

      const zonesInTop = getZones(topMatches);
      const zonesInBottom = getZones(bottomMatches);
      
      const mustGoBottom = runners.filter(r => zonesInTop.has(r.groupIndex));
      const mustGoTop = runners.filter(r => zonesInBottom.has(r.groupIndex));
      const freeAgents = runners.filter(r => !zonesInTop.has(r.groupIndex) && !zonesInBottom.has(r.groupIndex));
      
      let poolTop = [...mustGoTop];
      let poolBottom = [...mustGoBottom];
      let poolFree = [...freeAgents];

      const countReal = (matchList: any[]) => matchList.reduce((acc, m) => acc + (m.p1?.name !== "BYE" && m.p1 ? 1 : 0) + (m.p2?.name !== "BYE" && m.p2 ? 1 : 0), 0);
      let loadTop = countReal(topMatches) + poolTop.length;
      let loadBot = countReal(bottomMatches) + poolBottom.length;

      while (poolFree.length > 0) {
         if (loadTop <= loadBot) { poolTop.push(poolFree.pop()); loadTop++; }
         else { poolBottom.push(poolFree.pop()); loadBot++; }
      }
      
      const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5);
      poolTop = shuffle(poolTop); poolBottom = shuffle(poolBottom);

      const fillHalfRandomly = (matchList: any[], pool: any[]) => {
          let indices = Array.from({length: matchList.length}, (_, i) => i).sort(() => Math.random() - 0.5);
          for(let i of indices) {
              if(!matchList[i].p1 && !matchList[i].p2 && pool.length > 0) matchList[i].p1 = pool.pop();
          }
          for(let i of indices) {
              if(matchList[i].p1 && !matchList[i].p2 && matchList[i].p1.name !== "BYE" && pool.length > 0) matchList[i].p2 = pool.pop();
              else if(!matchList[i].p1 && matchList[i].p2 && matchList[i].p2.name !== "BYE" && pool.length > 0) matchList[i].p1 = pool.pop();
          }
          for(let i of indices) {
              if(pool.length === 0) return;
              if(!matchList[i].p1) matchList[i].p1 = pool.pop();
              else if(!matchList[i].p2) matchList[i].p2 = pool.pop();
          }
      };

      fillHalfRandomly(topMatches, poolTop);
      fillHalfRandomly(bottomMatches, poolBottom);

      matches.forEach(m => {
          if (!m.p1) m.p1 = { name: "BYE", rank: 0, groupIndex: -1 };
          if (!m.p2) m.p2 = { name: "BYE", rank: 0, groupIndex: -1 };
          
          const isFixedP2 = (m.p2.rank === 1 || m.p2.rank === 2 || m.p2.rank === 3 || m.p2.rank === 4);
          if (!isFixedP2 && m.p1.name === "BYE" && m.p2.name !== "BYE") {
              const temp = m.p1; m.p1 = m.p2; m.p2 = temp;
          }
      });

      return { matches, bracketSize };
  }

  // --- ACCIONES PÚBLICAS ---
  const enviarListaBasti = () => {
    let mensaje = `*PARTIDOS - ${getTournamentName(navState.tournamentShort || navState.currentTour)}*\n\n`;
    if (generatedBracket.length > 0) {
         generatedBracket.forEach(m => {
             if (m.p1 && m.p2 && m.p1.name !== "BYE" && m.p2.name !== "BYE") {
                 mensaje += `${m.p1.name} vs ${m.p2.name}\n`;
             }
         });
    } else if (navState.level === "group-phase") {
        groupData.forEach(group => {
            const players = group.players;
            for (let i = 0; i < players.length; i++) {
                for (let j = i + 1; j < players.length; j++) {
                    const res = group.results[i] && group.results[i][j] ? group.results[i][j] : "-";
                    if (!res || res === "-" || res === "") {
                        mensaje += `${players[i]} vs ${players[j]}\n`;
                    }
                }
            }
        });
    }
    window.open(`https://wa.me/${TELEFONO_BASTI}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const confirmarYEnviar = async () => {
    setIsLoading(true);
    let mensaje = `*SORTEO CONFIRMADO - ${navState.currentTour}*\n*Categoría:* ${navState.currentCat}\n\n`;
    
    let rankMap: any = {};
    try {
       const rankUrl = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(`${navState.currentCat} 2026`)}`;
       const res = await fetch(rankUrl);
       const txt = await res.text();
       const rows = parseCSV(txt);
       
       const headers = rows[0];
       let totalIdx = headers.findIndex(h => h && h.toUpperCase().trim() === "TOTAL");
       if (totalIdx === -1) totalIdx = 11;

       const rankingRows = rows.slice(1).map(r => ({ name: r[1], total: (r[totalIdx] ? parseInt(r[totalIdx]) : 0) }));
       rankingRows.sort((a,b) => b.total - a.total);
       
       rankingRows.forEach((p, i) => {
           if (p.name && i < 8) {
               rankMap[p.name.trim().toLowerCase()] = i + 1;
           }
       });
    } catch(e) { console.log("Error ranking confirm", e); }

    groupData.forEach(g => { 
        mensaje += `${g.groupName}\n`;
        g.players.forEach((p: string) => {
            const cleanP = p.replace(/\(\d+\)\s+/, "").trim(); 
            const rank = rankMap[cleanP.toLowerCase()];
            if (rank) {
                mensaje += `(${rank}) ${cleanP}\n`;
            } else {
                mensaje += `${cleanP}\n`;
            }
        });
        mensaje += `\n`;
    });
    
    window.open(`https://wa.me/${MI_TELEFONO}?text=${encodeURIComponent(mensaje)}`, '_blank');
    setIsSorteoConfirmado(true);
    setIsLoading(false);
  };

  const calculateAndShowRanking = async () => {
    setIsLoading(true);
    try {
        const urlBaremo = `https://docs.google.com/spreadsheets/d/${ID_TORNEOS}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent("Formatos Grupos")}&range=A37:Z50`;
        const res = await fetch(urlBaremo);
        const txt = await res.text();
        const rows = parseCSV(txt);
        const catName = navState.category || navState.selectedCategory;
        const rankUrl = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(`${catName} 2026`)}`;
        const rankRes = await fetch(rankUrl);
        const rankCsv = await rankRes.text();
        const rankNames = parseCSV(rankCsv).slice(1).map(row => row[1] ? row[1].trim().toLowerCase() : "");
        const getRankIndex = (name: string) => {
            if (!name) return 99999;
            const n = name.toLowerCase().trim();
            let idx = rankNames.indexOf(n);
            if (idx !== -1) return idx;
            const parts = n.replace(/,/g, "").split(" ").filter(p => p.length > 2); 
            if (parts.length > 0) idx = rankNames.findIndex(rankName => rankName.includes(parts[0]));
            return idx === -1 ? 99999 : idx;
        };
        const headerRow = rows[0]; 
        const currentTourShort = navState.tournamentShort ? navState.tournamentShort.trim().toLowerCase() : "";
        const tourType = tournaments.find(t => t.short === navState.tournamentShort)?.type || "direct";
        let colIndex = -1;
        for(let i=0; i<headerRow.length; i++) { if (headerRow[i] && headerRow[i].trim().toLowerCase() === currentTourShort) { colIndex = i; break; } }
        if (colIndex === -1) { for(let i=0; i<headerRow.length; i++) { if (headerRow[i] && headerRow[i].trim().toLowerCase().includes(currentTourShort)) { colIndex = i; break; } } }
        if (colIndex === -1) { alert("Error puntos"); setIsLoading(false); return; }
        const getPoints = (rowIndex: number) => { if (!rows[rowIndex] || !rows[rowIndex][colIndex]) return 0; const val = parseInt(rows[rowIndex][colIndex]); return isNaN(val) ? 0 : val; };
        const pts = { champion: getPoints(1), finalist: getPoints(2), semi: getPoints(3), quarters: getPoints(4), octavos: getPoints(5), dieciseis: getPoints(6), groupWin1: getPoints(7), groupWin2: getPoints(8), groupWin3: getPoints(9) };
        const playerScores: any = {};
        const addRoundScore = (name: string, score: number) => { if (!name || name === "BYE" || name === "") return; const cleanName = name.trim(); if (!playerScores[cleanName] || score > playerScores[cleanName]) { playerScores[cleanName] = score; } };
        if (bracketData.hasData) {
            const { r1, r2, r3, r4, r5, winner, bracketSize } = bracketData;
            let semis: string[] = [], cuartos: string[] = [], octavos: string[] = [], dieciseis: string[] = [];
            let finalists: string[] = [];
            if (bracketSize === 32) { semis = r4; cuartos = r3; octavos = r2; dieciseis = r1; finalists = r5 || []; } 
            else if (bracketSize === 16) { semis = r3; cuartos = r2; octavos = r1; finalists = r4 || []; } 
            else { semis = r2; cuartos = r1; finalists = r3 || []; }
            if (bracketSize === 32) dieciseis.forEach((p: string) => addRoundScore(p, pts.dieciseis));
            if (bracketSize >= 16) octavos.forEach((p: string) => addRoundScore(p, pts.octavos));
            cuartos.forEach((p: string) => addRoundScore(p, pts.quarters));
            semis.forEach((p: string) => addRoundScore(p, pts.semi));
            const winnerName = winner ? winner.trim().toLowerCase() : "";
            finalists.forEach((p: string) => { if (p && p !== "BYE" && p !== "") { const pClean = p.trim(); if (winnerName && pClean.toLowerCase() === winnerName) addRoundScore(pClean, pts.champion); else addRoundScore(pClean, pts.finalist); } });
        }
        if (tourType === "full") {
            const groupUrl = `https://docs.google.com/spreadsheets/d/${ID_TORNEOS}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(`Grupos ${navState.tournamentShort} ${navState.category}`)}`;
            try {
                const groupRes = await fetch(groupUrl);
                const groupTxt = await groupRes.text();
                const groupRows = parseCSV(groupTxt);
                const playerWins: any = {};
                for (let i = 0; i < groupRows.length; i += 4) {
                    if (groupRows[i] && groupRows[i][0] && (groupRows[i][0].includes("Zona") || groupRows[i][0].includes("Grupo"))) {
                        const players = [groupRows[i+1]?.[0], groupRows[i+2]?.[0], groupRows[i+3]?.[0], groupRows[i+4]?.[0]].filter(p => p && p !== "-" && p !== "");
                        for(let x=0; x<players.length; x++) {
                            const pName = players[x].trim(); if (!playerWins[pName]) playerWins[pName] = 0; const rowIndex = i + 1 + x;
                            if (groupRows[rowIndex]) { for(let y=1; y<=players.length; y++) { const res = groupRows[rowIndex][y]; if(res && res.length > 2) { const sets = res.trim().split(" "); let sW = 0, sL = 0; sets.forEach(s => { if(s.includes("/")) { const parts = s.split("/").map(Number); if(parts[0] > parts[1]) sW++; else sL++; } }); if(sW > sL) playerWins[pName]++; } } }
                        }
                    }
                }
                Object.keys(playerWins).forEach(pName => { const wins = playerWins[pName]; let extraPoints = 0; if (wins === 1) extraPoints = pts.groupWin1; else if (wins === 2) extraPoints = pts.groupWin2; else if (wins >= 3) extraPoints = pts.groupWin3; if (playerScores[pName]) playerScores[pName] += extraPoints; else playerScores[pName] = extraPoints; });
            } catch (err) { console.log("Error ranking full", err); }
        }
        const rankingArray = Object.keys(playerScores).map(key => ({ name: key, points: playerScores[key] })).sort((a, b) => { const rankA = getRankIndex(a.name); const rankB = getRankIndex(b.name); if (rankA === rankB) return b.points - a.points; return rankA - rankB; });
        setCalculatedRanking(rankingArray);
        setShowRankingCalc(true);
    } catch (e) { console.error(e); alert("Error calculando ranking."); } finally { setIsLoading(false); }
  };

  const handleFooterClick = () => {
      if (navState.level === "direct-bracket") {
          const newCount = footerClicks + 1;
          setFooterClicks(newCount);
          if (newCount >= 4) { calculateAndShowRanking(); setFooterClicks(0); }
      }
  };

  const runDirectDraw = async (categoryShort: string, tournamentShort: string) => {
    setIsLoading(true);
    setGeneratedBracket([]);
    setIsFixedData(false);
    setIsSorteoConfirmado(false);
    try {
        const rankUrl = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(`${categoryShort} 2026`)}`;
        const rankRes = await fetch(rankUrl);
        const rankCsv = await rankRes.text();
        const playersRanking = parseCSV(rankCsv).slice(1).map(row => ({ name: row[1] || "", total: row[11] ? parseInt(row[11]) : 0 })).filter(p => p.name !== "");
        const inscUrl = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=Inscriptos`;
        const inscRes = await fetch(inscUrl);
        const inscCsv = await inscRes.text();
        const filteredInscriptos = parseCSV(inscCsv).slice(1).filter(cols => cols[0] === tournamentShort && cols[1] === categoryShort).map(cols => cols[2]);
        if (filteredInscriptos.length < 4) { alert("Mínimo 4 jugadores."); setIsLoading(false); return; }
        const entryList = filteredInscriptos.map(n => { const p = playersRanking.find(pr => pr.name.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(pr.name.toLowerCase())); return { name: n, points: p ? p.total : 0 }; }).sort((a, b) => b.points - a.points);
        const totalPlayers = entryList.length;
        let bracketSize = 4; if (totalPlayers > 4) bracketSize = 8; if (totalPlayers > 8) bracketSize = 16; if (totalPlayers > 16) bracketSize = 32; if (totalPlayers > 32) bracketSize = 64;
        const byeCount = bracketSize - totalPlayers;
        let slots: any[] = Array(bracketSize).fill(null);
        let pos1 = 0; let pos2 = bracketSize - 1; let pos34 = [(bracketSize / 2) - 1, bracketSize / 2]; let pos58: number[] = [];
        if (bracketSize === 16) pos58 = [2, 5, 10, 13]; else if (bracketSize === 32) pos58 = [7, 8, 23, 24]; else if (bracketSize === 64) pos58 = [15, 16, 47, 48];
        const seeds = entryList.slice(0, 16).map((p, i) => ({ ...p, rank: i + 1 }));
        if (seeds[0]) slots[pos1] = seeds[0]; if (seeds[1]) slots[pos2] = seeds[1];
        if (seeds[2] && seeds[3]) { const group34 = [seeds[2], seeds[3]].sort(() => Math.random() - 0.5); slots[pos34[0]] = group34[0]; slots[pos34[1]] = group34[1]; } else if (seeds[2]) { slots[pos34[Math.floor(Math.random()*2)]] = seeds[2]; }
        if (seeds.length >= 8 && pos58.length === 4) { const group58 = seeds.slice(4, 8).sort(() => Math.random() - 0.5); const seedsTop = group58.slice(0, 2); const seedsBot = group58.slice(2, 4); const posTop = [pos58[0], pos58[1]].sort(() => Math.random() - 0.5); slots[posTop[0]] = seedsTop[0]; slots[posTop[1]] = seedsTop[1]; const posBot = [pos58[2], pos58[3]].sort(() => Math.random() - 0.5); slots[posBot[0]] = seedsBot[0]; slots[posBot[1]] = seedsBot[1]; }
        if (bracketSize === 64 && seeds.length >= 16) { const group9to16 = seeds.slice(8, 16).sort(() => Math.random() - 0.5); const pos9to16 = [7, 8, 23, 24, 39, 40, 55, 56].sort(() => Math.random() - 0.5); for(let i=0; i<8; i++) { if (group9to16[i]) slots[pos9to16[i]] = group9to16[i]; } }
        const getRivalIndex = (idx: number) => (idx % 2 === 0) ? idx + 1 : idx - 1;
        let byesRemaining = byeCount; const maxSeedCheck = bracketSize === 64 ? 16 : 8;
        for (let r = 1; r <= maxSeedCheck; r++) { if (byesRemaining > 0) { const seedIdx = slots.findIndex(s => s && s.rank === r); if (seedIdx !== -1) { const rivalIdx = getRivalIndex(seedIdx); if (slots[rivalIdx] === null) { slots[rivalIdx] = { name: "BYE", rank: 0 }; byesRemaining--; } } } }
        let emptyPairsIndices = []; for (let i = 0; i < bracketSize; i += 2) { if (slots[i] === null && slots[i+1] === null) emptyPairsIndices.push(i); }
        let topPairs = emptyPairsIndices.filter(i => i < bracketSize / 2); let botPairs = emptyPairsIndices.filter(i => i >= bracketSize / 2);
        const popBalancedPair = () => { if (topPairs.length > 0 && (botPairs.length === 0 || Math.random() > 0.5)) { const randIdx = Math.floor(Math.random() * topPairs.length); return topPairs.splice(randIdx, 1)[0]; } else if (botPairs.length > 0) { const randIdx = Math.floor(Math.random() * botPairs.length); return botPairs.splice(randIdx, 1)[0]; } return -1; };
        while (byesRemaining > 0) { const pairIdx = popBalancedPair(); if (pairIdx !== -1) { const slotOffset = Math.random() > 0.5 ? 0 : 1; slots[pairIdx + slotOffset] = { name: "BYE", rank: 0 }; byesRemaining--; } else { break; } }
        const nonSeedsStartIndex = bracketSize === 64 ? 16 : 8; const nonSeeds = entryList.slice(nonSeedsStartIndex).map(p => ({ ...p, rank: 0 })); nonSeeds.sort(() => Math.random() - 0.5); 
        let countRealTop = slots.slice(0, bracketSize/2).filter(x => x && x.name !== "BYE").length; let countRealBot = slots.slice(bracketSize/2).filter(x => x && x.name !== "BYE").length; let emptySlots = slots.map((s, i) => s === null ? i : -1).filter(i => i !== -1);
        for (const player of nonSeeds) { const emptyTop = emptySlots.filter(i => i < bracketSize/2); const emptyBot = emptySlots.filter(i => i >= bracketSize/2); let targetIdx = -1; if (countRealTop < countRealBot && emptyTop.length > 0) { targetIdx = emptyTop[Math.floor(Math.random() * emptyTop.length)]; } else if (countRealBot < countRealTop && emptyBot.length > 0) { targetIdx = emptyBot[Math.floor(Math.random() * emptyBot.length)]; } else { if (emptyTop.length > 0 && emptyBot.length > 0) { targetIdx = Math.random() > 0.5 ? emptyTop[Math.floor(Math.random() * emptyTop.length)] : emptyBot[Math.floor(Math.random() * emptyBot.length)]; } else if (emptyTop.length > 0) { targetIdx = emptyTop[Math.floor(Math.random() * emptyTop.length)]; } else if (emptyBot.length > 0) { targetIdx = emptyBot[Math.floor(Math.random() * emptyBot.length)]; } } if (targetIdx !== -1) { slots[targetIdx] = player; if (targetIdx < bracketSize/2) countRealTop++; else countRealBot++; emptySlots = emptySlots.filter(i => i !== targetIdx); } }
        for (let i = 0; i < slots.length; i++) { if (slots[i] === null) slots[i] = { name: "BYE", rank: 0 }; }
        
        let matches = []; 
        for (let i = 0; i < bracketSize; i += 2) { 
            let p1 = slots[i]; 
            let p2 = slots[i+1]; 
            matches.push({ p1, p2 }); 
        }
        setGeneratedBracket(matches); setNavState({ ...navState, level: "generate-bracket", category: categoryShort, tournamentShort: tournamentShort, bracketSize: bracketSize });
    } catch (e) { alert("Error al generar sorteo directo."); } finally { setIsLoading(false); }
  }

  const runATPDraw = async (categoryShort: string, tournamentShort: string) => {
    setIsLoading(true); setIsSorteoConfirmado(false); setIsFixedData(false);
    try {
      const rankUrl = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(`${categoryShort} 2026`)}`;
      const rankRes = await fetch(rankUrl); const rankCsv = await rankRes.text();
      
      const rawRows = parseCSV(rankCsv);
      if (!rawRows || rawRows.length === 0) throw new Error("CSV vacío");
      
      const headerRow = rawRows[0];
      let totalIndex = headerRow.findIndex(h => h && h.toUpperCase().trim() === "TOTAL");
      if (totalIndex === -1) totalIndex = 11;

      const playersRanking = rawRows.slice(1).map(row => ({ 
          name: row[1] || "", 
          total: row[totalIndex] ? parseInt(row[totalIndex]) : 0 
      })).filter(p => p.name !== "");

      const inscUrl = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=Inscriptos`;
      const inscRes = await fetch(inscUrl); const inscCsv = await inscRes.text();
      const filteredInscriptos = parseCSV(inscCsv).slice(1).filter(cols => cols[0] === tournamentShort && cols[1] === categoryShort).map(cols => cols[2]);
      if (filteredInscriptos.length === 0) { alert("No hay inscriptos."); setIsLoading(false); return; }
      
      const entryList = filteredInscriptos.map(n => { 
          const p = playersRanking.find(pr => pr.name.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(pr.name.toLowerCase())); 
          return { name: n, points: p ? p.total : 0 }; 
      }).sort((a, b) => b.points - a.points); 

      const totalPlayers = entryList.length; if (totalPlayers < 2) { alert("Mínimo 2 jugadores."); setIsLoading(false); return; }
      let groupsOf4 = 0; let groupsOf3 = 0; let groupsOf2 = 0; let capacities = [];
      if (tournamentShort === "Masters") { groupsOf4 = Math.floor(totalPlayers / 4); const remainder = totalPlayers % 4; for(let i=0; i<groupsOf4; i++) capacities.push(4); if (remainder === 3) capacities.push(3); else if (remainder === 2) capacities.push(2); else if (remainder === 1) { if (capacities.length > 0) capacities[capacities.length - 1] += 1; else capacities.push(1); } } else { const remainder = totalPlayers % 3; if (remainder === 0) { groupsOf3 = totalPlayers / 3; } else if (remainder === 1) { groupsOf2 = 2; groupsOf3 = (totalPlayers - 4) / 3; } else if (remainder === 2) { groupsOf2 = 1; groupsOf3 = (totalPlayers - 2) / 3; } for(let i=0; i<groupsOf3; i++) capacities.push(3); for(let i=0; i<groupsOf2; i++) capacities.push(2); }
      capacities = capacities.sort((a, b) => b - a); const numGroups = capacities.length;
      let groups = capacities.map((cap, i) => ({ groupName: `Zona ${i + 1}`, capacity: cap, players: [], results: [["-","-","-"], ["-","-","-"], ["-","-","-"], ["-","-","-"]], positions: ["-", "-", "-", "-"], points: ["", "", "", ""], diff: ["", "", "", ""] }));
      
      for (let i = 0; i < numGroups; i++) { 
          if (entryList[i]) {
              let pName = entryList[i].name;
              if (i < 8) {
                  pName = `(${i + 1}) ${pName}`;
              }
              groups[i].players.push(pName);
          }
      }
      
      const restOfPlayers = entryList.slice(numGroups).sort(() => Math.random() - 0.5);
      let pIdx = 0; for (let g = 0; g < numGroups; g++) { while (groups[g].players.length < groups[g].capacity && pIdx < restOfPlayers.length) { groups[g].players.push(restOfPlayers[pIdx].name); pIdx++; } }
      setGroupData(groups); setNavState({ ...navState, level: "group-phase", currentCat: categoryShort, currentTour: tournamentShort });
    } catch (e) { alert("Error al procesar el sorteo."); } finally { setIsLoading(false); }
  }

  const fetchGroupPhase = async (categoryShort: string, tournamentShort: string) => {
    setIsLoading(true); setGroupData([]); setIsSorteoConfirmado(false); setIsFixedData(false);
    try {
      const sheetName = `Grupos ${tournamentShort} ${categoryShort}`; const url = `https://docs.google.com/spreadsheets/d/${ID_TORNEOS}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
      const res = await fetch(url); const csvText = await res.text();
      if (res.ok && !csvText.includes("<!DOCTYPE html>") && (csvText.includes("Zona") || csvText.includes("Grupo"))) {
        const rows = parseCSV(csvText); const parsedGroups = [];
        for (let i = 0; i < rows.length; i++) {
          if (rows[i] && rows[i][0] && (rows[i][0].includes("Zona") || rows[i][0].includes("Grupo"))) {
            const potentialP4 = rows[i+4] && rows[i+4][0]; const isNextHeader = potentialP4 && typeof potentialP4 === 'string' && (potentialP4.toLowerCase().includes("zona") || potentialP4.toLowerCase().includes("grupo") || potentialP4.includes("*")); const p4 = !isNextHeader && potentialP4 && potentialP4 !== "-" ? rows[i+4] : null; const playersRaw = [rows[i+1], rows[i+2], rows[i+3]]; if (p4) playersRaw.push(p4);
            const validPlayersIndices: number[] = []; const players: string[] = []; const positions: string[] = []; const points: string[] = []; const diff: string[] = []; const gamesDiff: string[] = []; 
            playersRaw.forEach((row, index) => { 
                const pName = row && row[0] ? row[0] : ""; 
                if (pName && pName !== "-" && pName !== "" && !pName.toLowerCase().includes("zona") && !pName.toLowerCase().includes("grupo") && !pName.includes("*")) { players.push(pName); let rawPos = row[4] || ""; if (rawPos.startsWith("#")) rawPos = "-"; positions.push(rawPos); let rawPts = row[5] || ""; if (rawPts.startsWith("#")) rawPts = ""; points.push(rawPts); let rawDif = row[6] || ""; if (rawDif.startsWith("#")) rawDif = ""; diff.push(rawDif); let rawGames = row[7] || ""; if (rawGames.startsWith("#")) rawGames = ""; gamesDiff.push(rawGames); validPlayersIndices.push(index); } 
            });
            const results: string[][] = []; for (let x = 0; x < validPlayersIndices.length; x++) { const rowResults: string[] = []; const rowIndex = validPlayersIndices[x]; for (let y = 0; y < validPlayersIndices.length; y++) { const colIndex = validPlayersIndices[y]; const res = rows[i + 1 + rowIndex][1 + colIndex]; rowResults.push(res); } results.push(rowResults); }
            parsedGroups.push({ groupName: rows[i][0], players: players, results: results, positions: positions, points: points, diff: diff, gamesDiff: gamesDiff });
          }
        }
        if (parsedGroups.length > 0) { setGroupData(parsedGroups); setIsSorteoConfirmado(true); setIsFixedData(true); setNavState({ ...navState, level: "tournament-phases", currentCat: categoryShort, currentTour: tournamentShort, hasGroups: true }); } else { setNavState({ ...navState, level: "tournament-phases", currentCat: categoryShort, currentTour: tournamentShort, hasGroups: false }); }
      } else { setNavState({ ...navState, level: "tournament-phases", currentCat: categoryShort, currentTour: tournamentShort, hasGroups: false }); }
    } catch (e) { setNavState({ ...navState, level: "tournament-phases", currentCat: categoryShort, currentTour: tournamentShort, hasGroups: false }); } finally { setIsLoading(false); }
  }

  const fetchQualifiersAndDraw = async (category: string, tournamentShort: string) => {
      setIsLoading(true); setGeneratedBracket([]); setIsSorteoConfirmado(false);
      const sheetName = `Grupos ${tournamentShort} ${category}`; const url = `https://docs.google.com/spreadsheets/d/${ID_TORNEOS}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
      try {
          const response = await fetch(url); const csvText = await response.text(); const rows = parseCSV(csvText); let qualifiers = [];
          for(let i = 0; i < 50; i++) { if (rows[i]) { const winnerName = rows[i][12]; const runnerName = rows[i][13]; if (winnerName && winnerName !== "-" && winnerName !== "" && !winnerName.toLowerCase().includes("1ro")) { qualifiers.push({ name: winnerName, rank: 1, groupIndex: i }); } if (runnerName && runnerName !== "-" && runnerName !== "" && !runnerName.toLowerCase().includes("2do")) { qualifiers.push({ name: runnerName, rank: 2, groupIndex: i }); } } }
          if (qualifiers.length >= 3) { const result = generatePlayoffBracket(qualifiers); if (result) { setGeneratedBracket(result.matches); setNavState({ ...navState, level: "generate-bracket", category, tournamentShort, bracketSize: result.bracketSize }); } } else { alert("No se encontraron clasificados para sortear"); }
      } catch (e) { console.error(e); alert("Error leyendo los clasificados."); } finally { setIsLoading(false); }
  }

  const confirmarSorteoCuadro = () => {
    if (generatedBracket.length === 0) return;
    const isDirect = tournaments.find(t => t.short === navState.tournamentShort)?.type === "direct";
    let mensaje = `*SORTEO CUADRO FINAL - ${navState.tournamentShort}*\n*Categoría:* ${navState.category}\n\n`;
    generatedBracket.forEach((match) => { 
        const p1 = match.p1;
        const p2 = match.p2;
        let p1Name = "TBD";
        if (p1) { p1Name = (isDirect && p1.rank) ? `(${p1.rank}) ${p1.name}` : p1.name; }
        let p2Name = "TBD";
        if (p2) { p2Name = (isDirect && p2.rank) ? `(${p2.rank}) ${p2.name}` : p2.name; }
        mensaje += `${p1Name}\n${p2Name}\n`; 
    });
    window.open(`https://wa.me/${MI_TELEFONO}?text=${encodeURIComponent(mensaje)}`, '_blank');
    setIsSorteoConfirmado(true);
  }

  const fetchBracketData = async (category: string, tournamentShort: string) => {
    setIsLoading(true); setBracketData({ r1: [], s1: [], r2: [], s2: [], r3: [], s3: [], r4: [], s4: [], r5: [], s5: [], winner: "", runnerUp: "", bracketSize: 16, hasData: false, canGenerate: false, seeds: {} });
    const urlBracket = `https://docs.google.com/spreadsheets/d/${ID_TORNEOS}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(`Cuadro ${tournamentShort} ${category}`)}`;
    try {
        const res = await fetch(urlBracket); const txt = await res.text();
        if (txt.includes("<!DOCTYPE html>")) { setBracketData({ ...bracketData, hasData: false, canGenerate: true }); setIsLoading(false); return; }
        const rows = parseCSV(txt);
        let bSize = 16;
        if (rows.length > 50) bSize = 64; else if (rows.length > 25) bSize = 32; else if (rows.length > 13) bSize = 16; else bSize = 8;
        const r1 = [], s1 = [], r2 = [], s2 = [], r3 = [], s3 = [], r4 = [], s4 = [], r5 = [], s5 = [];
        let winner = "", runnerUp = "";
        
        const extract = (rowIdx: number, colIdx: number) => { if (rows[rowIdx] && rows[rowIdx][colIdx]) return rows[rowIdx][colIdx]; return ""; };
        
        if (bSize === 64) {
             for (let i=0; i<32; i++) { r1.push(extract(i*2 + 1, 1)); r1.push(extract(i*2 + 2, 1)); s1.push(extract(i*2 + 1, 2)); s1.push(extract(i*2 + 2, 2)); }
             for (let i=0; i<16; i++) { r2.push(extract(i*4 + 2, 3)); r2.push(extract(i*4 + 3, 3)); s2.push(extract(i*4 + 2, 4)); s2.push(extract(i*4 + 3, 4)); }
             for (let i=0; i<8; i++) { r3.push(extract(i*8 + 4, 5)); r3.push(extract(i*8 + 5, 5)); s3.push(extract(i*8 + 4, 6)); s3.push(extract(i*8 + 5, 6)); }
             for (let i=0; i<4; i++) { r4.push(extract(i*16 + 8, 7)); r4.push(extract(i*16 + 9, 7)); s4.push(extract(i*16 + 8, 8)); s4.push(extract(i*16 + 9, 8)); }
             for (let i=0; i<2; i++) { r5.push(extract(i*32 + 16, 9)); r5.push(extract(i*32 + 17, 9)); s5.push(extract(i*32 + 16, 10)); s5.push(extract(i*32 + 17, 10)); }
             winner = extract(32, 11); runnerUp = extract(33, 11);
        } else if (bSize === 32) {
             for (let i=0; i<16; i++) { r1.push(extract(i*2 + 1, 1)); r1.push(extract(i*2 + 2, 1)); s1.push(extract(i*2 + 1, 2)); s1.push(extract(i*2 + 2, 2)); }
             for (let i=0; i<8; i++) { r2.push(extract(i*4 + 2, 3)); r2.push(extract(i*4 + 3, 3)); s2.push(extract(i*4 + 2, 4)); s2.push(extract(i*4 + 3, 4)); }
             for (let i=0; i<4; i++) { r3.push(extract(i*8 + 4, 5)); r3.push(extract(i*8 + 5, 5)); s3.push(extract(i*8 + 4, 6)); s3.push(extract(i*8 + 5, 6)); }
             for (let i=0; i<2; i++) { r4.push(extract(i*16 + 8, 7)); r4.push(extract(i*16 + 9, 7)); s4.push(extract(i*16 + 8, 8)); s4.push(extract(i*16 + 9, 8)); }
             winner = extract(16, 9); runnerUp = extract(17, 9);
        } else if (bSize === 16) {
             for (let i=0; i<8; i++) { r1.push(extract(i*2 + 1, 1)); r1.push(extract(i*2 + 2, 1)); s1.push(extract(i*2 + 1, 2)); s1.push(extract(i*2 + 2, 2)); }
             for (let i=0; i<4; i++) { r2.push(extract(i*4 + 2, 3)); r2.push(extract(i*4 + 3, 3)); s2.push(extract(i*4 + 2, 4)); s2.push(extract(i*4 + 3, 4)); }
             for (let i=0; i<2; i++) { r3.push(extract(i*8 + 4, 5)); r3.push(extract(i*8 + 5, 5)); s3.push(extract(i*8 + 4, 6)); s3.push(extract(i*8 + 5, 6)); }
             winner = extract(8, 7); runnerUp = extract(9, 7);
        } else {
             for (let i=0; i<4; i++) { r1.push(extract(i*2 + 1, 1)); r1.push(extract(i*2 + 2, 1)); s1.push(extract(i*2 + 1, 2)); s1.push(extract(i*2 + 2, 2)); }
             for (let i=0; i<2; i++) { r2.push(extract(i*4 + 2, 3)); r2.push(extract(i*4 + 3, 3)); s2.push(extract(i*4 + 2, 4)); s2.push(extract(i*4 + 3, 4)); }
             winner = extract(4, 5); runnerUp = extract(5, 5);
        }
        
        setBracketData({ r1, s1, r2, s2, r3, s3, r4, s4, r5, s5, winner, runnerUp, bracketSize: bSize, hasData: true, canGenerate: false, seeds: {} });
    } catch(e) { console.log(e); setBracketData({ ...bracketData, hasData: false, canGenerate: true }); } finally { setIsLoading(false); }
  }

  return {
    navState, setNavState,
    rankingData, headers,
    bracketData, groupData,
    isSorteoConfirmado, isLoading,
    generatedBracket, isFixedData,
    footerClicks, showRankingCalc, setShowRankingCalc,
    calculatedRanking,
    // EXPORTAMOS LO NUEVO
    inscriptosList, 
    showInscriptosModal, 
    setShowInscriptosModal,
    fetchInscriptos,
    // -------------------
    fetchRankingData,
    fetchBracketData,
    runDirectDraw, 
    runATPDraw,
    fetchGroupPhase, 
    fetchQualifiersAndDraw,
    confirmarYEnviar,
    enviarListaBasti, 
    confirmarSorteoCuadro,
    handleFooterClick, 
    goBack,
  };
};