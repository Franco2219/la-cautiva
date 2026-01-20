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

  // --- LÓGICA DEL CUADRO DE ELIMINACIÓN ---
  
  const generatePlayoffBracket = (qualifiers: any[]) => {
      const totalPlayers = qualifiers.length;

      // ============================================================
      // BLOQUE 1: TORNEOS CHICOS (<= 32 Jugadores)
      // ============================================================
      if (totalPlayers <= 32) {
          let bracketSize = 8;
          if (totalPlayers > 16) bracketSize = 32; 
          else if (totalPlayers > 8) bracketSize = 16; 
          else if (totalPlayers > 4) bracketSize = 8; 
          else bracketSize = 4; 
  
          const byeCount = bracketSize - totalPlayers;
          const numMatches = bracketSize / 2;
          const halfMatches = numMatches / 2;
  
          const winners = qualifiers.filter(q => q.rank === 1).sort((a, b) => a.groupIndex - b.groupIndex); 
          const runners = qualifiers.filter(q => q.rank === 2).sort(() => Math.random() - 0.5); 
  
          // CORRECCIÓN BYES: Prioridad estricta a los ganadores de zona (1 al 8)
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
          
          const wZ1 = winners.find(w => w.groupIndex === 0);
          const wZ2 = winners.find(w => w.groupIndex === 1);
          const wZ3 = winners.find(w => w.groupIndex === 2);
          const wZ4 = winners.find(w => w.groupIndex === 3);
          const otherWinners = winners.filter(w => w.groupIndex > 3).sort(() => Math.random() - 0.5);
  
          const idxTop = 0; 
          const idxBottom = numMatches - 1;
          const idxMidTop = halfMatches - 1; 
          const idxMidBottom = halfMatches; 
  
          // Seed 1 va Arriba
          if (wZ1) matches[idxTop].p1 = wZ1;
          
          // Seed 2 va ABAJO
          if (wZ2) matches[idxBottom].p2 = wZ2;
          
          const mids = [wZ3, wZ4].filter(Boolean).sort(() => Math.random() - 0.5);
          if (mids.length > 0) matches[idxMidTop].p2 = mids[0];
          if (mids.length > 1) matches[idxMidBottom].p1 = mids[1];
          
          // Llenar el resto de ganadores (aleatorio para evitar agrupamiento)
          const availableSlotsP1 = matches.map((m, i) => m.p1 === null ? i : -1).filter(i => i !== -1).sort(() => Math.random() - 0.5);
          const availableSlotsP2 = matches.map((m, i) => m.p2 === null ? i : -1).filter(i => i !== -1).sort(() => Math.random() - 0.5);

          otherWinners.forEach(w => {
              if (availableSlotsP1.length > 0) matches[availableSlotsP1.pop()!].p1 = w;
              else if (availableSlotsP2.length > 0) matches[availableSlotsP2.pop()!].p2 = w;
          });
  
          const topHalfMatches = matches.slice(0, halfMatches);
          const bottomHalfMatches = matches.slice(halfMatches);
          
          const getZones = (matchList: any[]) => {
              const zones = new Set();
              matchList.forEach(m => {
                  if (m.p1 && m.p1.groupIndex !== undefined) zones.add(m.p1.groupIndex);
                  if (m.p2 && m.p2.groupIndex !== undefined) zones.add(m.p2.groupIndex);
              });
              return zones;
          };

          const zonesInTop = getZones(topHalfMatches);
          const zonesInBottom = getZones(bottomHalfMatches);
          
          const mustGoBottom = runners.filter(r => zonesInTop.has(r.groupIndex));
          const mustGoTop = runners.filter(r => zonesInBottom.has(r.groupIndex));
          const freeAgents = runners.filter(r => !zonesInTop.has(r.groupIndex) && !zonesInBottom.has(r.groupIndex));
          
          const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5);
          let poolTop = shuffle([...mustGoTop]); 
          let poolBottom = shuffle([...mustGoBottom]); 
          let poolFree = shuffle([...freeAgents]);
  
          // Balanceo de agentes libres
          const slotsInTop = halfMatches * 2;
          const filledInTop = topHalfMatches.reduce((acc, m) => acc + (m.p1 ? 1 : 0) + (m.p2 ? 1 : 0), 0);
          const spaceTop = slotsInTop - filledInTop;

          const slotsInBottom = (numMatches - halfMatches) * 2;
          const filledInBottom = bottomHalfMatches.reduce((acc, m) => acc + (m.p1 ? 1 : 0) + (m.p2 ? 1 : 0), 0);
          const spaceBottom = slotsInBottom - filledInBottom;

          while (poolFree.length > 0) {
             const pendingTop = poolTop.length;
             const pendingBottom = poolBottom.length;
             if ((spaceTop - pendingTop) > (spaceBottom - pendingBottom)) {
                 poolTop.push(poolFree.pop());
             } else {
                 poolBottom.push(poolFree.pop());
             }
          }
          poolTop = shuffle(poolTop); 
          poolBottom = shuffle(poolBottom);
  
          // Lógica de llenado para evitar Bye vs Bye
          const fillMatchesStrict = (matchList: any[], pool: any[]) => {
              // CORRECCIÓN VISUAL: Barajar la lista de partidos para no llenar siempre los de arriba primero
              const shuffledMatches = [...matchList].sort(() => Math.random() - 0.5);

              // 1. Llenar llaves vacías primero
              shuffledMatches.forEach(m => {
                  if (!m.p1 && !m.p2 && pool.length > 0) m.p1 = pool.pop();
              });
              // 2. Llenar contra Seeds que NO tengan Bye
              shuffledMatches.forEach(m => {
                  if (m.p1 && !m.p2 && !playersWithBye.has(m.p1.name) && pool.length > 0) m.p2 = pool.pop();
                  else if (!m.p1 && m.p2 && !playersWithBye.has(m.p2.name) && pool.length > 0) m.p1 = pool.pop();
              });
              // 3. Relleno final
              shuffledMatches.forEach(m => {
                  if (!m.p1 && pool.length > 0) m.p1 = pool.pop();
                  if (!m.p2 && pool.length > 0) m.p2 = pool.pop();
              });
          };

          fillMatchesStrict(topHalfMatches, poolTop);
          fillMatchesStrict(bottomHalfMatches, poolBottom);

          matches.forEach(m => {
              if (!m.p1) m.p1 = { name: "BYE", rank: 0, groupIndex: -1 };
              if (!m.p2) m.p2 = { name: "BYE", rank: 0, groupIndex: -1 };
              // Estética: Si P1 es Bye y P2 Jugador, invertir (Salvo Seed 2 fijo en P2)
              const isFixedP2 = (m.p2.rank === 1 || m.p2.rank === 2);
              if (!isFixedP2 && m.p1.name === "BYE" && m.p2.name !== "BYE") {
                  const temp = m.p1; m.p1 = m.p2; m.p2 = temp;
              }
          });

          return { matches, bracketSize };
      } 
      
      // ============================================================
      // BLOQUE 2: TORNEOS GRANDES (> 32 Jugadores)
      // ============================================================
      else {
          const bracketSize = 64;
          const numMatches = 32; 
          const byeCount = bracketSize - totalPlayers;
  
          const winners = qualifiers.filter(q => q.rank === 1).sort((a, b) => a.groupIndex - b.groupIndex); 
          const runners = qualifiers.filter(q => q.rank === 2).sort(() => Math.random() - 0.5); 
  
          // Prioridad estricta para Winners Z1-Z8
          const maxPriorityByes = 8;
          const assignedByesCount = Math.min(byeCount, maxPriorityByes);
          const priorityByeZones = new Set();
          for(let i=0; i<assignedByesCount; i++) {
              if(winners[i]) priorityByeZones.add(winners[i].groupIndex);
          }
          const playersWithBye = new Set();
          for(let i=0; i<assignedByesCount; i++) { if(winners[i]) playersWithBye.add(winners[i].name); }
          
          let matches: any[] = Array(numMatches).fill(null).map(() => ({ p1: null, p2: null }));
  
          const placeP1 = (winner: any, index: number, slot: 'p1' | 'p2') => {
              if (!winner) return;
              if (slot === 'p1') matches[index].p1 = winner;
              else matches[index].p2 = winner;
          };
  
          // Seed 1 (Z1): Arriba
          if (winners[0]) placeP1(winners[0], 0, 'p1'); 
          // Seed 2 (Z2): Abajo
          if (winners[1]) placeP1(winners[1], numMatches - 1, 'p2'); 
          
          const mids = [winners[2], winners[3]].filter(Boolean); 
          if (mids.length > 0) {
              if (Math.random() > 0.5) mids.reverse();
              if (mids[0]) placeP1(mids[0], (numMatches/2) - 1, 'p2');
              if (mids[1]) placeP1(mids[1], (numMatches/2), 'p1');
          }
  
          const safeIndices = [7, 8, 23, 24].sort(() => Math.random() - 0.5);
          const z5to8 = winners.slice(4, 8); 
          z5to8.forEach(w => {
              if (safeIndices.length > 0) placeP1(w, safeIndices.pop()!, 'p1');
              else { 
                  const emptyIdx = matches.findIndex(m => m.p1 === null && m.p2 === null);
                  if (emptyIdx !== -1) placeP1(w, emptyIdx, 'p1');
              }
          });
  
          const remainingWinners = winners.slice(8);
          // Aleatorizar orden de llenado para ganadores restantes
          const emptyIndicesP1 = matches.map((m, i) => m.p1 === null ? i : -1).filter(i => i !== -1).sort(() => Math.random() - 0.5);
          
          remainingWinners.forEach(w => {
              if (emptyIndicesP1.length > 0) placeP1(w, emptyIndicesP1.pop()!, 'p1');
          });
  
          const runnersTop: any[] = [];
          const runnersBot: any[] = [];
          const runnersFree: any[] = []; 
          
          const findWinnerHalf = (groupIndex: number) => {
              const idx = matches.findIndex(m => (m.p1 && m.p1.groupIndex === groupIndex) || (m.p2 && m.p2.groupIndex === groupIndex));
              if (idx === -1) return null;
              return idx < numMatches / 2 ? 'top' : 'bottom';
          };

          runners.forEach(r => {
              const winnerHalf = findWinnerHalf(r.groupIndex);
              if (winnerHalf === 'top') runnersBot.push(r);
              else if (winnerHalf === 'bottom') runnersTop.push(r);
              else runnersFree.push(r);
          });
  
          runnersTop.sort(() => Math.random() - 0.5);
          runnersBot.sort(() => Math.random() - 0.5);
          runnersFree.sort(() => Math.random() - 0.5);
          
          // Llenado inteligente Y ORGÁNICO (Indices aleatorios)
          const fillZone = (startIdx: number, endIdx: number, pool: any[]) => {
              // Creamos un array de indices y lo mezclamos para no llenar en orden secuencial
              let indices = [];
              for(let i=startIdx; i<endIdx; i++) indices.push(i);
              indices.sort(() => Math.random() - 0.5);

              // Fase A: Llenar llaves VACÍAS (Evita Bye vs Bye)
              for(let i of indices) {
                  if(!matches[i].p1 && !matches[i].p2 && pool.length > 0) {
                      matches[i].p1 = pool.pop();
                  }
              }
              // Fase B: Enfrentar a Seeds (Evita 1vs1)
              for(let i of indices) {
                  if(pool.length === 0) break;
                  
                  if(matches[i].p1 && !matches[i].p2 && !priorityByePlayers.has(matches[i].p1.name)) {
                      matches[i].p2 = pool.pop();
                  }
                  else if(!matches[i].p1 && matches[i].p2 && !priorityByePlayers.has(matches[i].p2.name)) {
                      matches[i].p1 = pool.pop();
                  }
              }
              // Fase C: Relleno final
              for(let i of indices) {
                  if(pool.length === 0) break;
                  if(!matches[i].p1) matches[i].p1 = pool.pop();
                  else if(!matches[i].p2) matches[i].p2 = pool.pop();
              }
          };

          // Repartir Free Agents
          const topMatches = matches.slice(0, numMatches/2);
          const botMatches = matches.slice(numMatches/2);
          const slotsTop = topMatches.filter(m => !m.p1 || !m.p2).length; 
          const slotsBot = botMatches.filter(m => !m.p1 || !m.p2).length;
          
          while (runnersFree.length > 0) {
              if (slotsTop > slotsBot) runnersTop.push(runnersFree.pop());
              else runnersBot.push(runnersFree.pop());
          }

          fillZone(0, numMatches/2, runnersTop);
          fillZone(numMatches/2, numMatches, runnersBot);

          const allRemaining = [...runnersTop, ...runnersBot, ...runnersFree];
          // Si sobró gente (por bugs de cálculo), forzar entrada aleatoria
          const allIndices = Array.from({length: numMatches}, (_, i) => i).sort(() => Math.random() - 0.5);
          allIndices.forEach(i => {
              if (!matches[i].p1 && allRemaining.length > 0) matches[i].p1 = allRemaining.pop();
              if (!matches[i].p2 && allRemaining.length > 0) matches[i].p2 = allRemaining.pop();
          });

          // Rellenar con BYEs reales
          matches.forEach(m => {
              if (!m.p1) m.p1 = { name: "BYE", rank: 0, groupIndex: -1 };
              if (!m.p2) m.p2 = { name: "BYE", rank: 0, groupIndex: -1 };
              
              // Estética: Si P1 es BYE y P2 Jugador, invertir.
              const isFixedP2 = (m.p2.rank === 1 || m.p2.rank === 2);
              if (!isFixedP2 && m.p1.name === "BYE" && m.p2.name !== "BYE") {
                  const temp = m.p1; m.p1 = m.p2; m.p2 = temp;
              }
          });
  
          return { matches, bracketSize };
      }
  }

  // --- ACCIONES PÚBLICAS ---

  const enviarListaBasti = () => {
    let mensaje = `*PARTIDOS - ${getTournamentName(navState.tournamentShort || navState.currentTour)}*\n\n`;
    if (generatedBracket.length > 0) {
         generatedBracket.forEach(m => {
             if (m.p1 && m.p2 && m.p2.name !== "BYE") {
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
            if (parts.length > 0) {
                 idx = rankNames.findIndex(rankName => rankName.includes(parts[0]));
            }
            return idx === -1 ? 99999 : idx;
        };

        const headerRow = rows[0]; 
        const currentTourShort = navState.tournamentShort ? navState.tournamentShort.trim().toLowerCase() : "";
        const tourType = tournaments.find(t => t.short === navState.tournamentShort)?.type || "direct";
        
        let colIndex = -1;
        for(let i=0; i<headerRow.length; i++) {
            if (headerRow[i] && headerRow[i].trim().toLowerCase() === currentTourShort) {
                colIndex = i;
                break;
            }
        }
        if (colIndex === -1) {
            for(let i=0; i<headerRow.length; i++) {
                if (headerRow[i] && headerRow[i].trim().toLowerCase().includes(currentTourShort)) {
                    colIndex = i;
                    break;
                }
            }
        }
        if (colIndex === -1) {
            alert(`No se encontró la configuración de puntos para "${navState.tournamentShort}" en la fila 37 de Formatos Grupos.`);
            setIsLoading(false);
            return;
        }
        const getPoints = (rowIndex: number) => {
            if (!rows[rowIndex] || !rows[rowIndex][colIndex]) return 0;
            const val = parseInt(rows[rowIndex][colIndex]);
            return isNaN(val) ? 0 : val;
        };

        const pts = {
            champion: getPoints(1), finalist: getPoints(2), semi: getPoints(3), quarters: getPoints(4),   
            octavos: getPoints(5), dieciseis: getPoints(6), groupWin1: getPoints(7), groupWin2: getPoints(8), groupWin3: getPoints(9) 
        };

        const playerScores: any = {};
        const addRoundScore = (name: string, score: number) => {
            if (!name || name === "BYE" || name === "") return;
            const cleanName = name.trim();
            if (!playerScores[cleanName] || score > playerScores[cleanName]) {
                playerScores[cleanName] = score;
            }
        };

        if (bracketData.hasData) {
            const { r1, r2, r3, r4, r5, winner, bracketSize } = bracketData;
            let semis: string[] = [], cuartos: string[] = [], octavos: string[] = [], dieciseis: string[] = [];
            let finalists: string[] = [];

            if (bracketSize === 32) {
                semis = r4; cuartos = r3; octavos = r2; dieciseis = r1; finalists = r5 || [];
            } else if (bracketSize === 16) {
                semis = r3; cuartos = r2; octavos = r1; finalists = r4 || [];
            } else { 
                semis = r2; cuartos = r1; finalists = r3 || []; 
            }

            if (bracketSize === 32) dieciseis.forEach((p: string) => addRoundScore(p, pts.dieciseis));
            if (bracketSize >= 16) octavos.forEach((p: string) => addRoundScore(p, pts.octavos));
            cuartos.forEach((p: string) => addRoundScore(p, pts.quarters));
            semis.forEach((p: string) => addRoundScore(p, pts.semi));
            
            const winnerName = winner ? winner.trim().toLowerCase() : "";
            finalists.forEach((p: string) => {
                if (p && p !== "BYE" && p !== "") {
                    const pClean = p.trim();
                    if (winnerName && pClean.toLowerCase() === winnerName) addRoundScore(pClean, pts.champion);
                    else addRoundScore(pClean, pts.finalist);
                }
            });
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
                            const pName = players[x].trim();
                            if (!playerWins[pName]) playerWins[pName] = 0;
                            const rowIndex = i + 1 + x;
                            if (groupRows[rowIndex]) {
                                for(let y=1; y<=players.length; y++) {
                                    const res = groupRows[rowIndex][y];
                                    if(res && res.length > 2) {
                                        const sets = res.trim().split(" ");
                                        let sW = 0, sL = 0;
                                        sets.forEach(s => {
                                            if(s.includes("/")) {
                                                const parts = s.split("/").map(Number);
                                                if(parts[0] > parts[1]) sW++; else sL++;
                                            }
                                        });
                                        if(sW > sL) playerWins[pName]++;
                                    }
                                }
                            }
                        }
                    }
                }
                Object.keys(playerWins).forEach(pName => {
                    const wins = playerWins[pName];
                    let extraPoints = 0;
                    if (wins === 1) extraPoints = pts.groupWin1;
                    else if (wins === 2) extraPoints = pts.groupWin2;
                    else if (wins >= 3) extraPoints = pts.groupWin3;

                    if (playerScores[pName]) playerScores[pName] += extraPoints;
                    else playerScores[pName] = extraPoints;
                });
            } catch (err) { console.log("Error leyendo grupos para ranking full", err); }
        }
        const rankingArray = Object.keys(playerScores).map(key => ({
            name: key, points: playerScores[key]
        })).sort((a, b) => {
            const rankA = getRankIndex(a.name);
            const rankB = getRankIndex(b.name);
            if (rankA === rankB) return b.points - a.points;
            return rankA - rankB; 
        });
        setCalculatedRanking(rankingArray);
        setShowRankingCalc(true);
    } catch (e) {
        console.error(e);
        alert("Error calculando ranking. Verificá la hoja Formatos Grupos.");
    } finally { setIsLoading(false); }
  };

  const handleFooterClick = () => {
      if (navState.level === "direct-bracket") {
          const newCount = footerClicks + 1;
          setFooterClicks(newCount);
          if (newCount >= 4) {
              calculateAndShowRanking();
              setFooterClicks(0); 
          }
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
        const playersRanking = parseCSV(rankCsv).slice(1).map(row => ({
          name: row[1] || "",
          total: row[11] ? parseInt(row[11]) : 0
        })).filter(p => p.name !== "");

        const inscUrl = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=Inscriptos`;
        const inscRes = await fetch(inscUrl);
        const inscCsv = await inscRes.text();
        const filteredInscriptos = parseCSV(inscCsv).slice(1).filter(cols => 
          cols[0] === tournamentShort && cols[1] === categoryShort
        ).map(cols => cols[2]);

        if (filteredInscriptos.length < 4) {
            alert("Mínimo 4 jugadores para armar un cuadro.");
            setIsLoading(false);
            return;
        }

        const entryList = filteredInscriptos.map(n => {
            const p = playersRanking.find(pr => pr.name.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(pr.name.toLowerCase()));
            return { name: n, points: p ? p.total : 0 };
        }).sort((a, b) => b.points - a.points);

        const totalPlayers = entryList.length;
        let bracketSize = 4;
        if (totalPlayers > 4) bracketSize = 8;
        if (totalPlayers > 8) bracketSize = 16;
        if (totalPlayers > 16) bracketSize = 32;
        if (totalPlayers > 32) bracketSize = 64;

        const byeCount = bracketSize - totalPlayers;
        let slots: any[] = Array(bracketSize).fill(null);
        
        let pos1 = 0; let pos2 = bracketSize - 1;
        let pos34 = [(bracketSize / 2) - 1, bracketSize / 2];
        let pos58: number[] = [];
        if (bracketSize === 16) pos58 = [2, 5, 10, 13]; 
        else if (bracketSize === 32) pos58 = [7, 8, 23, 24]; 
        else if (bracketSize === 64) pos58 = [15, 16, 47, 48];

        const seeds = entryList.slice(0, 16).map((p, i) => ({ ...p, rank: i + 1 }));
        if (seeds[0]) slots[pos1] = seeds[0];
        if (seeds[1]) slots[pos2] = seeds[1];
        if (seeds[2] && seeds[3]) {
            const group34 = [seeds[2], seeds[3]].sort(() => Math.random() - 0.5);
            slots[pos34[0]] = group34[0]; slots[pos34[1]] = group34[1]; 
        } else if (seeds[2]) { slots[pos34[Math.floor(Math.random()*2)]] = seeds[2]; }

        if (seeds.length >= 8 && pos58.length === 4) {
            const group58 = seeds.slice(4, 8).sort(() => Math.random() - 0.5);
            const seedsTop = group58.slice(0, 2);
            const seedsBot = group58.slice(2, 4);
            const posTop = [pos58[0], pos58[1]].sort(() => Math.random() - 0.5);
            slots[posTop[0]] = seedsTop[0]; slots[posTop[1]] = seedsTop[1];
            const posBot = [pos58[2], pos58[3]].sort(() => Math.random() - 0.5);
            slots[posBot[0]] = seedsBot[0]; slots[posBot[1]] = seedsBot[1];
        }

        if (bracketSize === 64 && seeds.length >= 16) {
             const group9to16 = seeds.slice(8, 16).sort(() => Math.random() - 0.5);
             const pos9to16 = [7, 8, 23, 24, 39, 40, 55, 56].sort(() => Math.random() - 0.5);
             for(let i=0; i<8; i++) {
                 if (group9to16[i]) slots[pos9to16[i]] = group9to16[i];
             }
        }

        const getRivalIndex = (idx: number) => (idx % 2 === 0) ? idx + 1 : idx - 1;
        let byesRemaining = byeCount;
        const maxSeedCheck = bracketSize === 64 ? 16 : 8;
        for (let r = 1; r <= maxSeedCheck; r++) {
            if (byesRemaining > 0) {
                const seedIdx = slots.findIndex(s => s && s.rank === r);
                if (seedIdx !== -1) {
                    const rivalIdx = getRivalIndex(seedIdx);
                    if (slots[rivalIdx] === null) {
                        slots[rivalIdx] = { name: "BYE", rank: 0 };
                        byesRemaining--;
                    }
                }
            }
        }
        let emptyPairsIndices = []; 
        for (let i = 0; i < bracketSize; i += 2) {
             if (slots[i] === null && slots[i+1] === null) emptyPairsIndices.push(i);
        }
        let topPairs = emptyPairsIndices.filter(i => i < bracketSize / 2);
        let botPairs = emptyPairsIndices.filter(i => i >= bracketSize / 2);
        
        const popBalancedPair = () => {
            if (topPairs.length > 0 && (botPairs.length === 0 || Math.random() > 0.5)) {
                 const randIdx = Math.floor(Math.random() * topPairs.length);
                 return topPairs.splice(randIdx, 1)[0];
            } else if (botPairs.length > 0) {
                 const randIdx = Math.floor(Math.random() * botPairs.length);
                 return botPairs.splice(randIdx, 1)[0];
            }
            return -1;
        };
        while (byesRemaining > 0) {
            const pairIdx = popBalancedPair();
            if (pairIdx !== -1) {
                const slotOffset = Math.random() > 0.5 ? 0 : 1;
                slots[pairIdx + slotOffset] = { name: "BYE", rank: 0 };
                byesRemaining--;
            } else { break; }
        }
        
        const nonSeedsStartIndex = bracketSize === 64 ? 16 : 8;
        const nonSeeds = entryList.slice(nonSeedsStartIndex).map(p => ({ ...p, rank: 0 }));
        nonSeeds.sort(() => Math.random() - 0.5); 
        
        let countRealTop = slots.slice(0, bracketSize/2).filter(x => x && x.name !== "BYE").length;
        let countRealBot = slots.slice(bracketSize/2).filter(x => x && x.name !== "BYE").length;
        let emptySlots = slots.map((s, i) => s === null ? i : -1).filter(i => i !== -1);
        
        for (const player of nonSeeds) {
             const emptyTop = emptySlots.filter(i => i < bracketSize/2);
             const emptyBot = emptySlots.filter(i => i >= bracketSize/2);
             let targetIdx = -1;
             
             if (countRealTop < countRealBot && emptyTop.length > 0) {
                 targetIdx = emptyTop[Math.floor(Math.random() * emptyTop.length)];
             } else if (countRealBot < countRealTop && emptyBot.length > 0) {
                 targetIdx = emptyBot[Math.floor(Math.random() * emptyBot.length)];
             } else {
                 if (emptyTop.length > 0 && emptyBot.length > 0) {
                     targetIdx = Math.random() > 0.5 ? 
                        emptyTop[Math.floor(Math.random() * emptyTop.length)] : 
                        emptyBot[Math.floor(Math.random() * emptyBot.length)];
                 } else if (emptyTop.length > 0) {
                     targetIdx = emptyTop[Math.floor(Math.random() * emptyTop.length)];
                 } else if (emptyBot.length > 0) {
                     targetIdx = emptyBot[Math.floor(Math.random() * emptyBot.length)];
                 }
             }
             if (targetIdx !== -1) {
                 slots[targetIdx] = player;
                 if (targetIdx < bracketSize/2) countRealTop++; else countRealBot++;
                 emptySlots = emptySlots.filter(i => i !== targetIdx);
             }
        }
        for (let i = 0; i < slots.length; i++) { if (slots[i] === null) slots[i] = { name: "BYE", rank: 0 }; }

        let matches = [];
        for (let i = 0; i < bracketSize; i += 2) {
            let p1 = slots[i]; let p2 = slots[i+1];
            if (p1?.name === "BYE" && p2?.name !== "BYE") { let temp = p1; p1 = p2; p2 = temp; }
            matches.push({ p1, p2 });
        }
        setGeneratedBracket(matches);
        setNavState({ ...navState, level: "generate-bracket", category: categoryShort, tournamentShort: tournamentShort, bracketSize: bracketSize });
    } catch (e) { alert("Error al generar sorteo directo."); } finally { setIsLoading(false); }
  }

  const goBack = () => {
    setIsSorteoConfirmado(false);
    
    // Mapa de navegación
    const levels: any = { 
        "main-menu": "home", 
        "year-selection": "main-menu", 
        "category-selection": "main-menu", 
        "tournament-selection": "category-selection", 
        "tournament-phases": "tournament-selection", 
        "group-phase": "tournament-phases", 
        "bracket-phase": "tournament-phases", 
        "ranking-view": "category-selection", 
        "direct-bracket": "tournament-selection", 
        "damas-empty": "category-selection", 
        "generate-bracket": "direct-bracket" 
    };
    
    const nextLevel = levels[navState.level] || "home";

    // --- CORRECCIÓN: LIMPIEZA DE ESTADO ---
    if (nextLevel === "tournament-selection" || nextLevel === "category-selection") {
        setNavState({ 
            ...navState, 
            level: nextLevel,
            tournamentShort: undefined, // Borramos rastro de torneo Directo
            currentTour: undefined,     // Borramos rastro de torneo Grupos
            tournament: undefined,
            hasGroups: false
        });
        // También limpiamos los datos visuales
        setBracketData({ ...bracketData, hasData: false });
        setGroupData([]);
    } else {
        setNavState({ ...navState, level: nextLevel });
    }
  }

  return {
    navState, setNavState,
    rankingData, headers,
    bracketData, groupData,
    isSorteoConfirmado, isLoading,
    generatedBracket, isFixedData,
    footerClicks, showRankingCalc, setShowRankingCalc,
    calculatedRanking,
    // Functions
    fetchRankingData, fetchBracketData,
    runDirectDraw, runATPDraw,
    fetchGroupPhase, fetchQualifiersAndDraw,
    calculateAndShowRanking, confirmarYEnviar,
    enviarListaBasti, confirmarSorteoCuadro,
    handleFooterClick, goBack
  };
};