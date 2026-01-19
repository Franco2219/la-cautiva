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
  "adelaide": {
    color: "bg-blue-900",
    borderColor: "border-blue-900",
    textColor: "text-blue-900",
    trophyColor: "text-blue-900",
    logo: "/logos/adelaide.png",
    pointsLogo: null
  },
  "ao": {
    color: "bg-blue-900",
    borderColor: "border-blue-900",
    textColor: "text-blue-900",
    trophyColor: "text-blue-900",
    logo: "/logos/ao.png",
    pointsLogo: null
  },
  "us": {
    color: "bg-blue-900",
    borderColor: "border-blue-900",
    textColor: "text-blue-900",
    trophyColor: "text-blue-900",
    logo: "/logos/usopen.png",
    pointsLogo: null
  },
  "iw": {
    color: "bg-blue-900",
    borderColor: "border-blue-900",
    textColor: "text-blue-900",
    trophyColor: "text-blue-900",
    logo: "/logos/indianwells.png",
    pointsLogo: "/logos/pts_indianwells.png"
  },
  "masters": {
    color: "bg-blue-950",
    borderColor: "border-blue-950",
    textColor: "text-blue-950",
    trophyColor: "text-blue-950",
    logo: "/logos/masters.png",
    pointsLogo: null
  },
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
  "rg": {
    color: "bg-[#b35a38]",
    borderColor: "border-[#b35a38]",
    textColor: "text-[#b35a38]",
    trophyColor: "text-[#b35a38]",
    logo: "/logos/rg.svg",
    pointsLogo: null
  },
  "mc": {
    color: "bg-[#b35a38]",
    borderColor: "border-[#b35a38]",
    textColor: "text-[#b35a38]",
    trophyColor: "text-[#b35a38]",
    logo: "/logos/mc.png",
    pointsLogo: "/logos/pts_mc.png"
  },
  "s8_500": {
    color: "bg-[#b35a38]",
    borderColor: "border-[#b35a38]",
    textColor: "text-[#b35a38]",
    trophyColor: "text-[#b35a38]",
    logo: "/logos/s8_500.png",
    pointsLogo: "/logos/pts_s8_500.png"
  },
  "s8_250": {
    color: "bg-[#b35a38]",
    borderColor: "border-[#b35a38]",
    textColor: "text-[#b35a38]",
    trophyColor: "text-[#b35a38]",
    logo: "/logos/s8_250.png",
    pointsLogo: "/logos/pts_s8_250.png"
  },
  // FALLBACK
  "default": {
    color: "bg-[#b35a38]",
    borderColor: "border-[#b35a38]",
    textColor: "text-[#b35a38]",
    trophyColor: "text-[#b35a38]",
    logo: "/logo.png",
    pointsLogo: null
  }
};

