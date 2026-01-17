"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Grid3x3, RefreshCw, ArrowLeft, Trash2, Loader2, Send, AlertCircle, Shuffle, X, Copy, List } from "lucide-react"

// --- CONFIGURACIÓN DE DATOS ---
const ID_2025 = '1_tDp8BrXZfmmmfyBdLIUhPk7PwwKvJ_t'; 
const ID_DATOS_GENERALES = '1RVxm-lcNp2PWDz7HcDyXtq0bWIWA9vtw'; 
const ID_TORNEOS = '117mHAgirc9WAaWjHAhsalx1Yp6DgQj5bv2QpVZ-nWmI'; 
const MI_TELEFONO = "5491150568353"; 
const TELEFONO_BASTI = "5491123965949"; 

const tournaments = [
  { id: "adelaide", name: "Adelaide", short: "Adelaide", type: "direct" },
  { id: "s8_500", name: "Super 8 / 500", short: "S8 500", type: "direct" },
  { id: "s8_250", name: "Super 8 / 250", short: "S8 250", type: "direct" },
  { id: "ao", name: "Australian Open", short: "AO", type: "full" }, 
  { id: "iw", name: "Indian Wells", short: "IW", type: "full" },
  { id: "mc", name: "Monte Carlo", short: "MC", type: "full" },
  { id: "rg", name: "Roland Garros", short: "RG", type: "full" },
  { id: "wimbledon", name: "Wimbledon", short: "W", type: "full" },
  { id: "us", name: "US Open", short: "US", type: "direct" },
  { id: "masters", name: "Masters", short: "Masters", type: "full" },
]

// --- CONFIGURACIÓN DE ESTILOS Y LOGOS POR TORNEO ---
const TOURNAMENT_STYLES: any = {
    // SUPERFICIE DURA (AZUL OSCURO - BLUE 900)
    "adelaide": { color: "bg-blue-900", borderColor: "border-blue-900", textColor: "text-blue-900", trophyColor: "text-blue-900", logo: "/logos/adelaide.png", pointsLogo: null },
    "ao": { color: "bg-blue-900", borderColor: "border-blue-900", textColor: "text-blue-900", trophyColor: "text-blue-900", logo: "/logos/ao.png", pointsLogo: null },
    "us": { color: "bg-blue-900", borderColor: "border-blue-900", textColor: "text-blue-900", trophyColor: "text-blue-900", logo: "/logos/usopen.png", pointsLogo: null },
    "iw": { color: "bg-blue-900", borderColor: "border-blue-900", textColor: "text-blue-900", trophyColor: "text-blue-900", logo: "/logos/indianwells.png", pointsLogo: null },
    "masters": { color: "bg-blue-950", borderColor: "border-blue-950", textColor: "text-blue-950", trophyColor: "text-blue-950", logo: "/logos/masters.png", pointsLogo: null },
    
    // CESPED (VERDE OFICIAL WIMBLEDON)
    "wimbledon": { 
      color: "bg-[#00703C]", 
      borderColor: "border-[#00703C]", 
      textColor: "text-[#00703C]", 
      trophyColor: "text-[#00703C]", 
      logo: "/logos/wimbledon.png", 
      pointsLogo: null 
    },
    
    // POLVO DE LADRILLO (NARANJA - DEFAULT)
    "rg": { color: "bg-[#b35a38]", borderColor: "border-[#b35a38]", textColor: "text-[#b35a38]", trophyColor: "text-[#b35a38]", logo: "/logos/rg.png", pointsLogo: null },
    "mc": { color: "bg-[#b35a38]", borderColor: "border-[#b35a38]", textColor: "text-[#b35a38]", trophyColor: "text-[#b35a38]", logo: "/logos/mc.png", pointsLogo: null },
    "s8_500": { color: "bg-[#b35a38]", borderColor: "border-[#b35a38]", textColor: "text-[#b35a38]", trophyColor: "text-[#b35a38]", logo: "/logos/s8_500.png", pointsLogo: null },
    "s8_250": { color: "bg-[#b35a38]", borderColor: "border-[#b35a38]", textColor: "text-[#b35a38]", trophyColor: "text-[#b35a38]", logo: "/logos/s8_250.png", pointsLogo: null },

    // FALLBACK
    "default": { color: "bg-[#b35a38]", borderColor: "border-[#b35a38]", textColor: "text-[#b35a38]", trophyColor: "text-[#b35a38]", logo: "/logo.png", pointsLogo: null }
};