export default function Home() {
  const [navState, setNavState] = useState({ level: "home" } as any)
  const [rankingData, setRankingData] = useState([] as any[])
  const [headers, setHeaders] = useState([] as string[])
  const [bracketData, setBracketData] = useState({ r1: [], s1: [], r2: [], s2: [], r3: [], s3: [], r4: [], s4: [], r5: [], s5: [], winner: "", runnerUp: "", bracketSize: 16, hasData: false, canGenerate: false, seeds: {} } as any);
  const [groupData, setGroupData] = useState([] as any[])
  const [isSorteoConfirmado, setIsSorteoConfirmado] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [generatedBracket, setGeneratedBracket] = useState([] as any[])
  const [isFixedData, setIsFixedData] = useState(false)
  const [footerClicks, setFooterClicks] = useState(0);
  const [showRankingCalc, setShowRankingCalc] = useState(false);
  const [calculatedRanking, setCalculatedRanking] = useState([] as any[]);

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
    let mensaje = `*PARTIDOS - ${getTournamentName(navState.tournamentShort || navState.currentTour)}*\n\n`;
    
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
          idx = rankNames.findIndex(rankName => rankName.includes(parts));
        }
        return idx === -1 ? 99999 : idx;
      };

      const headerRow = rows;
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
            if (groupRows[i] && groupRows[i] && (groupRows[i].includes("Zona") || groupRows[i].includes("Grupo"))) {
              const players = [groupRows[i+1]?., groupRows[i+2]?., groupRows[i+3]?., groupRows[i+4]?.].filter(p => p && p !== "-" && p !== "");
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
                          if(parts > parts[1]) sW++; else sL++;
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
        total: row[2] ? parseInt(row[2]) : 0
      })).filter(p => p.name !== "");

      const inscUrl = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=Inscriptos`;
      const inscRes = await fetch(inscUrl);
      const inscCsv = await inscRes.text();
      const filteredInscriptos = parseCSV(inscCsv).slice(1).filter(cols => 
        cols === tournamentShort && cols[1] === categoryShort
      ).map(cols => cols[3]);

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
      if (bracketSize === 16) pos58 = [3-6];
      else if (bracketSize === 32) pos58 = [7-10];
      else if (bracketSize === 64) pos58 = [11-14];

      const seeds = entryList.slice(0, 16).map((p, i) => ({ ...p, rank: i + 1 }));

      if (seeds) slots[pos1] = seeds;
      if (seeds[1]) slots[pos2] = seeds[1];
      if (seeds[3] && seeds[15]) {
        const group34 = [seeds[3], seeds[15]].sort(() => Math.random() - 0.5);
        slots[pos34] = group34; slots[pos34[1]] = group34[1];
      } else if (seeds[3]) { slots[pos34[Math.floor(Math.random()*2)]] = seeds[3]; }

      if (seeds.length >= 8 && pos58.length === 4) {
        const group58 = seeds.slice(4, 8).sort(() => Math.random() - 0.5);
        const seedsTop = group58.slice(0, 2);
        const seedsBot = group58.slice(2, 4);
        
        const posTop = [pos58, pos58[1]].sort(() => Math.random() - 0.5);
        slots[posTop] = seedsTop; slots[posTop[1]] = seedsTop[1];

        const posBot = [pos58[3], pos58[15]].sort(() => Math.random() - 0.5);
        slots[posBot] = seedsBot; slots[posBot[1]] = seedsBot[1];
      }
      
      if (bracketSize === 64 && seeds.length >= 16) {
        const group9to16 = seeds.slice(8, 16).sort(() => Math.random() - 0.5);
        const pos9to16 = [7-10, 16-19].sort(() => Math.random() - 0.5);
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
          return topPairs.splice(randIdx, 1);
        } else if (botPairs.length > 0) {
          const randIdx = Math.floor(Math.random() * botPairs.length);
          return botPairs.splice(randIdx, 1);
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

      let countTop = slots.slice(0, bracketSize/2).filter(x => x !== null && x.name !== "BYE").length;
      let countBot = slots.slice(bracketSize/2).filter(x => x !== null && x.name !== "BYE").length;
      
      let emptySlots = slots.map((s, i) => s === null ? i : -1).filter(i => i !== -1);

      // CORRECCIÓN 5: Balanceo estricto
      for (const player of nonSeeds) {
        const emptyTop = emptySlots.filter(i => i < bracketSize/2);
        const emptyBot = emptySlots.filter(i => i >= bracketSize/2);
        let targetIdx = -1;

        if (countTop < countBot && emptyTop.length > 0) targetIdx = emptyTop[Math.floor(Math.random() * emptyTop.length)];
        else if (countBot < countTop && emptyBot.length > 0) targetIdx = emptyBot[Math.floor(Math.random() * emptyBot.length)];
        else {
           // Si están iguales, elegir al azar o priorizar top si hay espacio
           if (emptyTop.length > 0 && emptyBot.length > 0) {
               targetIdx = Math.random() > 0.5 ? emptyTop[Math.floor(Math.random() * emptyTop.length)] : emptyBot[Math.floor(Math.random() * emptyBot.length)];
           } else if (emptyTop.length > 0) {
               targetIdx = emptyTop[Math.floor(Math.random() * emptyTop.length)];
           } else if (emptyBot.length > 0) {
               targetIdx = emptyBot[Math.floor(Math.random() * emptyBot.length)];
           }
        }

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
      setIsSorteoConfirmado(false);

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
        total: row[2] ? parseInt(row[2]) : 0
      })).filter(p => p.name !== "");

      const inscUrl = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=Inscriptos`;
      const inscRes = await fetch(inscUrl);
      const inscCsv = await inscRes.text();
      const filteredInscriptos = parseCSV(inscCsv).slice(1).filter(cols => 
        cols === tournamentShort && cols[1] === categoryShort
      ).map(cols => cols[3]);

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

      // CORRECCIÓN 4: Grupos de 2 al final
      capacities = capacities.sort((a, b) => b - a);

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

      if (res.ok && !csvText.includes("") && (csvText.includes("Zona") || csvText.includes("Grupo"))) {
        const rows = parseCSV(csvText);
        const parsedGroups = [];
        
        for (let i = 0; i < rows.length; i++) {
          if (rows[i] && rows[i] && (rows[i].includes("Zona") || rows[i].includes("Grupo"))) {
            const potentialP4 = rows[i+4] && rows[i+4];
            const isNextHeader = potentialP4 && typeof potentialP4 === 'string' && (potentialP4.toLowerCase().includes("zona") || potentialP4.toLowerCase().includes("grupo") || potentialP4.includes("*"));
            const p4 = !isNextHeader && potentialP4 && potentialP4 !== "-" ? rows[i+4] : null;

            const playersRaw = [rows[i+1], rows[i+2], rows[i+3]];
            if (p4) playersRaw.push(p4);

            const validPlayersIndices: any[] = [];
            const players: any[] = [];
            const positions: any[] = [];
            const points: any[] = [];
            const diff: any[] = [];
            const gamesDiff: any[] = [];

            playersRaw.forEach((row, index) => {
              const pName = row && row ? row : "";
              if (pName && pName !== "-" && pName !== "" && 
                  !pName.toLowerCase().includes("zona") && 
                  !pName.toLowerCase().includes("grupo") &&
                  !pName.includes("*")) {
                players.push(pName);
                let rawPos = row[20] || ""; if (rawPos.startsWith("#")) rawPos = "-"; positions.push(rawPos);
                let rawPts = row[4] || ""; if (rawPts.startsWith("#")) rawPts = ""; points.push(rawPts);
                let rawDif = row[21] || ""; if (rawDif.startsWith("#")) rawDif = ""; diff.push(rawDif);
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
              groupName: rows[i],
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
    let mensaje = `*SORTEO CONFIRMADO - ${getTournamentName(navState.currentTour)}*\n*Categoría:* ${navState.currentCat}\n\n`;
    groupData.forEach(g => { mensaje += `*${g.groupName}*\n${g.players.join('\n')}\n`; });
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

    const calculateRanks = () => {
      return group.positions || [];
    };
    const displayRanks = calculateRanks();

    return (
      <div className="mb-8 border-2 border-[#b35a38]/30 rounded-lg overflow-hidden shadow-sm">
        <div className="bg-[#b35a38]/10 p-2 font-bold text-[#b35a38] text-center border-b border-[#b35a38]/20">{group.groupName}</div>
        <div className="grid grid-cols-[3fr_repeat(4,1fr)] bg-white text-xs">
          <div className="p-2 border-r border-b font-bold text-gray-600 flex items-center">JUGADOR</div>
          {group.players && group.players.map((p: string, i: number) => {
            let shortName = p;
            if (p) {
              const clean = p.replace(/,/g, "").trim().split(/\s+/);
              if (clean.length > 1) shortName = `${clean} ${clean[1].charAt(0)}.`;
              else shortName = clean;
            }
            return (
               <div key={i} className="p-2 border-b flex items-center justify-center font-bold bg-gray-50">{shortName}</div>
            )
          })}
        </div>
        
        {isComplete && (
            <div className="grid grid-cols-[3fr_repeat(4,1fr)] bg-gray-100 text-xs border-b border-[#b35a38]/20">
                <div className="p-1 text-right font-bold pr-2">PTS</div>
                <div className="p-1 text-center font-bold">SETS</div>
                {showGames && <div className="p-1 text-center font-bold">GAMES</div>}
                <div className="p-1 text-center font-bold text-[#b35a38]">POS</div>
            </div>
        )}

        <div className="grid grid-cols-[3fr_repeat(4,1fr)] bg-white text-sm">
           {group.players && group.players.map((p1: string, i: number) => (
             <div key={i} className="contents">
                <div className="p-2 border-r border-b font-medium truncate text-gray-800 flex items-center">{p1}</div>
                {group.players.map((p2: string, j: number) => (
                  <div key={j} className={`p-1 border-b flex items-center justify-center ${i===j ? 'bg-gray-200' : ''}`}>
                    {i === j ? "/" : (group.results[i] && group.results[i][j] ? group.results[i][j] : "-")}
                  </div>
                ))}
                
                {isComplete && (
                    <>
                        <div className="p-1 border-b flex items-center justify-center font-bold bg-blue-50/50">{group.points ? group.points[i] : "-"}</div>
                        <div className="p-1 border-b flex items-center justify-center text-xs text-gray-500">{group.diff ? group.diff[i] : "-"}</div>
                        {showGames && <div className="p-1 border-b flex items-center justify-center text-xs text-gray-500">{group.gamesDiff ? group.gamesDiff[i] : "-"}</div>}
                        <div className="p-1 border-b flex items-center justify-center font-black text-[#b35a38] bg-yellow-50">{displayRanks[i] || "-"}°</div>
                    </>
                )}
             </div>
           ))}
        </div>
      </div>
    );
  };

  const generatePlayoffBracket = (qualifiers: any[]) => {
    const totalPlayers = qualifiers.length;

    // --- LÓGICA ORIGINAL PARA 32 JUGADORES O MENOS ---
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
      if (mids.length > 0) matches[idxMidTop].p1 = mids;
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
    // --- LÓGICA NUEVA PARA > 32 JUGADORES (MODO GRAND SLAM - CORRECCIÓN 5) ---
    else {
      const bracketSize = 64;
      const numMatches = 32; // bracketSize / 2
      const byeCount = bracketSize - totalPlayers;

      const winners = qualifiers.filter(q => q.rank === 1).sort((a, b) => a.groupIndex - b.groupIndex);
      const runners = qualifiers.filter(q => q.rank === 2).sort(() => Math.random() - 0.5);

      // Prioridad Byes: Zonas 1 a 8
      const maxPriorityByes = 8;
      const priorityByeZones = new Set();
      for(let i=0; i<Math.min(byeCount, maxPriorityByes); i++) {
        if(winners[i]) priorityByeZones.add(winners[i].groupIndex);
      }

      let matches: any[] = Array(numMatches).fill(null).map(() => ({ p1: null, p2: null }));

      const placeP1 = (winner: any, index: number) => {
        if (!winner) return;
        matches[index].p1 = winner;
        if (priorityByeZones.has(winner.groupIndex)) {
          matches[index].p2 = { name: "BYE", rank: 0, groupIndex: -1 };
        }
      };

      // Regla 1: Z1 Top, Z2 Bottom, Z3/Z4 Mids
      if (winners) placeP1(winners, 0); // Z1
      if (winners[1]) placeP1(winners[1], numMatches - 1); // Z2
      
      const mids = [winners[3], winners[15]].filter(Boolean);
      if (mids.length > 0) {
         if (Math.random() > 0.5) mids.reverse();
         if (mids) placeP1(mids, (numMatches/2) - 1);
         if (mids[1]) placeP1(mids[1], (numMatches/2));
      }

      // Regla 2: Z5-Z8 Lejos de Z1-Z4
      const safeIndices = [7-10].sort(() => Math.random() - 0.5);
      const z5to8 = winners.slice(4, 8);
      z5to8.forEach(w => {
        if (safeIndices.length > 0) placeP1(w, safeIndices.pop()!);
        else {
           const emptyIdx = matches.findIndex(m => m.p1 === null);
           if (emptyIdx !== -1) placeP1(w, emptyIdx);
        }
      });

      // Resto de los ganadores (Z9+)
      const remainingWinners = winners.slice(8);
      const emptyIndicesP1 = matches.map((m, i) => m.p1 === null ? i : -1).filter(i => i !== -1).sort(() => Math.random() - 0.5);
      remainingWinners.forEach(w => {
         if (emptyIndicesP1.length > 0) placeP1(w, emptyIndicesP1.pop()!);
      });

      // --- DISTRIBUCIÓN DE RUNNERS (REGLA 4 + CORRECCIÓN 5: BALANCE) ---
      const runnersTop = [];
      const runnersBot = [];
      const runnersFree = [];

      runners.forEach(r => {
        const winnerMatchIndex = matches.findIndex(m => m.p1 && m.p1.groupIndex === r.groupIndex);
        if (winnerMatchIndex !== -1) {
          if (winnerMatchIndex < numMatches / 2) runnersBot.push(r);
          else runnersTop.push(r);
        } else {
          runnersFree.push(r);
        }
      });

      runnersTop.sort(() => Math.random() - 0.5);
      runnersBot.sort(() => Math.random() - 0.5);
      runnersFree.sort(() => Math.random() - 0.5);

      // Llenar P1s vacíos de Arriba con RunnersTop
      for(let i=0; i < numMatches/2; i++) {
        if (!matches[i].p1 && runnersTop.length > 0) matches[i].p1 = runnersTop.pop();
      }
      // Llenar P1s vacíos de Abajo con RunnersBot
      for(let i=numMatches/2; i < numMatches; i++) {
        if (!matches[i].p1 && runnersBot.length > 0) matches[i].p1 = runnersBot.pop();
      }

      // Balancear sobrantes (RunnersFree + Sobrantes de Top/Bot)
      const allRemainingRunners = [...runnersTop, ...runnersBot, ...runnersFree].sort(() => Math.random() - 0.5);
      
      // Contar jugadores reales (no null, no BYE) en Top y Bottom actualmente en P1
      let playersTop = matches.slice(0, numMatches/2).filter(m => m.p1 && m.p1.name !== "BYE").length;
      let playersBot = matches.slice(numMatches/2).filter(m => m.p1 && m.p1.name !== "BYE").length;
      
      const emptyP1Indices = matches.map((m, i) => m.p1 === null ? i : -1).filter(i => i !== -1);
      
      // Llenar huecos P1 balanceando
      for (const idx of emptyP1Indices) {
          if (allRemainingRunners.length > 0) {
             const isTopSlot = idx < numMatches / 2;
             // Si es un slot de arriba, pero arriba ya tiene muchos más jugadores que abajo, deberíamos intentar evitarlo...
             // Pero el slot es fijo. Lo que hacemos es: Si asignamos aqui, aumenta el contador.
             // La logica anterior fallaba al no tener "donde elegir". Aqui el slot es fijo, elegimos si poner jugador o BYE (si se acabaran).
             // PERO, aqui asumimos que los runners SIEMPRE son jugadores reales.
             matches[idx].p1 = allRemainingRunners.pop();
             if (isTopSlot) playersTop++; else playersBot++;
          } else {
             matches[idx].p1 = { name: "BYE", rank: 0 };
          }
      }

      // Paso B: Llenar P2 vacíos (Rivales)
      // Calculamos cuántos Byes faltan colocar en total
      let currentByesPlaced = matches.filter(m => (m.p1 && m.p1.name === "BYE") || (m.p2 && m.p2.name === "BYE")).length;
      // Si pusimos algun BYE en P1, cuenta.
      
      // Queremos balancear los BYEs restantes para que los jugadores reales queden parejos.
      // Total Jugadores Reales = totalPlayers.
      // Ya colocamos todos los Winners y Runners en P1 o P2 (si tienen bye fijo).
      // Faltan colocar los runners que van a P2.
      
      // Realmente, lo que queda en allRemainingRunners va a P2.
      // Como ya vaciamos allRemainingRunners en P1, la bolsa "finalPool" son los que quedan por ubicar (que deberian ser 0 si hicimos bien la cuenta, a menos que haya P2 vacios).
      
      const finalPool = [...allRemainingRunners]; // Debería estar vacía si P1 consumió todo, o tener gente si sobraron.
      // Ah, espera, los que "sobran" para P2 son los que no entraron en P1. Pero arriba iteramos emptyP1Indices.
      // Si faltaron slots en P1 (imposible, hay 32 matches), entonces todos los runners estan asignados.
      // ERROR LOGICO EN MI RAZONAMIENTO: Los runners van a P2 si el P1 ya tiene dueño (Winner).
      // La logica de "runnersTop/Bot" era para P1 vacios? NO.
      // La logica original era: Runners van a P2 de su zona opuesta. Si no hay lugar, van a huecos.
      
      // CORRECCIÓN FINAL BALANCE:
      // Usar la bolsa final para llenar los P2 vacíos, distribuyendo equitativamente.
      
      const emptyP2Indices = matches.map((m, i) => m.p2 === null ? i : -1).filter(i => i !== -1);
      // Separar indices vacios de P2 en Top y Bot
      const emptyP2Top = emptyP2Indices.filter(i => i < numMatches/2);
      const emptyP2Bot = emptyP2Indices.filter(i => i >= numMatches/2);
      
      // Tenemos finalPool vacía porque usamos allRemainingRunners para P1? 
      // No, allRemainingRunners solo se usó para rellenar P1 vacíos. 
      // Si todos los P1 estaban llenos (muchos winners), allRemainingRunners tiene gente.
      
      // Iterar la bolsa final y asignar intentando igualar playersTop vs playersBot
      while(finalPool.length > 0) {
          const p = finalPool.pop();
          // ¿Donde lo pongo?
          let targetIdx = -1;
          
          if (playersTop <= playersBot && emptyP2Top.length > 0) {
             targetIdx = emptyP2Top.pop()!; // Saca del array de indices
             playersTop++;
          } else if (playersBot < playersTop && emptyP2Bot.length > 0) {
             targetIdx = emptyP2Bot.pop()!;
             playersBot++;
          } else {
             // Si no hay lugar en el lado preferido, usar el otro
             if (emptyP2Top.length > 0) { targetIdx = emptyP2Top.pop()!; playersTop++; }
             else if (emptyP2Bot.length > 0) { targetIdx = emptyP2Bot.pop()!; playersBot++; }
          }
          
          if (targetIdx !== -1) matches[targetIdx].p2 = p;
      }
      
      // Los P2 que sigan null son BYEs
      matches.forEach(m => {
          if (!m.p2) m.p2 = { name: "BYE", rank: 0 };
      });

      // Limpieza final
      matches.forEach(m => {
        if (!m.p1) m.p1 = { name: "BYE", rank: 0 };
        if (!m.p2) m.p2 = { name: "BYE", rank: 0 };
        if (m.p1.name === "BYE" && m.p2.name !== "BYE") {
           const temp = m.p1; m.p1 = m.p2; m.p2 = temp;
        }
      });

      return { matches, bracketSize };
    }
  }

  const fetchQualifiersAndDraw = async (category: string, tournamentShort: string) => {
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
        if (rows[i]) {
          const winnerName = rows[i][22];
          const runnerName = rows[i][6];
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
    let mensaje = `*SORTEO CUADRO FINAL - ${getTournamentName(navState.tournamentShort)}*\n*Categoría:* ${navState.category}\n\n`;
    generatedBracket.forEach((match) => {
      const p1Name = match.p1 ? match.p1.name : "TBD";
      const p2Name = match.p2 ? match.p2.name : "TBD";
      mensaje += `${p1Name}\n${p2Name}\n`;
    });
    window.open(`https://wa.me/${MI_TELEFONO}?text=${encodeURIComponent(mensaje)}`, '_blank');
    // CORRECCIÓN 3: Mostrar estado confirmado en UI
    setIsSorteoConfirmado(true);
  }

  const fetchRankingData = async (categoryShort: string, year: string) => {
    setIsLoading(true); setRankingData([]); setHeaders([]);
    const sheetId = year === "2025" ? ID_2025 : ID_DATOS_GENERALES;
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(`${categoryShort} ${year}`)}`;
    try {
      const response = await fetch(url);
      const csvText = await response.text();
      const rows = parseCSV(csvText);
      if (rows.length > 0) {
        setHeaders(year === "2025" ? rows.slice(2, 9) : rows.slice(2, 11));
        setRankingData(rows.slice(1).map(row => ({
          name: row[1],
          points: year === "2025" ? row.slice(2, 9) : row.slice(2, 11),
          total: year === "2025" ? (parseInt(row[23]) || 0) : (parseInt(row[2]) || 0)
        })).filter(p => p.name).sort((a, b) => b.total - a.total));
      }
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  }

  const fetchBracketData = async (category: string, tournamentShort: string) => {
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
             const count = rows.filter(r => r === tournamentShort && r[1] === category).length;
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
             for(let i=0; i<rowsGroups.length; i++) {
                 const hasGroupData = rowsGroups[i] && rowsGroups[i].length > 5 && rowsGroups[i][4] && rowsGroups[i][4] !== "" && rowsGroups[i][4] !== "-";
                 const hasQualifiersList = rowsGroups[i] && rowsGroups[i][22] && rowsGroups[i][22] !== "" && rowsGroups[i][22] !== "-";
                 if (hasGroupData || hasQualifiersList) { foundQualifiers = true; break; }
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
      const firstCell = rows.length > 0 && rows ? rows.toString().toLowerCase() : "";
      const invalidKeywords = ["formato", "cant", "zona", "pareja", "inscripto", "ranking", "puntos", "nombre", "apellido", "torneo", "fecha"];
      const isInvalidSheet = invalidKeywords.some(k => firstCell.includes(k));
      const hasContent = rows.length > 0 && !isInvalidSheet && firstCell !== "" && firstCell !== "-";

      if (hasContent) {
        const playersInCol1 = rows.filter(r => r && r.trim() !== "" && r !== "-").length;
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
              total: row[2] ? parseInt(row[2]) : 0
           })).filter(p => p.name !== "");
           const inscUrl = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=Inscriptos`;
           const inscRes = await fetch(inscUrl);
           const inscTxt = await inscRes.text();
           const filteredInscriptos = parseCSV(inscTxt).slice(1).filter(cols => 
              cols === tournamentShort && cols[1] === category
           ).map(cols => cols[3]);
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
        const winner = (winnerIdx !== -1 && rows && rows[winnerIdx]) ? rows[winnerIdx] : "";
        const runnerUp = (winner && winnerIdx !== -1 && rows.length > 1 && rows[1][winnerIdx]) ? rows[1][winnerIdx] : "";

        // CORRECCIÓN 2: No filtrar vacíos para mantener la estructura vertical del cuadro
        const getColData = (colIdx: number, limit: number) => rows.map(r => (r[colIdx] && r[colIdx] !== "-") ? r[colIdx] : "").slice(0, limit);
        const getScoreData = (colIdx: number, limit: number) => rows.map(r => r[colIdx] || "").slice(0, limit);

        if (bracketSize === 32) {
          rawData = {
            r1: getColData(0, 32), s1: getScoreData(1, 32),
            r2: getColData(2, 16), s2: getScoreData(3, 16),
            r3: getColData(4, 8), s3: getScoreData(5, 8),
            r4: getColData(6, 4), s4: getScoreData(7, 4),
            r5: getColData(8, 2), s5: getScoreData(9, 2),
            winner: winner, runnerUp: runnerUp, bracketSize: 32, hasData: true, canGenerate: false, seeds: seeds
          };
        } else if (bracketSize === 16) {
          rawData = {
            r1: getColData(0, 16), s1: getScoreData(1, 16),
            r2: getColData(2, 8), s2: getScoreData(3, 8),
            r3: getColData(4, 4), s3: getScoreData(5, 4),
            r4: getColData(6, 2), s4: getScoreData(7, 2),
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
    <div className="flex flex-col bg-white border rounded shadow p-2 text-sm h-full justify-center">
      <div className="flex justify-between border-b pb-1 mb-1">
        <span className="text-gray-400 text-xs">{match.p1 && (match.p1.rank > 0 ? (match.p1.groupIndex !== undefined ? `${match.p1.rank}º Z${match.p1.groupIndex + 1}` : `${match.p1.rank}.`) : "")}</span>
        <span className="font-bold truncate">{match.p1 ? match.p1.name : ""}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400 text-xs">{match.p2 && match.p2.name !== 'BYE' && (match.p2.rank > 0 ? (match.p2.groupIndex !== undefined ? `${match.p2.rank}º Z${match.p2.groupIndex + 1}` : `${match.p2.rank}.`) : "")}</span>
        <span className="font-bold truncate">{match.p2 ? match.p2.name : ""}</span>
      </div>
    </div>
  );

  const MiddleSpacer = () => (
    <div className="flex items-center justify-center my-4">
      <div className="h-px bg-gray-300 w-full"></div>
    </div>
  );

  const bracketStyle = getTournamentStyle(navState.tournamentShort);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-4 max-w-md mx-auto relative">
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={50} height={50} className="rounded-full" />
            <div>
                <h1 className="font-bold text-[#b35a38] leading-none">La Cautiva</h1>
                <p className="text-xs text-slate-400 font-semibold">Club de Tenis</p>
            </div>
        </div>
        {navState.level !== "home" && <Button onClick={goBack} variant="ghost" size="sm" className="text-[#b35a38] hover:bg-[#b35a38]/10"><ArrowLeft className="mr-1 h-4 w-4" /> VOLVER</Button>}
      </div>

      {isLoading && 
        <div className="absolute inset-0 z-50 bg-white/80 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="h-12 w-12 text-[#b35a38] animate-spin" />
        </div>
      }

      <div className="w-full space-y-4 flex-1">
        
        {navState.level === "home" && <Button onClick={() => setNavState({ level: "main-menu" })} className="w-full h-28 text-2xl bg-[#b35a38] text-white font-black rounded-3xl border-b-8 border-[#8c3d26]">INGRESAR</Button>}

        {navState.level === "main-menu" && 
            <div className="grid gap-4">
                <Button onClick={() => setNavState({ level: "category-selection", type: "caballeros" })} className={buttonStyle}><Trophy className="mr-2" />CABALLEROS</Button>
                <Button onClick={() => setNavState({ level: "category-selection", type: "damas" })} className={buttonStyle}><Users className="mr-2" />DAMAS</Button>
                <Button onClick={() => setNavState({ level: "year-selection", type: "ranking" })} className={buttonStyle}><List className="mr-2" /> RANKING</Button>
            </div>
        }

        {navState.level === "year-selection" && 
            <div className="grid gap-4">
                <Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2025" })} className={buttonStyle}>Ranking 2025</Button>
                <Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2026" })} className={buttonStyle}>Ranking 2026</Button>
            </div>
        }

        {navState.level === "category-selection" && (
            <div className="grid gap-4">
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
            <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-center text-[#b35a38]">Fases del Torneo</h2>
                <div className="grid gap-4">
                    {navState.hasGroups ? (
                        <>
                            <Button onClick={() => setNavState({ ...navState, level: "group-phase" })} className={buttonStyle}><Grid3x3 className="mr-2" /> Fase de Grupos</Button>
                            <Button onClick={() => {
                                const tourName = getTournamentName(navState.currentTour);
                                fetchBracketData(navState.currentCat, navState.currentTour);
                                setNavState({ ...navState, level: "direct-bracket", tournament: tourName, tournamentShort: navState.currentTour });
                            }} className={buttonStyle}><Trophy className="mr-2" /> Cuadro Final</Button>
                        </>
                    ) : (
                        <>
                             <Button onClick={() => runATPDraw(navState.currentCat, navState.currentTour)} className={buttonStyle}><Shuffle className="mr-2" /> Realizar Sorteo ATP</Button>
                             <Button onClick={() => {
                                const tourName = getTournamentName(navState.currentTour);
                                fetchBracketData(navState.currentCat, navState.currentTour);
                                setNavState({ ...navState, level: "direct-bracket", tournament: tourName, tournamentShort: navState.currentTour });
                            }} className={buttonStyle}><Trophy className="mr-2" /> Cuadro de Eliminación</Button>
                        </>
                    )}
                </div>
            </div>
        )}

        {navState.level === "generate-bracket" && (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl text-white font-bold text-center shadow-lg ${bracketStyle.color}`}>
               <h2 className="text-xl">
                 {navState.bracketSize === 64 ? "Sorteo 32avos" : 
                  navState.bracketSize === 32 ? "Sorteo 16avos" : 
                  navState.bracketSize === 16 ? "Sorteo Octavos" : 
                  navState.bracketSize === 8 ? "Sorteo Cuartos" : "Sorteo Semis"}
               </h2>
               <p className="text-sm opacity-90">{getTournamentName(navState.tournamentShort)} - {navState.category}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              {generatedBracket.map((match, i) => (
                <>
                  <GeneratedMatch key={i} match={match} />
                  {i === (generatedBracket.length / 2) - 1 && (
                     <div className="col-span-2 text-center py-2 bg-slate-100 rounded text-slate-400 font-bold text-xs uppercase tracking-widest my-2">Mitad de Cuadro</div>
                  )}
                </>
              ))}
            </div>

            {/* Acciones del sorteo - Ocultas si se confirma */}
            {!isSorteoConfirmado && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex flex-col gap-2 z-40">
                  <Button onClick={enviarListaBasti} variant="outline" className="font-bold h-12">LISTA BASTI</Button>
                  <div className="flex gap-2">
                    {tournaments.find(t => t.short === navState.tournamentShort)?.type === 'direct' ? (
                       <Button onClick={() => runDirectDraw(navState.category, navState.tournamentShort)} className="bg-orange-500 text-white font-bold h-12 px-8 shadow-lg flex-1"><RefreshCw className="mr-2 h-4 w-4" /> Sortear</Button>
                    ) : (
                       <Button onClick={() => fetchQualifiersAndDraw(navState.category, navState.tournamentShort)} className="bg-orange-500 text-white font-bold h-12 px-8 shadow-lg flex-1"><RefreshCw className="mr-2 h-4 w-4" /> Sortear</Button>
                    )}
                    <Button onClick={confirmarSorteoCuadro} className="bg-green-600 text-white font-bold h-12 flex-1"><Send className="mr-2 h-4 w-4" /> CONFIRMAR Y ENVIAR</Button>
                  </div>
                  <Button onClick={() => setNavState({ ...navState, level: "direct-bracket" })} className="bg-red-600 text-white font-bold h-12 px-8"> <Trash2 className="mr-2" /> ELIMINAR</Button>
                </div>
            )}
            
            {/* Espaciador si el footer está fijo */}
            {!isSorteoConfirmado && <div className="h-48"></div>}
          </div>
        )}

        {navState.level === "damas-empty" && (
             <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-white rounded-3xl shadow-sm border border-slate-100">
                <Trophy className="h-16 w-16 text-slate-200 mb-4" />
                <h3 className="text-xl font-bold text-slate-600">{navState.selectedCategory}</h3>
                <p className="text-slate-400 mt-2">No hay torneos activos por el momento</p>
            </div>
        )}

        {navState.level === "group-phase" && (
            <div className="space-y-4">
                <div className="flex justify-between items-center bg-white p-2 rounded-lg shadow-sm">
                   <Button onClick={() => setNavState({...navState, level: "tournament-phases"})} variant="ghost" size="sm">ATRÁS</Button>
                </div>
                {!isSorteoConfirmado && !isFixedData && (
                    <div className="grid gap-2">
                        <Button onClick={() => runATPDraw(navState.currentCat, navState.currentTour)} className="bg-green-600 text-white font-bold h-12"><Shuffle className="mr-2 h-4 w-4" /> SORTEAR</Button>
                        <Button onClick={enviarListaBasti} variant="outline" className="font-bold h-12">LISTA BASTI</Button>
                        <Button onClick={confirmarYEnviar} className="bg-blue-600 text-white font-bold h-12">CONFIRMAR Y ENVIAR</Button>
                        <Button onClick={() => { setGroupData([]); setNavState({...navState, level: "tournament-phases"}); }} variant="destructive" className="font-bold h-12"><Trash2 className="mr-2 h-4 w-4" /> ELIMINAR</Button>
                    </div>
                )}
                
                <div className={`text-white p-4 rounded-xl shadow-lg flex items-center justify-between ${getTournamentStyle(navState.currentTour).color}`}>
                   <div className="flex items-center gap-3">
                      {getTournamentStyle(navState.currentTour).logo && <Image src={getTournamentStyle(navState.currentTour).logo} alt="Tour Logo" width={40} height={40} className="object-contain" />}
                      <div>
                        <h2 className="font-bold text-lg leading-tight">{getTournamentName(navState.currentTour)} - Fase de Grupos</h2>
                        <p className="text-sm opacity-90">{navState.currentCat}</p>
                      </div>
                   </div>
                   {getTournamentStyle(navState.currentTour).pointsLogo && <Image src={getTournamentStyle(navState.currentTour).pointsLogo} alt="Points" width={40} height={40} />}
                </div>

                {groupData.map((group, idx) => <GroupTable key={idx} group={group} />)}
            </div>
        )}

        {navState.level === "direct-bracket" && (
            <div className="w-full overflow-x-auto pb-8">
                <div className={`mb-4 p-4 rounded-xl flex justify-between items-center text-white shadow-lg ${bracketStyle.color}`}>
                   <div className="flex items-center gap-2">
                      {bracketStyle.logo && <Image src={bracketStyle.logo} alt="Logo" width={32} height={32} />}
                      <span className="font-bold">{getTournamentName(navState.tournamentShort)} - {navState.selectedCategory}</span>
                   </div>
                   {bracketStyle.pointsLogo && <Image src={bracketStyle.pointsLogo} alt="Pts" width={32} height={32} />}
                </div>

                {bracketData.hasData ? (
                    <div className="flex gap-8 min-w-max p-4">
                        {bracketData.bracketSize === 32 && (
                             <div className="flex flex-col justify-around gap-4 w-40">
                                 {Array.from({length: 16}, (_, i) => i * 2).map((idx) => {
                                    const p1 = bracketData.r1[idx]; const p2 = bracketData.r1[idx+1];
                                    const w1 = p1 && bracketData.r2.includes(p1);
                                    const w2 = p2 && bracketData.r2.includes(p2);
                                    const seed1 = bracketData.seeds ? bracketData.seeds[p1] : null;
                                    const seed2 = bracketData.seeds ? bracketData.seeds[p2] : null;

                                    return (
                                        <div key={`r1-${idx}`} className="flex flex-col border rounded bg-white shadow-sm text-xs relative overflow-hidden">
                                            <div className={`p-1 flex justify-between ${w1 ? 'bg-green-100 font-bold' : ''}`}>
                                                <span>{seed1 ? <span className="text-[10px] text-gray-500 mr-1">({seed1})</span> : null}{p1 || ""}</span>
                                                <span>{bracketData.s1[idx]}</span>
                                            </div>
                                            <div className={`p-1 flex justify-between border-t ${w2 ? 'bg-green-100 font-bold' : ''}`}>
                                                <span>{seed2 ? <span className="text-[10px] text-gray-500 mr-1">({seed2})</span> : null}{p2 || ""}</span>
                                                <span>{bracketData.s1[idx+1]}</span>
                                            </div>
                                            {idx === 14 && <div className="absolute -right-4 top-1/2 w-4 h-px bg-slate-300"></div>}
                                        </div>
                                    )
                                 })}
                             </div>
                        )}
                        
                        {bracketData.bracketSize >= 16 && (
                            <div className="flex flex-col justify-around gap-8 w-40">
                                {[3, 5, 8, 20-22, 24].map((idx, i) => {
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
                                     <div key={`r2-${idx}`} className="flex flex-col border rounded bg-white shadow-sm text-xs relative">
                                        <div className={`p-1 flex justify-between ${w1 ? 'bg-green-100 font-bold' : ''}`}>
                                           <span>{seed1 ? <span className="text-[10px] text-gray-500 mr-1">({seed1})</span> : null}{p1 || ""}</span>
                                           <span>{s1}</span>
                                        </div>
                                        <div className={`p-1 flex justify-between border-t ${w2 ? 'bg-green-100 font-bold' : ''}`}>
                                           <span>{seed2 ? <span className="text-[10px] text-gray-500 mr-1">({seed2})</span> : null}{p2 || ""}</span>
                                           <span>{s2}</span>
                                        </div>
                                        {i === 3 && <div className="absolute -right-4 top-1/2 w-4 h-px bg-slate-300"></div>}
                                     </div>
                                   );
                                })}
                            </div>
                        )}

                        <div className="flex flex-col justify-around gap-16 w-40">
                            {[3, 20, 21].map((idx, i) => {
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
                                    <div key={`r3-${idx}`} className="flex flex-col border rounded bg-white shadow-sm text-xs relative">
                                        <div className={`p-1 flex justify-between ${w1 ? 'bg-green-100 font-bold' : ''}`}>
                                            <span>{seed1 ? <span className="text-[10px] text-gray-500 mr-1">({seed1})</span> : null}{p1 || ""}</span>
                                            <span>{s1}</span>
                                        </div>
                                        <div className={`p-1 flex justify-between border-t ${w2 ? 'bg-green-100 font-bold' : ''}`}>
                                            <span>{seed2 ? <span className="text-[10px] text-gray-500 mr-1">({seed2})</span> : null}{p2 || ""}</span>
                                            <span>{s2}</span>
                                        </div>
                                        {i === 1 && <div className="absolute -right-4 top-1/2 w-4 h-px bg-slate-300"></div>}
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="flex flex-col justify-around gap-32 w-40">
                            {[3].map((idx, i) => {
                                const r = bracketData.bracketSize === 32 ? bracketData.r4 : (bracketData.bracketSize === 16 ? bracketData.r3 : bracketData.r2);
                                const s = bracketData.bracketSize === 32 ? bracketData.s4 : (bracketData.bracketSize === 16 ? bracketData.s3 : bracketData.s2);
                                const p1 = r[idx]; const p2 = r[idx+1];
                                const w1 = p1 && p1 === bracketData.winner;
                                const w2 = p2 && p2 === bracketData.winner;
                                const s1 = s[idx]; const s2 = s[idx+1];
                                const seed1 = bracketData.seeds ? bracketData.seeds[p1] : null;
                                const seed2 = bracketData.seeds ? bracketData.seeds[p2] : null;
                                
                                return (
                                    <div key={`r4-${idx}`} className="flex flex-col border rounded bg-white shadow-sm text-xs relative">
                                        <div className={`p-1 flex justify-between ${w1 ? 'bg-green-100 font-bold' : ''}`}>
                                            <span>{seed1 ? <span className="text-[10px] text-gray-500 mr-1">({seed1})</span> : null}{p1 || ""}</span>
                                            <span>{s1}</span>
                                        </div>
                                        <div className={`p-1 flex justify-between border-t ${w2 ? 'bg-green-100 font-bold' : ''}`}>
                                            <span>{seed2 ? <span className="text-[10px] text-gray-500 mr-1">({seed2})</span> : null}{p2 || ""}</span>
                                            <span>{s2}</span>
                                        </div>
                                        {i === 0 && <div className="absolute -right-4 top-1/2 w-4 h-px bg-slate-300"></div>}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex flex-col justify-center gap-4 w-40">
                            {(() => {
                                let topFinalistName = ""; let botFinalistName = "";
                                if (bracketData.bracketSize === 16 && bracketData.r4 && bracketData.r4.length >= 2) { topFinalistName = bracketData.r4; botFinalistName = bracketData.r4[1]; }
                                else if (bracketData.bracketSize === 32 && bracketData.r5 && bracketData.r5.length >= 2) { topFinalistName = bracketData.r5; botFinalistName = bracketData.r5[1]; }
                                else if (bracketData.bracketSize === 8 && bracketData.r3 && bracketData.r3.length >= 2) { topFinalistName = bracketData.r3; botFinalistName = bracketData.r3[1]; }
                                else { const semisR = bracketData.bracketSize === 32 ? bracketData.r4 : bracketData.r2; if (bracketData.winner) { topFinalistName = bracketData.winner; botFinalistName = bracketData.runnerUp; } }
                                
                                const isTopWinner = topFinalistName && topFinalistName === bracketData.winner;
                                const isBotWinner = botFinalistName && botFinalistName === bracketData.winner;

                                return (
                                    <div className="flex flex-col border-2 border-yellow-400 rounded bg-white shadow-md text-sm relative">
                                        <div className="text-[10px] text-center bg-yellow-400 text-yellow-900 font-bold">FINAL</div>
                                        <div className={`p-2 border-b text-center ${isTopWinner ? 'bg-yellow-100 font-bold' : ''}`}>{topFinalistName || ""}</div>
                                        <div className={`p-2 text-center ${isBotWinner ? 'bg-yellow-100 font-bold' : ''}`}>{botFinalistName || ""}</div>
                                    </div>
                                );
                            })()}
                            
                            <div className="mt-4 p-2 bg-gradient-to-r from-yellow-200 to-yellow-400 rounded shadow text-center">
                                <Trophy className="h-6 w-6 text-yellow-800 mx-auto mb-1" />
                                <div className="text-[10px] font-bold text-yellow-800">CAMPEÓN</div>
                                <div className="font-bold text-yellow-900">{bracketData.winner || ""}</div>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="text-center p-8 bg-white rounded-xl shadow-sm">
                        <Trophy className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-600">Cuadro no definido aún</h3>
                        {bracketData.canGenerate ? (
                            <div className="mt-4">
                                <p className="mb-4 text-slate-500">Se encontraron clasificados en el sistema.</p>
                                {/* CORRECCIÓN 1: Botón Sortear con color dinámico */}
                                {tournaments.find(t => t.short === navState.tournamentShort)?.type === 'direct' ? (
                                    <Button onClick={() => runDirectDraw(navState.category, navState.tournamentShort)} className={`${bracketStyle.color} text-white font-bold px-8 shadow-lg`}><Shuffle className="mr-2 h-4 w-4" /> Sortear</Button>
                                ) : (
                                    <Button onClick={() => fetchQualifiersAndDraw(navState.category, navState.tournamentShort)} className={`${bracketStyle.color} text-white font-bold px-8 shadow-lg`}><Shuffle className="mr-2 h-4 w-4" /> Sortear</Button>
                                )}
                            </div>
                        ) : (
                             <p className="mt-2 text-slate-400">Los cruces para este torneo estarán disponibles próximamente.</p>
                        )}
                    </div>
                )}
            </div>
        )}

        {showRankingCalc && (
            <div className="fixed inset-0 bg-white z-50 overflow-y-auto p-4 animate-in fade-in slide-in-from-bottom-10 duration-300">
               <Button onClick={() => setShowRankingCalc(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500" variant="ghost"><X /></Button>
               <h2 className="text-2xl font-bold text-[#b35a38] mb-1">Cálculo de Puntos</h2>
               <p className="text-slate-500 mb-6">Torneo: {getTournamentName(navState.tournamentShort)}</p>
               
               <div className="bg-[#b35a38] text-white p-2 rounded-t-lg flex justify-between px-4 font-bold">
                  <span>{navState.category}</span>
               </div>
               <div className="border rounded-b-lg overflow-hidden">
                  <table className="w-full text-sm">
                     <thead className="bg-slate-100 text-slate-500">
                        <tr>
                           <th className="p-2 text-left">Jugador</th>
                           <th className="p-2 text-right">Puntos</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y">
                        {calculatedRanking.map((p, i) => (
                           <tr key={i}>
                              <td className="p-2 font-medium">{p.name}</td>
                              <td className="p-2 text-right font-bold text-[#b35a38]">{p.points}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               
               <div className="flex gap-2 mt-6">
                   <Button onClick={() => {
                       const text = calculatedRanking.map(p => `${p.name}\t${p.points}`).join('\n');
                       navigator.clipboard.writeText(text);
                       alert("Tabla copiada al portapapeles");
                   }} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold h-12 rounded-xl"><Copy className="mr-2 h-4 w-4" /> COPIAR TABLA</Button>
                   <Button onClick={() => {
                       let mensaje = `*RANKING CALCULADO - ${navState.tournamentShort}*\n\n`;
                       calculatedRanking.forEach(p => { mensaje += `${p.name}: ${p.points}\n`; });
                       window.open(`https://wa.me/${MI_TELEFONO}?text=${encodeURIComponent(mensaje)}`, '_blank');
                   }} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-xl"><Send className="mr-2 h-4 w-4" /> ENVIAR POR WHATSAPP</Button>
               </div>
            </div>
        )}

        {navState.level === "ranking-view" && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="bg-[#b35a38] text-white p-4 font-bold text-center">
                    {navState.selectedCategory} {navState.year}
                </div>
                {headers.length > 0 && rankingData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-slate-100 text-slate-500">
                                <tr>
                                    <th className="p-2">POS</th>
                                    <th className="p-2 text-left min-w-[120px]">JUGADOR</th>
                                    {headers.map((h, i) => <th key={i} className="p-2 text-center text-[10px]">{h}</th>)}
                                    <th className="p-2 font-bold text-[#b35a38]">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {rankingData.map((p, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="p-2 text-center font-bold text-slate-400">{i + 1}</td>
                                        <td className="p-2 font-bold text-slate-700">{p.name}</td>
                                        {p.points.map((val: any, idx: number) => <td key={idx} className="p-2 text-center text-slate-500">{val || 0}</td>)}
                                        <td className="p-2 text-center font-bold text-[#b35a38] bg-orange-50">{p.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                         <Loader2 className="h-8 w-8 animate-spin mb-2" />
                         Cargando datos...
                    </div>
                )}
            </div>
        )}
      </div>

      <div 
        onClick={handleFooterClick}
        className="text-center text-slate-500/80 mt-12 text-sm font-bold uppercase tracking-widest animate-pulse text-center cursor-pointer select-none active:scale-95 transition-transform"
      >
        Sistema de seguimiento de torneos en vivo
      </div>
    </main>
  );
}