export default function Home() {
  const [navState, setNavState] = useState<any>({ level: "home" })
  const [rankingData, setRankingData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [bracketData, setBracketData] = useState<any>({ r1: [], s1: [], r2: [], s2: [], r3: [], s3: [], r4: [], s4: [], r5: [], s5: [], winner: "", runnerUp: "", bracketSize: 16, hasData: false, canGenerate: false, seeds: {} });
  const [groupData, setGroupData] = useState<any[]>([])
  const [isSorteoConfirmado, setIsSorteoConfirmado] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [generatedBracket, setGeneratedBracket] = useState<any[]>([])
  const [isFixedData, setIsFixedData] = useState(false)
  
  const [footerClicks, setFooterClicks] = useState(0);
  const [showRankingCalc, setShowRankingCalc] = useState(false);
  const [calculatedRanking, setCalculatedRanking] = useState<any[]>([]);

  const parseCSV = (text: string) => {
    if (!text) return [];
    return text.split('\n').map(row => 
      row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c ? c.replace(/"/g, '').trim() : "")
    );
  };

  const getTournamentStyle = (shortName: string) => {
      const key = shortName ? shortName.toLowerCase().trim() : "default";
      const map: any = { 
          "adelaide": "adelaide", 
          "ao": "ao", 
          "us open": "us", "us": "us", 
          "indian wells": "iw", "iw": "iw", 
          "masters": "masters", 
          "wimbledon": "wimbledon", "w": "wimbledon",
          "roland garros": "rg", "rg": "rg",
          "monte carlo": "mc", "mc": "mc",
          "s8 500": "s8_500", "super 8 / 500": "s8_500",
          "s8 250": "s8_250", "super 8 / 250": "s8_250"
      };
      const styleKey = map[key] || "default";
      return TOURNAMENT_STYLES[styleKey] || TOURNAMENT_STYLES["default"];
  };

  // Función helper para obtener el nombre completo
  const getTournamentName = (shortName: string) => {
      const tour = tournaments.find(t => t.short === shortName);
      return tour ? tour.name : shortName;
  };

  const enviarListaBasti = () => {
    let mensaje = `*PARTIDOS - ${navState.tournamentShort || navState.currentTour}*\n\n`;
    
    if (generatedBracket.length > 0) {
         generatedBracket.forEach(m => {
             if (m.p1 && m.p2 && m.p2.name !== "BYE") {
                 mensaje += `${m.p1.name} vs ${m.p2.name}\n`;
             }
         });
    }
    else if (navState.level === "group-phase") {
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

  // --- LÓGICA DE RANKING ---
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
    } finally {
        setIsLoading(false);
    }
  };

  const runDirectDraw = async (categoryShort: string, tournamentShort: string) => {
    setIsLoading(true);
    setGeneratedBracket([]);
    setIsFixedData(false);
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

        const byeCount = bracketSize - totalPlayers;
        let slots: any[] = Array(bracketSize).fill(null);
        
        let pos1 = 0; let pos2 = bracketSize - 1;
        let pos34 = [(bracketSize / 2) - 1, bracketSize / 2];
        let pos58: number[] = [];
        if (bracketSize === 16) pos58 = [2, 5, 10, 13]; 
        else if (bracketSize === 32) pos58 = [7, 8, 23, 24]; 
        
        const seeds = entryList.slice(0, 8).map((p, i) => ({ ...p, rank: i + 1 }));
        
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

        const getRivalIndex = (idx: number) => (idx % 2 === 0) ? idx + 1 : idx - 1;
        let byesRemaining = byeCount;

        for (let r = 1; r <= 8; r++) {
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
        
        const nonSeeds = entryList.slice(8).map(p => ({ ...p, rank: 0 }));
        nonSeeds.sort(() => Math.random() - 0.5); 
        let countTop = slots.slice(0, bracketSize/2).filter(x => x !== null).length;
        let countBot = slots.slice(bracketSize/2).filter(x => x !== null).length;
        let emptySlots = slots.map((s, i) => s === null ? i : -1).filter(i => i !== -1);
        
        for (const player of nonSeeds) {
             const emptyTop = emptySlots.filter(i => i < bracketSize/2);
             const emptyBot = emptySlots.filter(i => i >= bracketSize/2);
             let targetIdx = -1;
             if (countTop <= countBot && emptyTop.length > 0) targetIdx = emptyTop[Math.floor(Math.random() * emptyTop.length)];
             else if (emptyBot.length > 0) targetIdx = emptyBot[Math.floor(Math.random() * emptyBot.length)];
             else if (emptyTop.length > 0) targetIdx = emptyTop[Math.floor(Math.random() * emptyTop.length)];

             if (targetIdx !== -1) {
                 slots[targetIdx] = player;
                 if (targetIdx < bracketSize/2) countTop++; else countBot++;
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

  const runATPDraw = async (categoryShort: string, tournamentShort: string) => {
    setIsLoading(true);
    setIsSorteoConfirmado(false);
    setIsFixedData(false);
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

      if (filteredInscriptos.length === 0) {
        alert(`No hay inscriptos para ${tournamentShort} (${categoryShort}) en la pestaña Inscriptos.`);
        setIsLoading(false);
        return;
      }

      const entryList = filteredInscriptos.map(n => {
        const p = playersRanking.find(pr => pr.name.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(pr.name.toLowerCase()));
        return { name: n, points: p ? p.total : 0 };
      }).sort((a, b) => b.points - a.points);

      const totalPlayers = entryList.length;
      if (totalPlayers < 2) { alert("Mínimo 2 jugadores."); setIsLoading(false); return; }

      let groupsOf4 = 0; let groupsOf3 = 0; let groupsOf2 = 0; let capacities = [];

      if (tournamentShort === "Masters") {
          groupsOf4 = Math.floor(totalPlayers / 4);
          const remainder = totalPlayers % 4;
          for(let i=0; i<groupsOf4; i++) capacities.push(4);
          if (remainder === 3) capacities.push(3);
          else if (remainder === 2) capacities.push(2);
          else if (remainder === 1) {
              if (capacities.length > 0) capacities[capacities.length - 1] += 1; 
              else capacities.push(1);
          }
      } else {
          const remainder = totalPlayers % 3;
          if (remainder === 0) { groupsOf3 = totalPlayers / 3; } 
          else if (remainder === 1) { groupsOf2 = 2; groupsOf3 = (totalPlayers - 4) / 3; } 
          else if (remainder === 2) { groupsOf2 = 1; groupsOf3 = (totalPlayers - 2) / 3; }
          for(let i=0; i<groupsOf3; i++) capacities.push(3);
          for(let i=0; i<groupsOf2; i++) capacities.push(2);
      }
      
      capacities = capacities.sort(() => Math.random() - 0.5);
      const numGroups = capacities.length;
      let groups = capacities.map((cap, i) => ({
        groupName: `Zona ${i + 1}`,
        capacity: cap,
        players: [],
        results: [["-","-","-"], ["-","-","-"], ["-","-","-"], ["-","-","-"]],
        positions: ["-", "-", "-", "-"],
        points: ["", "", "", ""],
        diff: ["", "", "", ""]
      }));

      for (let i = 0; i < numGroups; i++) { if (entryList[i]) groups[i].players.push(entryList[i].name); }
      const restOfPlayers = entryList.slice(numGroups).sort(() => Math.random() - 0.5);
      let pIdx = 0;
      for (let g = 0; g < numGroups; g++) {
        while (groups[g].players.length < groups[g].capacity && pIdx < restOfPlayers.length) {
          groups[g].players.push(restOfPlayers[pIdx].name);
          pIdx++;
        }
      }
      setGroupData(groups);
      setNavState({ ...navState, level: "group-phase", currentCat: categoryShort, currentTour: tournamentShort });
    } catch (e) { alert("Error al procesar el sorteo."); } finally { setIsLoading(false); }
  }

  const fetchGroupPhase = async (categoryShort: string, tournamentShort: string) => {
    setIsLoading(true);
    setGroupData([]);
    setIsSorteoConfirmado(false);
    setIsFixedData(false);
    try {
      const sheetName = `Grupos ${tournamentShort} ${categoryShort}`;
      const url = `https://docs.google.com/spreadsheets/d/${ID_TORNEOS}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
      const res = await fetch(url);
      const csvText = await res.text();
      let foundGroups = false;

      if (res.ok && !csvText.includes("<!DOCTYPE html>") && (csvText.includes("Zona") || csvText.includes("Grupo"))) {
        const rows = parseCSV(csvText);
        const parsedGroups = [];
        for (let i = 0; i < rows.length; i++) {
          if (rows[i] && rows[i][0] && (rows[i][0].includes("Zona") || rows[i][0].includes("Grupo"))) {
            
            const p4 = rows[i+4] && rows[i+4][0] && rows[i+4][0] !== "-" ? rows[i+4] : null;
            const playersRaw = [rows[i+1], rows[i+2], rows[i+3]];
            if (p4) playersRaw.push(p4);

            const validPlayersIndices = [];
            const players = [];
            const positions = [];
            const points = [];
            const diff = [];
            const gamesDiff = []; 

            playersRaw.forEach((row, index) => {
                if (row && row[0] && row[0] !== "-" && row[0] !== "") {
                    players.push(row[0]);
                    let rawPos = row[4] || ""; if (rawPos.startsWith("#")) rawPos = "-"; positions.push(rawPos); 
                    let rawPts = row[5] || ""; if (rawPts.startsWith("#")) rawPts = ""; points.push(rawPts);
                    let rawDif = row[6] || ""; if (rawDif.startsWith("#")) rawDif = ""; diff.push(rawDif);
                    let rawGames = row[7] || ""; if (rawGames.startsWith("#")) rawGames = ""; gamesDiff.push(rawGames);
                    validPlayersIndices.push(index); 
                }
            });

            const results = [];
            for (let x = 0; x < validPlayersIndices.length; x++) {
                const rowResults = [];
                const rowIndex = validPlayersIndices[x]; 
                for (let y = 0; y < validPlayersIndices.length; y++) {
                    const colIndex = validPlayersIndices[y];
                    const res = rows[i + 1 + rowIndex][1 + colIndex]; 
                    rowResults.push(res);
                }
                results.push(rowResults);
            }
            parsedGroups.push({
              groupName: rows[i][0],
              players: players,
              results: results,
              positions: positions,
              points: points,
              diff: diff,
              gamesDiff: gamesDiff
            });
          }
        }
        
        if (parsedGroups.length > 0) {
          setGroupData(parsedGroups);
          setIsSorteoConfirmado(true);
          setIsFixedData(true);
          foundGroups = true;
          setNavState({ ...navState, level: "tournament-phases", currentCat: categoryShort, currentTour: tournamentShort, hasGroups: true });
        }
      } 
      if (!foundGroups) {
        setNavState({ ...navState, level: "tournament-phases", currentCat: categoryShort, currentTour: tournamentShort, hasGroups: false });
      }
    } catch (e) {
        setNavState({ ...navState, level: "tournament-phases", currentCat: categoryShort, currentTour: tournamentShort, hasGroups: false });
    } finally { setIsLoading(false); }
  }

  const confirmarYEnviar = () => {
    let mensaje = `*SORTEO CONFIRMADO - ${navState.currentTour}*\n*Categoría:* ${navState.currentCat}\n\n`;
    groupData.forEach(g => { mensaje += `*${g.groupName}*\n${g.players.join('\n')}\n\n`; });
    window.open(`https://wa.me/${MI_TELEFONO}?text=${encodeURIComponent(mensaje)}`, '_blank');
    setIsSorteoConfirmado(true);
  };

  const GroupTable = ({ group }: { group: any }) => {
    const totalPlayers = group.players.length;
    let isComplete = true;

    for (let i = 0; i < totalPlayers; i++) {
        for (let j = 0; j < totalPlayers; j++) {
           if (i === j) continue; 
           const val = group.results[i]?.[j];
           if (!val || val.trim() === "-" || val.trim().length < 2) {
             isComplete = false;
             break;
           }
        }
        if (isComplete) break;
    }

    const hasTies = () => {
        if (!group.points || !group.diff) return false;
        const signatures = group.points.map((p: any, i: number) => `${p}|${group.diff[i]}`);
        const unique = new Set(signatures);
        return unique.size !== signatures.length; 
    };
    
    const showGames = hasTies();

    // LÓGICA DE RANKING INTERNA DEL GRUPO (Puntos > Sets > Games > H2H)
    const calculateRanks = () => {
        if (!isComplete) return group.positions.map((p:any) => p); 

        const playersData = group.players.map((p: string, i: number) => ({
            index: i,
            name: p,
            points: parseInt(group.points[i]) || 0,
            setsDiff: parseInt(group.diff[i]) || 0,
            gamesDiff: parseInt(group.gamesDiff[i]) || 0,
            originalPos: group.positions[i]
        }));

        const checkHeadToHead = (idxA: number, idxB: number) => {
            const result = group.results[idxA][idxB]; 
            if (!result || result.length < 3) return 0;
            const sets = result.trim().split(" ");
            let winsA = 0; let winsB = 0;
            sets.forEach((s: string) => {
                if (s.includes("/")) {
                    const [gamesA, gamesB] = s.split("/").map(Number);
                    if (gamesA > gamesB) winsA++;
                    else if (gamesB > gamesA) winsB++;
                }
            });
            if (winsA > winsB) return 1; 
            if (winsB > winsA) return -1; 
            return 0;
        };

        playersData.sort((a: any, b: any) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.setsDiff !== a.setsDiff) return b.setsDiff - a.setsDiff;
            if (b.gamesDiff !== a.gamesDiff) return b.gamesDiff - a.gamesDiff;
            const h2h = checkHeadToHead(a.index, b.index);
            if (h2h !== 0) return h2h * -1; 
            return 0;
        });

        const ranks = new Array(totalPlayers).fill("-");
        
        for (let i = 0; i < playersData.length; i++) {
            if (i === 0) {
                 ranks[playersData[i].index] = 1;
            } else {
                 const prev = playersData[i-1];
                 const curr = playersData[i];
                 const areEqualMetrics = prev.points === curr.points && 
                                         prev.setsDiff === curr.setsDiff && 
                                         prev.gamesDiff === curr.gamesDiff;
                 const h2h = checkHeadToHead(prev.index, curr.index);

                 if (areEqualMetrics && h2h === 0) {
                     ranks[curr.index] = ranks[prev.index]; 
                 } else {
                     ranks[curr.index] = i + 1; 
                 }
            }
        }
        return ranks;
    };

    const displayRanks = calculateRanks();
    const style = getTournamentStyle(navState.currentTour);

    return (
    <div className={`bg-white border-2 border-opacity-20 rounded-2xl overflow-hidden shadow-lg mb-4 text-center h-fit overflow-hidden ${style.borderColor}`}>
      <div className={`${style.color} p-3 text-white font-black italic text-center uppercase tracking-wider relative flex items-center justify-between`}>
          <div className="w-20 h-20 flex items-center justify-center relative">
               {style.logo && <Image src={style.logo} alt="Tour Logo" width={80} height={80} className="object-contain" />}
          </div>
          <span className="flex-1 text-center">{group.groupName}</span>
          <div className="w-20 h-20 flex items-center justify-center relative">
               {style.pointsLogo && <Image src={style.pointsLogo} alt="Points" width={80} height={80} className="object-contain opacity-80" />}
          </div>
      </div>
      <style jsx>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="overflow-x-auto w-full hide-scroll">
          <table className="w-max min-w-full text-[11px] md:text-xs">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-3 border-r w-32 text-left font-bold text-black min-w-[120px] whitespace-nowrap">JUGADOR</th>
                {group.players && group.players.map((p: string, i: number) => {
                  let shortName = p;
                  if (p) {
                      const clean = p.replace(/,/g, "").trim().split(/\s+/);
                      if (clean.length > 1) shortName = `${clean[0]} ${clean[1].charAt(0)}.`;
                      else shortName = clean[0];
                  }
                  return (
                    <th key={i} className={`p-3 border-r text-center font-black uppercase min-w-[80px] whitespace-nowrap ${style.textColor}`}>
                        {shortName}
                    </th>
                  )
                })}
                {isComplete && (
                    <>
                        <th className="p-2 text-center font-black text-slate-600 bg-slate-100 whitespace-nowrap">PTS</th>
                        <th className="p-2 text-center font-black text-slate-600 bg-slate-100 whitespace-nowrap">SETS</th>
                        {showGames && <th className="p-2 text-center font-black text-slate-600 bg-slate-100 whitespace-nowrap">GAMES</th>}
                        <th className="p-3 text-center font-black text-black bg-slate-100 w-12 whitespace-nowrap">POS</th>
                    </>
                )}
              </tr>
            </thead>
            <tbody>
              {group.players && group.players.map((p1: string, i: number) => (
                <tr key={i} className="border-b">
                  <td className={`p-3 border-r font-black bg-slate-50 uppercase text-left whitespace-nowrap ${style.textColor}`}>{p1}</td>
                  {group.players.map((p2: string, j: number) => (
                    <td key={j} className={`p-2 border-r text-center font-black text-slate-700 whitespace-nowrap text-sm md:text-base ${i === j ? 'bg-slate-100 text-slate-300' : ''}`}>
                      {i === j ? "/" : (group.results[i] && group.results[i][j] ? group.results[i][j] : "-")}
                    </td>
                  ))}
                  {isComplete && (
                      <>
                          <td className="p-2 text-center font-bold text-slate-700 bg-slate-50">{group.points ? group.points[i] : "-"}</td>
                          <td className="p-2 text-center font-bold text-slate-700 bg-slate-50">{group.diff ? group.diff[i] : "-"}</td>
                          {showGames && <td className="p-2 text-center font-bold text-slate-700 bg-slate-50">{group.gamesDiff ? group.gamesDiff[i] : "-"}</td>}
                          <td className={`p-3 text-center font-black text-xl bg-slate-50 whitespace-nowrap ${style.textColor}`}>
                              {displayRanks[i] || "-"}°
                          </td>
                      </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
    );
  };

  const generatePlayoffBracket = (qualifiers: any[]) => {
    // ... (Igual)
    const totalPlayers = qualifiers.length;
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

    const playersWithBye = new Set();
    for(let i=0; i < byeCount; i++) {
        if(winners[i]) playersWithBye.add(winners[i].name);
        else if(runners[i - winners.length]) playersWithBye.add(runners[i - winners.length].name);
    }
    let matches: any[] = Array(numMatches).fill(null).map(() => ({ p1: null, p2: null }));
    const wZ1 = winners.find(w => w.groupIndex === 0);
    const wZ2 = winners.find(w => w.groupIndex === 1);
    const wZ3 = winners.find(w => w.groupIndex === 2);
    const wZ4 = winners.find(w => w.groupIndex === 3);
    const otherWinners = winners.filter(w => w.groupIndex > 3).sort(() => Math.random() - 0.5);

    const idxTop = 0; const idxBottom = numMatches - 1;
    const idxMidTop = halfMatches - 1; const idxMidBottom = halfMatches; 

    if (wZ1) matches[idxTop].p1 = wZ1;
    if (wZ2) matches[idxBottom].p1 = wZ2;
    const mids = [wZ3, wZ4].filter(Boolean).sort(() => Math.random() - 0.5);
    if (mids.length > 0) matches[idxMidTop].p1 = mids[0];
    if (mids.length > 1) matches[idxMidBottom].p1 = mids[1];
    matches.forEach(m => { if (!m.p1 && otherWinners.length > 0) m.p1 = otherWinners.pop(); });

    const topHalfMatches = matches.slice(0, halfMatches);
    const bottomHalfMatches = matches.slice(halfMatches);
    const zonesInTop = new Set(topHalfMatches.map(m => m.p1?.groupIndex).filter(i => i !== undefined));
    const zonesInBottom = new Set(bottomHalfMatches.map(m => m.p1?.groupIndex).filter(i => i !== undefined));
    const mustGoBottom = runners.filter(r => zonesInTop.has(r.groupIndex));
    const mustGoTop = runners.filter(r => zonesInBottom.has(r.groupIndex));
    const freeAgents = runners.filter(r => !zonesInTop.has(r.groupIndex) && !zonesInBottom.has(r.groupIndex));
    const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5);
    let poolTop = shuffle([...mustGoTop]); let poolBottom = shuffle([...mustGoBottom]); let poolFree = shuffle([...freeAgents]);

    while (poolTop.length < halfMatches && poolFree.length > 0) poolTop.push(poolFree.pop());
    while (poolBottom.length < (numMatches - halfMatches) && poolFree.length > 0) poolBottom.push(poolFree.pop());
    poolTop = shuffle(poolTop); poolBottom = shuffle(poolBottom);

    matches.forEach((match, index) => {
        const isTopHalf = index < halfMatches;
        let pool = isTopHalf ? poolTop : poolBottom;
        if (match.p1) {
            if (playersWithBye.has(match.p1.name)) { match.p2 = { name: "BYE", rank: 0, groupIndex: -1 }; } 
            else { if (pool.length > 0) match.p2 = pool.pop(); else match.p2 = { name: "", rank: 0 }; }
        } else {
            if (pool.length >= 2) { match.p1 = pool.pop(); match.p2 = pool.pop(); } 
            else if (pool.length === 1) { match.p1 = pool.pop(); match.p2 = { name: "BYE", rank: 0 }; }
        }
    });
    return { matches, bracketSize };
  }

  const fetchQualifiersAndDraw = async (category: string, tournamentShort: string) => {
      // ... (Igual)
      setIsLoading(true);
      setGeneratedBracket([]);
      const sheetName = `Grupos ${tournamentShort} ${category}`;
      const url = `https://docs.google.com/spreadsheets/d/${ID_TORNEOS}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
      try {
          const response = await fetch(url);
          const csvText = await response.text();
          const rows = parseCSV(csvText);
          let qualifiers = [];
          for(let i = 0; i < 50; i++) { 
              if (rows[i] && rows[i].length > 5) {
                  const winnerName = rows[i][12]; 
                  const runnerName = rows[i].length > 13 ? rows[i][13] : null; 
                  if (winnerName && winnerName !== "-" && winnerName !== "" && !winnerName.toLowerCase().includes("1ro")) {
                      qualifiers.push({ name: winnerName, rank: 1, groupIndex: i });
                  }
                  if (runnerName && runnerName !== "-" && runnerName !== "" && !runnerName.toLowerCase().includes("2do")) {
                      qualifiers.push({ name: runnerName, rank: 2, groupIndex: i });
                  }
              }
          }
          if (qualifiers.length >= 3) { 
             const result = generatePlayoffBracket(qualifiers);
             if (result) {
                 setGeneratedBracket(result.matches);
                 setNavState({ ...navState, level: "generate-bracket", category, tournamentShort, bracketSize: result.bracketSize });
             }
          } else { alert("No se encontraron clasificados para sortear"); }
      } catch (e) { console.error(e); alert("Error leyendo los clasificados."); } finally { setIsLoading(false); }
  }

  const confirmarSorteoCuadro = () => {
    if (generatedBracket.length === 0) return;
    let mensaje = `*SORTEO CUADRO FINAL - ${navState.tournamentShort}*\n*Categoría:* ${navState.category}\n\n`;
    generatedBracket.forEach((match) => {
        const p1Name = match.p1 ? match.p1.name : "TBD";
        const p2Name = match.p2 ? match.p2.name : "TBD"; 
        mensaje += `${p1Name}\n${p2Name}\n`;
    });
    window.open(`https://wa.me/${MI_TELEFONO}?text=${encodeURIComponent(mensaje)}`, '_blank');
  }

  const fetchRankingData = async (categoryShort: string, year: string) => {
    // ... (Igual)
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

  const fetchBracketData = async (category: string, tournamentShort: string) => {
    // ... (Igual)
    setIsLoading(true); 
    setBracketData({ r1: [], s1: [], r2: [], s2: [], r3: [], s3: [], r4: [], s4: [], winner: "", runnerUp: "", bracketSize: 16, hasData: false, canGenerate: false, seeds: {} });
    const urlBracket = `https://docs.google.com/spreadsheets/d/${ID_TORNEOS}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(`${category} ${tournamentShort}`)}`;
    const checkCanGenerate = async () => {
        const isDirect = tournaments.find(t => t.short === tournamentShort)?.type === "direct";
        if (isDirect) {
            const urlInscriptos = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=Inscriptos`;
            try {
                const res = await fetch(urlInscriptos);
                const txt = await res.text();
                const rows = parseCSV(txt);
                const count = rows.filter(r => r[0] === tournamentShort && r[1] === category).length;
                setBracketData({ hasData: false, canGenerate: count >= 4 });
            } catch (e) { setBracketData({ hasData: false, canGenerate: false }); }
        } else {
            const sheetNameGroups = `Grupos ${tournamentShort} ${category}`;
            const urlGroups = `https://docs.google.com/spreadsheets/d/${ID_TORNEOS}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetNameGroups)}`;
            try {
                const resGroups = await fetch(urlGroups);
                const txtGroups = await resGroups.text();
                const rowsGroups = parseCSV(txtGroups);
                let foundQualifiers = false;
                for(let i=0; i<Math.min(rowsGroups.length, 50); i++) {
                    if (rowsGroups[i] && rowsGroups[i].length > 5 && rowsGroups[i][5] && rowsGroups[i][5] !== "" && rowsGroups[i][5] !== "-") { foundQualifiers = true; break; }
                }
                setBracketData({ hasData: false, canGenerate: foundQualifiers });
            } catch(err2) { setBracketData({ hasData: false, canGenerate: false }); }
        }
    };

    const processByes = (data: any) => {
        const { r1, r2, r3, r4, bracketSize } = data;
        const newR2 = [...r2]; const newR3 = [...r3];
        if (bracketSize === 32) {
            for (let i = 0; i < r1.length; i += 2) {
                const p1 = r1[i]; const p2 = r1[i+1];
                const targetIdx = Math.floor(i / 2);
                if (!newR2[targetIdx] || newR2[targetIdx] === "") {
                    if (p2 === "BYE" && p1 && p1 !== "BYE") newR2[targetIdx] = p1;
                    else if (p1 === "BYE" && p2 && p2 !== "BYE") newR2[targetIdx] = p2;
                }
            }
            data.r2 = newR2;
        }
        const roundPrev = bracketSize === 32 ? newR2 : r1;
        const roundNext = bracketSize === 32 ? newR3 : r2; 
        for (let i = 0; i < roundPrev.length; i += 2) {
             const p1 = roundPrev[i]; const p2 = roundPrev[i+1];
             const targetIdx = Math.floor(i / 2);
             if (!roundNext[targetIdx] || roundNext[targetIdx] === "") {
                 if (p2 === "BYE" && p1 && p1 !== "BYE") roundNext[targetIdx] = p1;
                 else if (p1 === "BYE" && p2 && p2 !== "BYE") roundNext[targetIdx] = p2;
             }
        }
        if (bracketSize === 32) { data.r3 = newR3; } else { data.r2 = roundNext; }
        return data;
    }

    try {
      const response = await fetch(urlBracket);
      const csvText = await response.text();
      const rows = parseCSV(csvText);
      const firstCell = rows.length > 0 && rows[0][0] ? rows[0][0].toString().toLowerCase() : "";
      const invalidKeywords = ["formato", "cant", "zona", "pareja", "inscripto", "ranking", "puntos", "nombre", "apellido", "torneo", "fecha"];
      const isInvalidSheet = invalidKeywords.some(k => firstCell.includes(k));
      const hasContent = rows.length > 0 && !isInvalidSheet && firstCell !== "" && firstCell !== "-";

      if (hasContent) {
          const playersInCol1 = rows.filter(r => r[0] && r[0].trim() !== "" && r[0] !== "-").length;
          
          let bracketSize = 16; 
          if (playersInCol1 > 16) bracketSize = 32;
          else if (playersInCol1 <= 8) bracketSize = 8; 

          let seeds = {};
          try {
             const rankUrl = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(`${category} 2026`)}`;
             const rankRes = await fetch(rankUrl);
             const rankTxt = await rankRes.text();
             const playersRanking = parseCSV(rankTxt).slice(1).map(row => ({
               name: row[1] || "",
               total: row[11] ? parseInt(row[11]) : 0
             })).filter(p => p.name !== "");
             const inscUrl = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=Inscriptos`;
             const inscRes = await fetch(inscUrl);
             const inscTxt = await inscRes.text();
             const filteredInscriptos = parseCSV(inscTxt).slice(1).filter(cols => 
               cols[0] === tournamentShort && cols[1] === category
             ).map(cols => cols[2]);
             const entryList = filteredInscriptos.map(n => {
                 const p = playersRanking.find(pr => pr.name.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(pr.name.toLowerCase()));
                 return { name: n, points: p ? p.total : 0 };
             }).sort((a, b) => b.points - a.points);
             const top8 = entryList.slice(0, 8);
             const seedMap: any = {};
             top8.forEach((p, i) => { if (p.name) seedMap[p.name] = i + 1; });
             seeds = seedMap;
          } catch(e) { console.log("Error fetching seeds", e); }

          let rawData: any = {};
          let winnerIdx = -1;
          if (bracketSize === 32) winnerIdx = 10; 
          else if (bracketSize === 16) winnerIdx = 8; 
          else if (bracketSize === 8) winnerIdx = 6; 
          
          const winner = (winnerIdx !== -1 && rows[0] && rows[0][winnerIdx]) ? rows[0][winnerIdx] : "";
          const runnerUp = (winner && winnerIdx !== -1 && rows.length > 1 && rows[1][winnerIdx]) ? rows[1][winnerIdx] : "";
          const getColData = (colIdx: number, limit: number) => rows.map(r => r[colIdx]).filter(c => c && c.trim() !== "" && c.trim() !== "-").slice(0, limit);
          const getScoreData = (colIdx: number, limit: number) => rows.map(r => r[colIdx] || "").slice(0, limit);

          if (bracketSize === 32) {
            rawData = { 
                r1: getColData(0, 32), s1: getScoreData(1, 32),
                r2: getColData(2, 16), s2: getScoreData(3, 16),
                r3: getColData(4, 8),  s3: getScoreData(5, 8),
                r4: getColData(6, 4),  s4: getScoreData(7, 4),
                r5: getColData(8, 2),  s5: getScoreData(9, 2), 
                winner: winner, runnerUp: runnerUp, bracketSize: 32, hasData: true, canGenerate: false, seeds: seeds 
            };
          } else if (bracketSize === 16) {
            rawData = { 
                r1: getColData(0, 16), s1: getScoreData(1, 16),
                r2: getColData(2, 8),  s2: getScoreData(3, 8),
                r3: getColData(4, 4),  s3: getScoreData(5, 4),
                r4: getColData(6, 2),  s4: getScoreData(7, 2), 
                winner: winner, runnerUp: runnerUp, bracketSize: 16, hasData: true, canGenerate: false, seeds: seeds 
            };
          } else {
            rawData = { 
                r1: getColData(0, 8), s1: getScoreData(1, 8),
                r2: getColData(2, 4), s2: getScoreData(3, 4),
                r3: getColData(4, 2), s3: getScoreData(5, 2), 
                r4: [], s4: [], winner: winner, runnerUp: runnerUp, bracketSize: 8, hasData: true, canGenerate: false, seeds: seeds 
            };
          }
          if (bracketSize !== 8) rawData = processByes(rawData); 
          setBracketData(rawData);
      } else { await checkCanGenerate(); }
    } catch (error) { await checkCanGenerate(); } finally { setIsLoading(false); }
  }

  const goBack = () => {
    setIsSorteoConfirmado(false);
    const levels: any = { "main-menu": "home", "year-selection": "main-menu", "category-selection": "main-menu", "tournament-selection": "category-selection", "tournament-phases": "tournament-selection", "group-phase": "tournament-phases", "bracket-phase": "tournament-phases", "ranking-view": "category-selection", "direct-bracket": "tournament-selection", "damas-empty": "category-selection", "generate-bracket": "direct-bracket" };
    setNavState({ ...navState, level: levels[navState.level] || "home" });
  }

  const buttonStyle = "w-full text-lg h-20 border-2 border-[#b35a38]/20 bg-white text-[#b35a38] hover:bg-[#b35a38] hover:text-white transform hover:scale-[1.01] transition-all duration-300 font-semibold shadow-md rounded-2xl flex items-center justify-center text-center";

  const GeneratedMatch = ({ match }: { match: any }) => (
      <div className="relative flex flex-col space-y-4 mb-8 w-full max-w-md mx-auto">
          <div className="flex items-center gap-4 border-b-2 border-slate-300 pb-2 relative bg-white">
              {match.p1 && <span className="text-orange-500 font-black text-lg w-16 text-right whitespace-nowrap">{match.p1.rank > 0 ? (match.p1.groupIndex !== undefined ? `${match.p1.rank}º Z${match.p1.groupIndex + 1}` : `${match.p1.rank}.`) : ""}</span>}
              <span className={`font-black text-xl uppercase truncate ${match.p1 ? 'text-slate-800' : 'text-slate-300'}`}>
                  {match.p1 ? match.p1.name : ""}
              </span>
          </div>
          <div className="flex items-center gap-4 border-b-2 border-slate-300 pb-2 relative bg-white">
              {match.p2 && match.p2.name !== 'BYE' && <span className="text-orange-500 font-black text-lg w-16 text-right whitespace-nowrap">{match.p2.rank > 0 ? (match.p2.groupIndex !== undefined ? `${match.p2.rank}º Z${match.p2.groupIndex + 1}` : `${match.p2.rank}.`) : ""}</span>}
              <span className={`font-black text-xl uppercase truncate ${match.p2?.name === 'BYE' ? 'text-green-600' : (match.p2 ? 'text-slate-800' : 'text-slate-300')}`}>
                  {match.p2 ? match.p2.name : ""}
              </span>
          </div>
      </div>
  );

  const MiddleSpacer = () => (
    <div className="h-4 md:h-8 w-full relative">
        <div className="absolute left-0 top-1/2 w-full border-t-2 border-dotted border-slate-200/50"></div>
    </div>
  );

  const bracketStyle = getTournamentStyle(navState.tournamentShort);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-[#fffaf5]">
      <div className={`w-full ${['direct-bracket', 'group-phase', 'ranking-view', 'damas-empty', 'generate-bracket'].includes(navState.level) ? 'max-w-[95%]' : 'max-w-6xl'} mx-auto z-10 text-center`}>
        
        <div className="text-center mb-8">
            <div className="flex justify-center mb-5 text-center">
                <div className="relative group w-64 h-64">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/30 to-[#b35a38]/20 blur-2xl rounded-full opacity-100 transition-opacity duration-500" />
                <Image src="/logo.png" alt="Logo" width={280} height={280} className="relative z-10 object-contain transition-transform duration-500 group-hover:scale-110 unoptimized" priority />
                </div>
            </div>
          <h1 className="text-5xl md:text-7xl font-black mb-2 text-[#b35a38] italic">La Cautiva</h1>
          <p className="text-xl text-slate-400 font-bold uppercase tracking-widest italic text-center">Club de Tenis</p>
        </div>

        {navState.level !== "home" && <Button onClick={goBack} variant="ghost" className="mb-6 text-slate-500 font-bold">← VOLVER</Button>}

        {isLoading && <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center"><Loader2 className="w-12 h-12 text-[#b35a38] animate-spin" /></div>}

        <div className="space-y-4 max-w-xl mx-auto">
          {navState.level === "home" && <Button onClick={() => setNavState({ level: "main-menu" })} className="w-full h-28 text-2xl bg-[#b35a38] text-white font-black rounded-3xl border-b-8 border-[#8c3d26]">INGRESAR</Button>}
          {navState.level === "main-menu" && <div className="grid grid-cols-1 gap-4 text-center"><Button onClick={() => setNavState({ level: "category-selection", type: "caballeros" })} className={buttonStyle}>CABALLEROS</Button><Button onClick={() => setNavState({ level: "category-selection", type: "damas" })} className={buttonStyle}>DAMAS</Button><Button onClick={() => setNavState({ level: "year-selection", type: "ranking" })} className={buttonStyle}><Trophy className="mr-2 opacity-50" /> RANKING</Button></div>}
          {navState.level === "year-selection" && <div className="space-y-4 text-center"><Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2025" })} className={buttonStyle}>Ranking 2025</Button><Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2026" })} className={buttonStyle}>Ranking 2026</Button></div>}
          
          {navState.level === "category-selection" && (
            <div className="space-y-4 text-center">
              {["Categoría A", "Categoría B1", "Categoría B2", "Categoría C"].map((cat) => (
                <Button key={cat} onClick={() => {
                  const catShort = cat.replace("Categoría ", "");
                  if (navState.type === "damas") { setNavState({ ...navState, level: "damas-empty", selectedCategory: cat }); }
                  else if (navState.type === "ranking") { fetchRankingData(catShort, navState.year); setNavState({ ...navState, level: "ranking-view", selectedCategory: cat, year: navState.year }); }
                  else { setNavState({ ...navState, level: "tournament-selection", category: catShort, selectedCategory: cat, gender: navState.type }); }
                }} className={buttonStyle}>{cat}</Button>
              ))}
            </div>
          )}

          {navState.level === "tournament-selection" && (
            <div className="space-y-4 text-center">
              {tournaments.filter(t => {
                if (t.id === "adelaide" && navState.gender === "damas") return false;
                if ((t.id === "s8_500" || t.id === "s8_250") && navState.category === "A") return false;
                if (t.id === "s8_250" && navState.category === "C") return false;
                return true;
              }).map((t) => {
                return (
                  <Button 
                    key={t.id} 
                    onClick={() => {
                      if (t.type === "direct") { fetchBracketData(navState.category, t.short); setNavState({ ...navState, level: "direct-bracket", tournament: t.name, tournamentShort: t.short }); }
                      else { fetchGroupPhase(navState.category, t.short); }
                    }} 
                    className={buttonStyle}
                  >
                    {t.name}
                  </Button>
                );
              })}
            </div>
          )}

          {navState.level === "tournament-phases" && (
            <div className="space-y-4 text-center text-center">
              <h2 className="text-2xl font-black mb-4 text-slate-800 uppercase">Fases del Torneo</h2>
              {navState.hasGroups ? (
                <>
                  <Button onClick={() => setNavState({ ...navState, level: "group-phase" })} className={buttonStyle}><Users className="mr-2" /> Fase de Grupos</Button>
                  <Button onClick={() => { 
                      const tourName = getTournamentName(navState.currentTour);
                      fetchBracketData(navState.currentCat, navState.currentTour); 
                      setNavState({ ...navState, level: "direct-bracket", tournament: tourName, tournamentShort: navState.currentTour }); 
                  }} className={buttonStyle}><Grid3x3 className="mr-2" /> Cuadro Final</Button>
                </>
              ) : (
                <>
                  <Button onClick={() => runATPDraw(navState.currentCat, navState.currentTour)} className={buttonStyle}><RefreshCw className="mr-2" /> Realizar Sorteo ATP</Button>
                  <Button onClick={() => { 
                      const tourName = getTournamentName(navState.currentTour);
                      fetchBracketData(navState.currentCat, navState.currentTour); 
                      setNavState({ ...navState, level: "direct-bracket", tournament: tourName, tournamentShort: navState.currentTour }); 
                  }} className={buttonStyle}><Grid3x3 className="mr-2" /> Cuadro de Eliminación</Button>
                </>
              )}
            </div>
          )}
        </div>

        {navState.level === "generate-bracket" && (
          <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl text-center">
             <div className="bg-[#b35a38] p-4 rounded-2xl mb-8 text-center text-white italic min-w-[300px] mx-auto sticky left-0">
               <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider">
                   {navState.bracketSize === 32 ? "Sorteo 16avos" : 
                    navState.bracketSize === 16 ? "Sorteo Octavos" : 
                    navState.bracketSize === 8 ? "Sorteo Cuartos" : "Sorteo Semis"}
               </h2>
             </div>
             <div className="flex flex-col items-center gap-2 mb-8">
                {generatedBracket.map((match, i) => (
                    <>
                        <GeneratedMatch key={i} match={match} />
                        {i === (generatedBracket.length / 2) - 1 && (
                            <div className="w-full max-w-md my-8 flex items-center gap-4 opacity-50">
                                <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent flex-1" />
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">Mitad de Cuadro</span>
                                <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent flex-1" />
                            </div>
                        )}
                    </>
                ))}
             </div>

             <div className="flex flex-col md:flex-row gap-4 justify-center mt-8 sticky bottom-4 z-20">
                {/* Botón Lista Basti VISIBLE aqui */}
                <Button onClick={enviarListaBasti} className="bg-blue-500 text-white font-bold h-12 w-12 rounded-xl">
                    <List className="w-6 h-6" />
                </Button>

                {tournaments.find(t => t.short === navState.tournamentShort)?.type === 'direct' ? (
                   <Button onClick={() => runDirectDraw(navState.category, navState.tournamentShort)} className="bg-orange-500 text-white font-bold h-12 px-8 shadow-lg">
                       <Shuffle className="mr-2 w-4 h-4" /> Sortear
                   </Button>
                ) : (
                   <Button onClick={() => fetchQualifiersAndDraw(navState.category, navState.tournamentShort)} className="bg-orange-500 text-white font-bold h-12 px-8 shadow-lg">
                       <Shuffle className="mr-2 w-4 h-4" /> Sortear
                   </Button>
                )}
                <Button onClick={confirmarSorteoCuadro} className="bg-green-600 text-white font-bold h-12 px-8"><Send className="mr-2" /> CONFIRMAR Y ENVIAR</Button>
                <Button onClick={() => setNavState({ ...navState, level: "direct-bracket" })} className="bg-red-600 text-white font-bold h-12 px-8"><Trash2 className="mr-2" /> ELIMINAR</Button>
             </div>
          </div>
        )}

        {navState.level === "damas-empty" && (
          <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-12 shadow-2xl text-center max-w-2xl mx-auto">
            <h2 className="text-4xl font-black text-[#b35a38] mb-6 uppercase italic">{navState.selectedCategory}</h2>
            <div className="p-10 border-4 border-dashed border-slate-100 rounded-3xl">
              <Users className="w-20 h-20 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold text-xl uppercase tracking-widest text-center">No hay torneos activos por el momento</p>
            </div>
          </div>
        )}

        {navState.level === "group-phase" && (
          <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl min-h-[600px] text-center">
            <div className="flex justify-between items-center mb-8">
              <Button onClick={goBack} variant="outline" size="sm" className="border-[#b35a38] text-[#b35a38] font-bold"><ArrowLeft className="mr-2" /> ATRÁS</Button>
              {!isSorteoConfirmado && !isFixedData && (
                <div className="flex space-x-2 text-center text-center">
                  <Button onClick={() => runATPDraw(navState.currentCat, navState.currentTour)} className="bg-green-600 text-white font-bold h-12"><Shuffle className="mr-2" /> SORTEAR</Button>
                  {/* Botón Lista Basti VISIBLE */}
                  <Button onClick={enviarListaBasti} className="bg-blue-500 text-white font-bold h-12"><List className="mr-2" /> LISTA BASTI</Button>
                  <Button onClick={confirmarYEnviar} className="bg-green-600 text-white font-bold h-12 px-8"><Send className="mr-2" /> CONFIRMAR Y ENVIAR</Button>
                  <Button onClick={() => { setGroupData([]); setNavState({...navState, level: "tournament-phases"}); }} variant="destructive" className="font-bold h-12"><Trash2 className="mr-2" /> ELIMINAR</Button>
                </div>
              )}
            </div>
            {/* Cabecera general de la fase de grupos */}
            <div className={`${getTournamentStyle(navState.currentTour).color} p-4 rounded-2xl mb-8 text-center text-white italic relative flex items-center justify-between overflow-hidden`}>
               <div className="w-20 h-20 flex items-center justify-center relative">
                   {getTournamentStyle(navState.currentTour).logo && <Image src={getTournamentStyle(navState.currentTour).logo} alt="Tour Logo" width={80} height={80} className="object-contain" />}
               </div>
               <div className="flex-1">
                 <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider">{getTournamentName(navState.currentTour)} - Fase de Grupos</h2>
                 <p className="text-xs opacity-80 mt-1 font-bold uppercase">{navState.currentCat}</p>
               </div>
               <div className="w-20 h-20 flex items-center justify-center relative">
                   {/* Logo de puntos */}
                   {getTournamentStyle(navState.currentTour).pointsLogo && <Image src={getTournamentStyle(navState.currentTour).pointsLogo} alt="Points" width={80} height={80} className="object-contain opacity-80" />}
               </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {groupData.map((group, idx) => <GroupTable key={idx} group={group} />)}
            </div>
          </div>
        )}

        {navState.level === "direct-bracket" && (
          <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-4 shadow-2xl text-center md:overflow-visible overflow-hidden">
            <div className={`${bracketStyle.color} p-3 rounded-2xl mb-6 text-center text-white italic w-full mx-auto flex items-center justify-between`}>
               <div className="w-20 h-20 flex items-center justify-center relative">
                   {bracketStyle.logo && <Image src={bracketStyle.logo} alt="Tour Logo" width={80} height={80} className="object-contain" />}
               </div>
               <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider">{getTournamentName(navState.tournamentShort)} - {navState.selectedCategory}</h2>
               <div className="w-20 h-20 flex items-center justify-center relative">
                    {bracketStyle.pointsLogo && <Image src={bracketStyle.pointsLogo} alt="Points" width={80} height={80} className="object-contain opacity-80" />}
               </div>
            </div>
            
            {bracketData.hasData ? (
              <div className="flex flex-row items-stretch justify-between w-full overflow-x-auto gap-0 md:gap-1 py-8 px-1 relative text-left">
                {bracketData.bracketSize === 32 && (
                  <div className="flex flex-col justify-around min-w-[90px] md:min-w-0 md:flex-1 relative">
                    {Array.from({length: 16}, (_, i) => i * 2).map((idx) => {
                      const p1 = bracketData.r1[idx]; const p2 = bracketData.r1[idx+1];
                      const w1 = p1 && bracketData.r2.includes(p1);
                      const w2 = p2 && bracketData.r2.includes(p2);
                      const seed1 = bracketData.seeds ? bracketData.seeds[p1] : null;
                      const seed2 = bracketData.seeds ? bracketData.seeds[p2] : null;

                      return (
                        <>
                          <div key={idx} className="relative flex flex-col space-y-2 mb-2">
                            <div className={`h-6 border-b-2 ${w1 ? bracketStyle.borderColor : 'border-slate-300'} flex justify-between items-end relative bg-white`}>
                              <span className={`${p1 === 'BYE' ? 'text-green-600 font-black' : (w1 ? `${bracketStyle.textColor} font-black` : 'text-slate-700 font-bold')} text-[11px] md:text-xs uppercase truncate max-w-[90px]`}>
                                  {seed1 ? <span className="text-[10px] text-orange-600 font-black mr-1">{seed1}.</span> : null}{p1 || ""}
                              </span>
                              <span className="text-black font-black text-[10px] ml-1">{bracketData.s1[idx]}</span>
                            </div>
                            <div className={`h-6 border-b-2 ${w2 ? bracketStyle.borderColor : 'border-slate-300'} flex justify-between items-end relative bg-white`}>
                              <span className={`${p2 === 'BYE' ? 'text-green-600 font-black' : (w2 ? `${bracketStyle.textColor} font-black` : 'text-slate-700 font-bold')} text-[11px] md:text-xs uppercase truncate max-w-[90px]`}>
                                  {seed2 ? <span className="text-[10px] text-orange-600 font-black mr-1">{seed2}.</span> : null}{p2 || ""}
                              </span>
                              <span className="text-black font-black text-[10px] ml-1">{bracketData.s1[idx+1]}</span>
                            </div>
                            <div className="absolute top-1/2 -translate-y-1/2 -right-[10px] w-[10px] h-[1px] bg-slate-300" />
                          </div>
                          {idx === 14 && <MiddleSpacer />}
                        </>
                      )
                    })}
                  </div>
                )}
                {bracketData.bracketSize >= 16 && (
                <div className="flex flex-col justify-around min-w-[90px] md:min-w-0 md:flex-1 relative">
                  {[0, 2, 4, 6, 8, 10, 12, 14].map((idx, i) => {
                    const r = bracketData.bracketSize === 32 ? bracketData.r2 : bracketData.r1;
                    const s = bracketData.bracketSize === 32 ? bracketData.s2 : bracketData.s1;
                    const nextR = bracketData.bracketSize === 32 ? bracketData.r3 : bracketData.r2;
                    const p1 = r[idx]; const p2 = r[idx+1];
                    const w1 = p1 && nextR.includes(p1);
                    const w2 = p2 && nextR.includes(p2);
                    const s1 = s[idx]; const s2 = s[idx+1];
                    const seed1 = bracketData.seeds ? bracketData.seeds[p1] : null;
                    const seed2 = bracketData.seeds ? bracketData.seeds[p2] : null;

                    return (
                      <>
                        <div key={idx} className="relative flex flex-col space-y-4">
                          <div className={`h-8 border-b-2 ${w1 ? bracketStyle.borderColor : 'border-slate-300'} flex justify-between items-end bg-white relative`}>
                              <span className={`${p1 === 'BYE' ? 'text-green-600 font-black' : (w1 ? `${bracketStyle.textColor} font-black` : 'text-slate-700 font-bold')} text-xs md:text-sm uppercase truncate`}>
                                  {seed1 ? <span className="text-[11px] text-orange-600 font-black mr-1">{seed1}.</span> : null}{p1 || ""}
                              </span>
                              <span className="text-black font-black text-xs ml-1">{s1}</span>
                          </div>
                          <div className={`h-8 border-b-2 ${w2 ? bracketStyle.borderColor : 'border-slate-300'} flex justify-between items-end relative bg-white`}>
                              <span className={`${p2 === 'BYE' ? 'text-green-600 font-black' : (w2 ? `${bracketStyle.textColor} font-black` : 'text-slate-700 font-bold')} text-xs md:text-sm uppercase truncate`}>
                                  {seed2 ? <span className="text-[11px] text-orange-600 font-black mr-1">{seed2}.</span> : null}{p2 || ""}
                              </span>
                              <span className="text-black font-black text-xs ml-1">{s2}</span>
                          </div>
                          <div className="absolute top-1/2 -translate-y-1/2 -right-[10px] w-[10px] h-[1px] bg-slate-300" />
                        </div>
                        {i === 3 && <MiddleSpacer />}
                      </>
                    );
                  })}
                </div>
                )}
                {/* ... (Resto de columnas de bracket) */}
                <div className="flex flex-col justify-around min-w-[90px] md:min-w-0 md:flex-1 relative">
                  {[0, 2, 4, 6].map((idx, i) => {
                    const r = bracketData.bracketSize === 32 ? bracketData.r3 : (bracketData.bracketSize === 16 ? bracketData.r2 : bracketData.r1);
                    const s = bracketData.bracketSize === 32 ? bracketData.s3 : (bracketData.bracketSize === 16 ? bracketData.s2 : bracketData.s1);
                    const nextR = bracketData.bracketSize === 32 ? bracketData.r4 : (bracketData.bracketSize === 16 ? bracketData.r3 : bracketData.r2);
                    const p1 = r[idx]; const p2 = r[idx+1];
                    const w1 = p1 && nextR.includes(p1);
                    const w2 = p2 && nextR.includes(p2);
                    const s1 = s[idx]; const s2 = s[idx+1];
                    const seed1 = bracketData.seeds ? bracketData.seeds[p1] : null;
                    const seed2 = bracketData.seeds ? bracketData.seeds[p2] : null;

                    return (
                      <>
                        <div key={idx} className="relative flex flex-col space-y-8">
                          <div className={`h-8 border-b-2 ${w1 ? bracketStyle.borderColor : 'border-slate-300'} flex justify-between items-end bg-white relative text-center`}>
                              <span className={`${p1 === 'BYE' ? 'text-green-600 font-black' : (w1 ? `${bracketStyle.textColor} font-black` : 'text-slate-700 font-bold')} text-xs md:text-sm uppercase truncate`}>
                                  {seed1 ? <span className="text-[11px] text-orange-600 font-black mr-1">{seed1}.</span> : null}{p1 || ""}
                              </span>
                              <span className="text-black font-black text-xs ml-1">{s1}</span>
                          </div>
                          <div className={`h-8 border-b-2 ${w2 ? bracketStyle.borderColor : 'border-slate-300'} flex justify-between items-end bg-white relative text-center`}>
                              <span className={`${p2 === 'BYE' ? 'text-green-600 font-black' : (w2 ? `${bracketStyle.textColor} font-black` : 'text-slate-700 font-bold')} text-xs md:text-sm uppercase truncate`}>
                                  {seed2 ? <span className="text-[11px] text-orange-600 font-black mr-1">{seed2}.</span> : null}{p2 || ""}
                              </span>
                              <span className="text-black font-black text-xs ml-1">{s2}</span>
                          </div>
                          <div className="absolute top-1/2 -translate-y-1/2 -right-[10px] w-[10px] h-[1px] bg-slate-300" />
                        </div>
                        {i === 1 && <MiddleSpacer />}
                      </>
                    );
                  })}
                </div>

                <div className="flex flex-col justify-around min-w-[90px] md:min-w-0 md:flex-1 relative">
                  {[0, 2].map((idx, i) => {
                     const r = bracketData.bracketSize === 32 ? bracketData.r4 : (bracketData.bracketSize === 16 ? bracketData.r3 : bracketData.r2);
                     const s = bracketData.bracketSize === 32 ? bracketData.s4 : (bracketData.bracketSize === 16 ? bracketData.s3 : bracketData.s2);
                     const p1 = r[idx]; const p2 = r[idx+1];
                     const w1 = p1 && p1 === bracketData.winner;
                     const w2 = p2 && p2 === bracketData.winner;
                     const s1 = s[idx]; const s2 = s[idx+1];
                     const seed1 = bracketData.seeds ? bracketData.seeds[p1] : null;
                     const seed2 = bracketData.seeds ? bracketData.seeds[p2] : null;
                     return (
                      <>
                        <div key={idx} className="relative flex flex-col space-y-12">
                          <div className={`h-8 border-b-2 ${w1 ? bracketStyle.borderColor : 'border-slate-300'} flex justify-between items-end bg-white relative text-center`}>
                              <span className={`${p1 === 'BYE' ? 'text-green-600 font-black' : (w1 ? `${bracketStyle.textColor} font-black` : 'text-slate-700 font-bold')} text-xs md:text-sm uppercase truncate`}>
                                  {seed1 ? <span className="text-[11px] text-orange-600 font-black mr-1">{seed1}.</span> : null}{p1 || ""}
                              </span>
                              <span className="text-black font-black text-xs ml-1">{s1}</span>
                          </div>
                          <div className={`h-8 border-b-2 ${w2 ? bracketStyle.borderColor : 'border-slate-300'} flex justify-between items-end bg-white relative text-center`}>
                              <span className={`${p2 === 'BYE' ? 'text-green-600 font-black' : (w2 ? `${bracketStyle.textColor} font-black` : 'text-slate-700 font-bold')} text-xs md:text-sm uppercase truncate`}>
                                  {seed2 ? <span className="text-[11px] text-orange-600 font-black mr-1">{seed2}.</span> : null}{p2 || ""}
                              </span>
                              <span className="text-black font-black text-xs ml-1">{s2}</span>
                          </div>
                          <div className="absolute top-1/2 -translate-y-1/2 -right-[10px] w-[10px] h-[1px] bg-slate-300" />
                        </div>
                        {i === 0 && <MiddleSpacer />}
                      </>
                     )
                  })}
                </div>

                <div className="flex flex-col justify-center min-w-[90px] md:min-w-0 md:flex-1 relative">
                    {(() => {
                        let topFinalistName = ""; let botFinalistName = "";
                        if (bracketData.bracketSize === 16 && bracketData.r4 && bracketData.r4.length >= 2) { topFinalistName = bracketData.r4[0]; botFinalistName = bracketData.r4[1]; } 
                        else if (bracketData.bracketSize === 32 && bracketData.r5 && bracketData.r5.length >= 2) { topFinalistName = bracketData.r5[0]; botFinalistName = bracketData.r5[1]; }
                        else if (bracketData.bracketSize === 8 && bracketData.r3 && bracketData.r3.length >= 2) { topFinalistName = bracketData.r3[0]; botFinalistName = bracketData.r3[1]; }
                        else { const semisR = bracketData.bracketSize === 32 ? bracketData.r4 : bracketData.r2; if (bracketData.winner) { topFinalistName = bracketData.winner; botFinalistName = bracketData.runnerUp; } }
                        const isTopWinner = topFinalistName && topFinalistName === bracketData.winner;
                        const isBotWinner = botFinalistName && botFinalistName === bracketData.winner;
                        return (
                            <div className="relative flex flex-col space-y-2">
                                <div className={`h-8 border-b-2 ${isTopWinner ? bracketStyle.borderColor : 'border-slate-300'} flex justify-between items-end bg-white relative`}>
                                    <span className={`${topFinalistName === 'BYE' ? 'text-green-600 font-black' : (isTopWinner ? `${bracketStyle.textColor} font-black` : 'text-slate-700 font-bold')} text-xs md:text-sm uppercase truncate`}>
                                        {topFinalistName || ""}
                                    </span>
                                </div>
                                <div className={`h-8 border-b-2 ${isBotWinner ? bracketStyle.borderColor : 'border-slate-300'} flex justify-between items-end bg-white relative`}>
                                    <span className={`${botFinalistName === 'BYE' ? 'text-green-600 font-black' : (isBotWinner ? `${bracketStyle.textColor} font-black` : 'text-slate-700 font-bold')} text-xs md:text-sm uppercase truncate`}>
                                        {botFinalistName || ""}
                                    </span>
                                </div>
                                <div className="absolute top-1/2 -translate-y-1/2 -right-[10px] w-[10px] h-[1px] bg-slate-300" />
                            </div>
                        );
                    })()}
                </div>

                 <div className="flex flex-col justify-center min-w-[80px] md:min-w-0 md:flex-1 relative">
                    <div className="relative flex flex-col items-center">
                        <div className="h-px w-6 bg-slate-300 absolute left-0 top-1/2 -translate-y-1/2 -ml-1" />
                        <Trophy className={`w-14 h-14 ${bracketStyle.trophyColor} mb-2 animate-bounce`} />
                        <span className={`text-xs md:text-base font-black uppercase tracking-[0.2em] mb-1 scale-125 ${bracketStyle.textColor} opacity-70`}>CAMPEÓN</span>
                        <span className="text-[#b35a38] font-black text-lg md:text-xl italic uppercase text-center w-full block drop-shadow-sm leading-tight">{bracketData.winner || ""}</span>
                    </div>
                </div>
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <AlertCircle className="w-20 h-20 mb-4 opacity-50" />
                <h3 className="text-2xl font-black uppercase tracking-wider mb-2">Cuadro no definido aún</h3>
                {bracketData.canGenerate ? (
                    <div className="mt-4">
                        <p className="font-medium text-slate-500 mb-4">Se encontraron clasificados en el sistema.</p>
                        <div className="flex gap-2 justify-center">
                            {tournaments.find(t => t.short === navState.tournamentShort)?.type === 'direct' ? (
                            <Button onClick={() => runDirectDraw(navState.category, navState.tournamentShort)} className="bg-orange-500 text-white font-bold px-8 shadow-lg"> <Shuffle className="mr-2 w-4 h-4" /> Sortear </Button>
                            ) : (
                            <Button onClick={() => fetchQualifiersAndDraw(navState.category, navState.tournamentShort)} className="bg-orange-500 text-white font-bold px-8 shadow-lg"> <Shuffle className="mr-2 w-4 h-4" /> Sortear </Button>
                            )}
                        </div>
                    </div>
                ) : ( <p className="font-medium text-slate-500">Los cruces para este torneo estarán disponibles próximamente.</p> )}
              </div>
            )}
          </div>
        )}
        {showRankingCalc && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative max-h-[80vh] overflow-y-auto">
                    <Button onClick={() => setShowRankingCalc(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500" variant="ghost"> <X className="w-6 h-6" /> </Button>
                    <div className="text-center mb-6">
                        <Trophy className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                        <h3 className="text-2xl font-black uppercase text-slate-800">Cálculo de Puntos</h3>
                        <p className="text-sm text-slate-500 font-medium">Torneo: {navState.tournamentShort}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl border-2 border-slate-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-[#b35a38] text-white">
                                <tr>
                                    <th className="p-3 font-bold text-sm uppercase tracking-wider">Jugador</th>
                                    <th className="p-3 font-bold text-sm uppercase tracking-wider text-right">Puntos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {calculatedRanking.map((p, i) => (
                                    <tr key={i} className="hover:bg-white transition-colors">
                                        <td className="p-3 font-bold text-slate-700 uppercase text-sm">{p.name}</td>
                                        <td className="p-3 font-black text-orange-600 text-right">{p.points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6 flex gap-4">
                        <Button onClick={() => {
                            const text = calculatedRanking.map(p => `${p.name}\t${p.points}`).join('\n');
                            navigator.clipboard.writeText(text);
                            alert("Tabla copiada al portapapeles");
                        }} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold h-12 rounded-xl"> <Copy className="mr-2 w-4 h-4" /> COPIAR TABLA </Button>
                        <Button onClick={() => {
                            let mensaje = `*RANKING CALCULADO - ${navState.tournamentShort}*\n\n`;
                            calculatedRanking.forEach(p => { mensaje += `${p.name}: ${p.points}\n`; });
                            window.open(`https://wa.me/${MI_TELEFONO}?text=${encodeURIComponent(mensaje)}`, '_blank');
                        }} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-xl"> <Send className="mr-2 w-4 h-4" /> ENVIAR POR WHATSAPP </Button>
                    </div>
                </div>
            </div>
        )}
        {navState.level === "ranking-view" && (
          <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden text-center text-center">
            <div className="bg-[#b35a38] p-6 rounded-2xl mb-8 text-white italic text-center">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-wider text-center">{navState.selectedCategory} {navState.year}</h2>
            </div>
            {headers.length > 0 && rankingData.length > 0 ? (
              <div className="overflow-x-auto text-center">
                <table className="w-full text-lg font-bold text-center">
                  <thead>
                    <tr className="bg-[#b35a38] text-white">
                      <th className="p-4 text-center font-black first:rounded-tl-xl text-center">POS</th>
                      <th className="p-4 text-center font-black text-center text-center">JUGADOR</th>
                      {headers.map((h, i) => (<th key={i} className="p-4 text-center font-black hidden sm:table-cell text-center">{h}</th>))}
                      <th className="p-4 text-center font-black bg-[#8c3d26] last:rounded-tr-xl text-center text-center">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingData.map((p, i) => (
                      <tr key={i} className="border-b border-[#fffaf5] hover:bg-[#fffaf5] text-center text-center">
                        <td className="p-4 text-slate-400 text-center">{i + 1}</td>
                        <td className="p-4 uppercase text-slate-700 text-center">{p.name}</td>
                        {p.points.map((val: any, idx: number) => (<td key={idx} className="p-4 text-center text-slate-400 hidden sm:table-cell text-center">{val || 0}</td>))}
                        <td className="p-4 text-[#b35a38] text-2xl font-black bg-[#fffaf5] text-center">{p.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (<div className="h-64 flex items-center justify-center text-slate-300 uppercase font-black animate-pulse text-center">Cargando datos...</div>)}
          </div>
        )}
      </div>
      <p 
        onClick={handleFooterClick}
        className="text-center text-slate-500/80 mt-12 text-sm font-bold uppercase tracking-widest animate-pulse text-center cursor-pointer select-none active:scale-95 transition-transform"
      >
        Sistema de seguimiento de torneos en vivo
      </p>
    </div>
  );
}