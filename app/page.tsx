"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Grid3x3, RefreshCw, ArrowLeft, Trash2, CheckCircle, Loader2, Send, AlertCircle, Shuffle, Calculator, X, Copy } from "lucide-react"

// --- CONFIGURACIÓN DE DATOS ---
const ID_2025 = '1_tDp8BrXZfmmmfyBdLIUhPk7PwwKvJ_t'; 
const ID_DATOS_GENERALES = '1RVxm-lcNp2PWDz7HcDyXtq0bWIWA9vtw'; 
const ID_TORNEOS = '117mHAgirc9WAaWjHAhsalx1Yp6DgQj5bv2QpVZ-nWmI'; 
const MI_TELEFONO = "5491150568353"; 

// --- CONFIGURACIÓN DE PROXY ---
const PROXY_URL = "https://api.allorigins.win/raw?url=";

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
]

export default function Home() {
  const [navState, setNavState] = useState<any>({ level: "home" })
  const [rankingData, setRankingData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [bracketData, setBracketData] = useState<any>({ r1: [], s1: [], r2: [], s2: [], r3: [], s3: [], r4: [], s4: [], winner: "", size: 32, hasData: false, canGenerate: false, seeds: {} });
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

  const calculateAndShowRanking = async () => {
    setIsLoading(true);
    try {
        const urlBaremo = `https://docs.google.com/spreadsheets/d/${ID_TORNEOS}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent("Formatos Grupos")}&range=A37:Z44`;
        const res = await fetch(PROXY_URL + encodeURIComponent(urlBaremo));
        const txt = await res.text();
        const rows = parseCSV(txt);

        if (rows.length < 2) throw new Error("No se encontraron datos en Formatos Grupos");

        const headerRow = rows[0]; 
        const currentTourShort = navState.tournamentShort ? navState.tournamentShort.trim().toLowerCase() : "";
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
            champion: getPoints(1),   
            finalist: getPoints(2),   
            semi: getPoints(3),       
            quarters: getPoints(4),   
            octavos: getPoints(5),    
            dieciseis: getPoints(6),  
            groupWin: getPoints(7)    
        };

        const playerScores: any = {};
        const addScore = (name: string, score: number) => {
            if (!name || name === "BYE" || name === "") return;
            const cleanName = name.trim();
            if (!playerScores[cleanName] || score > playerScores[cleanName]) {
                playerScores[cleanName] = score;
            }
        };

        if (bracketData.hasData) {
            const { r1, r2, r3, r4, winner, size } = bracketData;
            if (winner) addScore(winner, pts.champion);
            const finalists = r4; // Siempre la ultima ronda antes de winner
            
            bracketData.r4.forEach((p: string) => { if (p && p !== winner) addScore(p, pts.finalist); });
            bracketData.r3.forEach((p: string) => { if (p && !bracketData.r4.includes(p)) addScore(p, pts.semi); });
            bracketData.r2.forEach((p: string) => { if (p && !bracketData.r3.includes(p)) addScore(p, pts.quarters); });
            
            if (size >= 16) {
                 if (size === 32) {
                     bracketData.r1.forEach((p: string) => { if (p && !bracketData.r2.includes(p)) addScore(p, pts.octavos); }); // r1 en 32 son 16avos? No, r1 son los partidos. r2 son los octavos.
                     // Correccion logica puntos 32: r1 (32j) -> r2 (16j - Octavos) -> r3 (8j - Cuartos)
                     // Si pierdes en r2, jugaste octavos.
                     bracketData.r2.forEach((p: string) => { if (p && !bracketData.r3.includes(p)) addScore(p, pts.octavos); });
                 } else if (size === 16) {
                     bracketData.r1.forEach((p: string) => { if (p && !bracketData.r2.includes(p)) addScore(p, pts.octavos); });
                 }
            }
        }

        const rankingArray = Object.keys(playerScores).map(key => ({
            name: key,
            points: playerScores[key]
        })).sort((a, b) => b.points - a.points);

        setCalculatedRanking(rankingArray);
        setShowRankingCalc(true);

    } catch (e) {
        console.error(e);
        alert("Error calculando ranking.");
    } finally {
        setIsLoading(false);
    }
  };

  const runDirectDraw = async (categoryShort: string, tournamentShort: string) => {
    setIsLoading(true); setGeneratedBracket([]); setIsFixedData(false);
    try {
        const rankUrl = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(`${categoryShort} 2026`)}`;
        const rankRes = await fetch(PROXY_URL + encodeURIComponent(rankUrl));
        const rankCsv = await rankRes.text();
        const playersRanking = parseCSV(rankCsv).slice(1).map(row => ({ name: row[1] || "", total: row[11] ? parseInt(row[11]) : 0 })).filter(p => p.name !== "");

        const inscUrl = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=Inscriptos`;
        const inscRes = await fetch(PROXY_URL + encodeURIComponent(inscUrl));
        const filteredInscriptos = parseCSV(await inscRes.text()).slice(1).filter(cols => cols[0] === tournamentShort && cols[1] === categoryShort).map(cols => cols[2]);

        if (filteredInscriptos.length < 4) { alert("Mínimo 4 jugadores."); setIsLoading(false); return; }

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

        let seedPos: any = { 1: 0, 2: bracketSize - 1, 3: [(bracketSize / 2) - 1, bracketSize / 2] };
        if (bracketSize === 16) seedPos[5] = [2, 5, 10, 13];
        if (bracketSize === 32) seedPos[5] = [7, 8, 23, 24]; 
        
        const seeds = entryList.slice(0, 8).map((p, i) => ({ ...p, rank: i + 1 }));
        if(seeds[0]) slots[seedPos[1]] = seeds[0]; 
        if(seeds[1]) slots[seedPos[2]] = seeds[1]; 
        if(seeds[2] && seeds[3]) {
            const pair34 = [seeds[2], seeds[3]].sort(() => Math.random() - 0.5);
            slots[seedPos[3][0]] = pair34[0]; slots[seedPos[3][1]] = pair34[1];
        } else if (seeds[2]) {
             slots[seedPos[3][Math.floor(Math.random()*2)]] = seeds[2];
        }

        if (seeds.length >= 8 && seedPos[5]) {
            const group58 = seeds.slice(4, 8).sort(() => Math.random() - 0.5);
            for (let i = 0; i < 4; i++) {
                if (seedPos[5][i] !== undefined) slots[seedPos[5][i]] = group58[i];
            }
        }

        const getRivalIndex = (idx: number) => (idx % 2 === 0) ? idx + 1 : idx - 1;
        let byesRemaining = byeCount;
        for (let r = 1; r <= 8; r++) {
            if (byesRemaining > 0) {
                const seedIdx = slots.findIndex(s => s && s.rank === r);
                if (seedIdx !== -1) {
                    const rivalIdx = getRivalIndex(seedIdx);
                    if (slots[rivalIdx] === null) { slots[rivalIdx] = { name: "BYE", rank: 0 }; byesRemaining--; }
                }
            }
        }

        let emptyPairsIndices = []; 
        for (let i = 0; i < bracketSize; i += 2) {
             if (slots[i] === null && slots[i+1] === null) { emptyPairsIndices.push(i); }
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
        const getRival = (idx: number) => (idx % 2 === 0) ? idx + 1 : idx - 1;
        
        emptySlots.sort((a, b) => {
             const rivalA = slots[getRival(a)];
             const rivalB = slots[getRival(b)];
             const score = (r: any) => (r === null ? 10 : 1);
             return score(rivalB) - score(rivalA);
        });

        nonSeeds.forEach(p => {
             if (emptySlots.length > 0) {
                 const idx = emptySlots.shift();
                 if (idx !== undefined) slots[idx] = p;
             }
        });

        for (let i = 0; i < slots.length; i++) { if (slots[i] === null) slots[i] = { name: "BYE", rank: 0 }; }

        let matches = [];
        for (let i = 0; i < bracketSize; i += 2) {
            let p1 = slots[i], p2 = slots[i+1];
            if (p1?.name === "BYE" && p2?.name !== "BYE") { let t = p1; p1 = p2; p2 = t; }
            if (p1?.name === "BYE" && p2?.name === "BYE") { p1 = { name: "", rank: 0 }; p2 = { name: "", rank: 0 }; }
            matches.push({ p1, p2 });
        }
        setGeneratedBracket(matches);
        setNavState({ ...navState, level: "generate-bracket", category: categoryShort, tournamentShort: tournamentShort, bracketSize });
    } catch (e) { alert("Error sorteo"); } finally { setIsLoading(false); }
  }

  const runATPDraw = async (categoryShort: string, tournamentShort: string) => {
    setIsLoading(true); setIsSorteoConfirmado(false); setIsFixedData(false);
    try {
      const rankUrl = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(`${categoryShort} 2026`)}`;
      const rankRes = await fetch(PROXY_URL + encodeURIComponent(rankUrl));
      const rankCsv = await rankRes.text();
      const playersRanking = parseCSV(rankCsv).slice(1).map(row => ({ name: row[1] || "", total: row[11] ? parseInt(row[11]) : 0 })).filter(p => p.name !== "");
      const inscUrl = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=Inscriptos`;
      const filteredInscriptos = parseCSV(await (await fetch(PROXY_URL + encodeURIComponent(inscUrl))).text()).slice(1).filter(cols => cols[0] === tournamentShort && cols[1] === categoryShort).map(cols => cols[2]);

      if (filteredInscriptos.length === 0) { alert("No hay inscriptos."); setIsLoading(false); return; }
      const entryList = filteredInscriptos.map(n => {
        const p = playersRanking.find(pr => pr.name.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(pr.name.toLowerCase()));
        return { name: n, points: p ? p.total : 0 };
      }).sort((a, b) => b.points - a.points);

      const totalPlayers = entryList.length;
      if (totalPlayers < 2) { alert("Mínimo 2 jugadores."); setIsLoading(false); return; }
      let g3 = totalPlayers % 3 === 0 ? totalPlayers / 3 : (totalPlayers % 3 === 1 ? (totalPlayers - 4) / 3 : (totalPlayers - 2) / 3);
      let g2 = totalPlayers % 3 === 0 ? 0 : (totalPlayers % 3 === 1 ? 2 : 1);
      let caps = []; for(let i=0; i<g3; i++) caps.push(3); for(let i=0; i<g2; i++) caps.push(2);
      caps = caps.sort(() => Math.random() - 0.5);
      let groups = caps.map((cap, i) => ({ groupName: `Zona ${i + 1}`, capacity: cap, players: [], results: [["-","-","-"], ["-","-","-"], ["-","-","-"]], positions: ["-", "-", "-"] }));
      for (let i = 0; i < caps.length; i++) if (entryList[i]) groups[i].players.push(entryList[i].name);
      const rest = entryList.slice(caps.length).sort(() => Math.random() - 0.5);
      let pIdx = 0;
      for (let g = 0; g < caps.length; g++) { while (groups[g].players.length < groups[g].capacity && pIdx < rest.length) { groups[g].players.push(rest[pIdx].name); pIdx++; } }
      setGroupData(groups); setNavState({ ...navState, level: "group-phase", currentCat: categoryShort, currentTour: tournamentShort });
    } catch (e) { alert("Error al procesar el sorteo."); } finally { setIsLoading(false); }
  }

  const fetchGroupPhase = async (categoryShort: string, tournamentShort: string) => {
    setIsLoading(true); setGroupData([]); setIsSorteoConfirmado(false); setIsFixedData(false);
    try {
      const sheetName = `Grupos ${tournamentShort} ${categoryShort}`;
      const url = `https://docs.google.com/spreadsheets/d/${ID_TORNEOS}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
      const res = await fetch(PROXY_URL + encodeURIComponent(url));
      const csvText = await res.text();
      let foundGroups = false;
      if (csvText.includes("Zona") || csvText.includes("Grupo")) {
        const rows = parseCSV(csvText);
        const parsedGroups = [];
        for (let i = 0; i < rows.length; i += 4) {
          if (rows[i] && rows[i][0] && (rows[i][0].includes("Zona") || rows[i][0].includes("Grupo"))) {
            const playersRaw = [rows[i+1], rows[i+2], rows[i+3]];
            const valid = [], players = [], positions = [];
            playersRaw.forEach((row, idx) => { if (row && row[0] && row[0] !== "-" && row[0] !== "") { players.push(row[0]); let p = row[4] || ""; if (p.startsWith("#")) p = "-"; positions.push(p); valid.push(idx); } });
            const results = [];
            for (let x = 0; x < valid.length; x++) { const rr = []; for (let y = 0; y < valid.length; y++) { rr.push(rows[i + 1 + valid[x]][1 + valid[y]]); } results.push(rr); }
            parsedGroups.push({ groupName: rows[i][0], players, results, positions });
          }
        }
        if (parsedGroups.length > 0) { setGroupData(parsedGroups); setIsSorteoConfirmado(true); setIsFixedData(true); setNavState({ ...navState, level: "tournament-phases", currentCat: categoryShort, currentTour: tournamentShort, hasGroups: true }); return; }
      }
      setNavState({ ...navState, level: "tournament-phases", currentCat: categoryShort, currentTour: tournamentShort, hasGroups: false });
    } catch (e) { setNavState({ ...navState, level: "tournament-phases", currentCat: categoryShort, currentTour: tournamentShort, hasGroups: false }); } finally { setIsLoading(false); }
  }

  const confirmarYEnviar = () => {
    let m = `*SORTEO CONFIRMADO - ${navState.currentTour}*\n*Categoría:* ${navState.currentCat}\n\n`;
    groupData.forEach(g => { m += `*${g.groupName}*\n${g.players.join('\n')}\n\n`; });
    window.open(`https://wa.me/${MI_TELEFONO}?text=${encodeURIComponent(m)}`, '_blank');
    setIsSorteoConfirmado(true);
  };

  const GroupTable = ({ group }: { group: any }) => {
    let isComp = true;
    for (let i = 0; i < group.players.length; i++) { for (let j = 0; j < group.players.length; j++) { if (i === j) continue; const val = group.results[i]?.[j]; if (!val || val.trim() === "-" || val.trim().length < 2) { isComp = false; break; } } if (!isComp) break; }
    return (
      <div className="bg-white border-2 border-[#b35a38]/20 rounded-2xl overflow-hidden shadow-lg mb-4 text-center h-fit overflow-hidden">
        <div className="bg-[#b35a38] p-3 text-white font-black italic text-center uppercase tracking-wider">{group.groupName}</div>
        <style jsx>{`.hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <div className="overflow-x-auto w-full hide-scroll">
          <table className="w-max min-w-full text-[11px] md:text-xs">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-3 border-r w-32 text-left font-bold text-black min-w-[120px] whitespace-nowrap">JUGADOR</th>
                {group.players.map((p: string, i: number) => {
                  const parts = p.replace(/,/g, "").trim().split(/\s+/);
                  const name = parts.length > 1 ? `${parts[0]} ${parts[1].charAt(0)}.` : parts[0];
                  return <th key={i} className="p-3 border-r text-center font-black text-[#b35a38] uppercase min-w-[80px] whitespace-nowrap">{name}</th>
                })}
                {isComp && <th className="p-3 text-center font-black text-black bg-slate-100 w-12 whitespace-nowrap">POS</th>}
              </tr>
            </thead>
            <tbody>
              {group.players.map((p1: string, i: number) => (
                <tr key={i} className="border-b">
                  <td className="p-3 border-r font-black bg-slate-50 uppercase text-[#b35a38] text-left whitespace-nowrap">{p1}</td>
                  {group.players.map((p2: string, j: number) => (
                    <td key={j} className={`p-2 border-r text-center font-black text-slate-700 whitespace-nowrap text-sm md:text-base ${i === j ? 'bg-slate-100 text-slate-300' : ''}`}>
                      {i === j ? "/" : (group.results[i] && group.results[i][j] ? group.results[i][j] : "-")}
                    </td>
                  ))}
                  {isComp && <td className="p-3 text-center font-black text-[#b35a38] text-xl bg-slate-50 whitespace-nowrap">{group.positions[i] && !isNaN(group.positions[i]) ? `${group.positions[i]}°` : group.positions[i]}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const generatePlayoffBracket = (qualifiers: any[]) => {
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
    if (wZ1) matches[0].p1 = wZ1;
    if (wZ2) matches[numMatches - 1].p1 = wZ2;
    const mids = [wZ3, wZ4].filter(Boolean).sort(() => Math.random() - 0.5);
    if (mids.length > 0) matches[halfMatches - 1].p1 = mids[0];
    if (mids.length > 1) matches[halfMatches].p1 = mids[1];
    matches.forEach(m => { if (!m.p1 && otherWinners.length > 0) m.p1 = otherWinners.pop(); });
    const topHalfMatches = matches.slice(0, halfMatches);
    const bottomHalfMatches = matches.slice(halfMatches);
    const zonesInTop = new Set(topHalfMatches.map(m => m.p1?.groupIndex).filter(i => i !== undefined));
    const zonesInBottom = new Set(bottomHalfMatches.map(m => m.p1?.groupIndex).filter(i => i !== undefined));
    const mustGoBottom = runners.filter(r => zonesInTop.has(r.groupIndex));
    const mustGoTop = runners.filter(r => zonesInBottom.has(r.groupIndex));
    const freeAgents = runners.filter(r => !zonesInTop.has(r.groupIndex) && !zonesInBottom.has(r.groupIndex));
    const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5);
    let poolTop = shuffle([...mustGoTop]);
    let poolBottom = shuffle([...mustGoBottom]);
    let poolFree = shuffle([...freeAgents]);
    while (poolTop.length < halfMatches && poolFree.length > 0) poolTop.push(poolFree.pop());
    while (poolBottom.length < (numMatches - halfMatches) && poolFree.length > 0) poolBottom.push(poolFree.pop());
    poolTop = shuffle(poolTop); poolBottom = shuffle(poolBottom);
    matches.forEach((match, index) => {
        const isTopHalf = index < halfMatches;
        let pool = isTopHalf ? poolTop : poolBottom;
        if (match.p1) {
            if (playersWithBye.has(match.p1.name)) { match.p2 = { name: "BYE", rank: 0, groupIndex: -1 }; } 
            else { if (pool.length > 0) { match.p2 = pool.pop(); } else { match.p2 = { name: "TBD", rank: 0 }; } }
        } else {
            if (pool.length >= 2) { match.p1 = pool.pop(); match.p2 = pool.pop(); } 
            else if (pool.length === 1) { match.p1 = pool.pop(); match.p2 = { name: "BYE", rank: 0 }; }
        }
    });
    return { matches, bracketSize };
  }

  const fetchQualifiersAndDraw = async (category: string, tournamentShort: string) => {
      setIsLoading(true);
      setGeneratedBracket([]);
      const sheetName = `Grupos ${tournamentShort} ${category}`;
      try {
          const response = await fetch(PROXY_URL + encodeURIComponent(`https://docs.google.com/spreadsheets/d/${ID_TORNEOS}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`));
          const csvText = await response.text();
          const rows = parseCSV(csvText);
          let qualifiers = [];
          for(let i = 0; i < 50; i++) { 
              if (rows[i] && rows[i].length > 5) {
                  const winnerName = rows[i][5]; 
                  const runnerName = rows[i].length > 6 ? rows[i][6] : null; 
                  if (winnerName && winnerName !== "-" && winnerName !== "" && !winnerName.toLowerCase().includes("1ro")) qualifiers.push({ name: winnerName, rank: 1, groupIndex: i });
                  if (runnerName && runnerName !== "-" && runnerName !== "" && !runnerName.toLowerCase().includes("2do")) qualifiers.push({ name: runnerName, rank: 2, groupIndex: i });
              }
          }
          if (qualifiers.length >= 3) { 
             const result = generatePlayoffBracket(qualifiers);
             if (result) { setGeneratedBracket(result.matches); setNavState({ ...navState, level: "generate-bracket", category, tournamentShort, bracketSize: result.bracketSize }); }
          }
      } catch (e) {} finally { setIsLoading(false); }
  }

  const confirmarSorteoCuadro = () => {
    if (generatedBracket.length === 0) return;
    let mensaje = `*SORTEO CUADRO FINAL - ${navState.tournamentShort}*\n*Categoría:* ${navState.category}\n\n`;
    generatedBracket.forEach((match) => { mensaje += `${match.p1 ? match.p1.name : "TBD"}\n${match.p2 ? match.p2.name : "TBD"}\n`; });
    window.open(`https://wa.me/${MI_TELEFONO}?text=${encodeURIComponent(mensaje)}`, '_blank');
  }

  const fetchRankingData = async (categoryShort: string, year: string) => {
    setIsLoading(true); setRankingData([]); setHeaders([]);
    const sheetId = year === "2025" ? ID_2025 : ID_DATOS_GENERALES;
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(`${categoryShort} ${year}`)}`;
    try {
      const response = await fetch(PROXY_URL + encodeURIComponent(url));
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
    } catch (error) {} finally { setIsLoading(false); }
  }

  const fetchBracketData = async (category: string, tournamentShort: string) => {
    setIsLoading(true); 
    setBracketData({ r1: [], s1: [], r2: [], s2: [], r3: [], s3: [], r4: [], s4: [], winner: "", size: 32, hasData: false, canGenerate: false, seeds: {} });
    
    // FUNCION AUTO-AVANCE ESTRICTO: Solo si rival es "BYE"
    const processByes = (data: any, size: number) => {
        let { r1, r2, r3, r4 } = data;
        let newR2 = [...r2], newR3 = [...r3], newR4 = [...r4];
        
        // 16avos -> Octavos (Solo si size es 32)
        if (size === 32) {
            for (let i = 0; i < r1.length; i += 2) {
                const p1 = r1[i], p2 = r1[i+1], t = Math.floor(i / 2);
                if (!newR2[t] || newR2[t] === "") {
                    if (p2 === "BYE" && p1 && p1 !== "BYE") newR2[t] = p1;
                    else if (p1 === "BYE" && p2 && p2 !== "BYE") newR2[t] = p2;
                }
            }
            data.r2 = newR2;
        }

        // Octavos -> Cuartos
        const prev = size === 32 ? newR2 : r1;
        const next = size === 32 ? newR3 : r2; // Destino
        
        for (let i = 0; i < prev.length; i += 2) {
             const p1 = prev[i], p2 = prev[i+1], t = Math.floor(i / 2);
             if (!next[t] || next[t] === "") {
                 if (p2 === "BYE" && p1 && p1 !== "BYE") next[t] = p1;
                 else if (p1 === "BYE" && p2 && p2 !== "BYE") next[t] = p2;
             }
        }
        
        if (size === 32) { data.r3 = newR3; } 
        else { data.r2 = next; }
        
        return data;
    }

    try {
      const urlBracket = `https://docs.google.com/spreadsheets/d/${ID_TORNEOS}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(`${category} ${tournamentShort}`)}`;
      const res = await fetch(PROXY_URL + encodeURIComponent(urlBracket));
      const rows = parseCSV(await res.text());
      const firstCell = rows.length > 0 && rows[0][0] ? rows[0][0].toString().toLowerCase() : "";
      
      if (rows.length > 0 && firstCell !== "" && firstCell !== "-") {
          // DETECCION DE TAMAÑO REAL PARA RENDERIZADO
          const dataRowsCount = rows.filter(r => r[0] && r[0].trim() !== "").length;
          
          let size = 32;
          if (dataRowsCount <= 8) size = 8;
          else if (dataRowsCount <= 16) size = 16;
          
          let seeds = {};
          try {
             const rankTxt = await (await fetch(PROXY_URL + encodeURIComponent(`https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(`${category} 2026`)}`))).text();
             const pRank = parseCSV(rankTxt).slice(1).map(row => ({ name: row[1] || "", total: row[11] ? parseInt(row[11]) : 0 }));
             const inscTxt = await (await fetch(PROXY_URL + encodeURIComponent(`https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=Inscriptos`))).text();
             const entry = parseCSV(inscTxt).slice(1).filter(c => c[0] === tournamentShort && c[1] === category).map(c => {
                const p = pRank.find(pr => pr.name.toLowerCase().includes(c[2].toLowerCase()));
                return { name: c[2], points: p ? p.total : 0 };
             }).sort((a, b) => b.points - a.points);
             entry.slice(0, 8).forEach((p, i) => { if (p.name) seeds[p.name] = i + 1; });
          } catch(e) {}

          let rawData: any = {};
          if (size === 32) {
            rawData = { 
                r1: rows.map(r => r[0]).slice(0, 32), s1: rows.map(r => r[1]).slice(0, 32), 
                r2: rows.map(r => r[2]).slice(0, 16), s2: rows.map(r => r[3]).slice(0, 16), 
                r3: rows.map(r => r[4]).slice(0, 8), s3: rows.map(r => r[5]).slice(0, 8), 
                r4: rows.map(r => r[6]).slice(0, 4), s4: rows.map(r => r[7]).slice(0, 4), 
                winner: rows[0][8] || "", size: 32, hasData: true, canGenerate: false, seeds 
            };
          } else if (size === 16) {
             rawData = { 
                 r1: rows.map(r => r[0]).slice(0, 16), s1: rows.map(r => r[1]).slice(0, 16), 
                 r2: rows.map(r => r[2]).slice(0, 8), s2: rows.map(r => r[3]).slice(0, 8), 
                 r3: rows.map(r => r[4]).slice(0, 4), s3: rows.map(r => r[5]).slice(0, 4), 
                 winner: rows[0][6] || "", size: 16, hasData: true, canGenerate: false, seeds 
             };
          } else { // 8
             rawData = { 
                 r1: rows.map(r => r[0]).slice(0, 8), s1: rows.map(r => r[1]).slice(0, 8), 
                 r2: rows.map(r => r[2]).slice(0, 4), s2: rows.map(r => r[3]).slice(0, 4), 
                 r3: [], s3: [],
                 winner: rows[0][4] || "", size: 8, hasData: true, canGenerate: false, seeds 
             };
          }
          setBracketData(processByes(rawData, size));
      } else {
          const resInsc = await fetch(PROXY_URL + encodeURIComponent(`https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=Inscriptos`));
          const count = parseCSV(await resInsc.text()).filter(r => r[0] === tournamentShort && r[1] === category).length;
          setBracketData({ hasData: false, canGenerate: count >= 4 });
      }
    } catch (error) {} finally { setIsLoading(false); }
  }

  const goBack = () => {
    if (navState.level === "direct-bracket") { setNavState({ ...navState, level: "tournament-selection" }); }
    else {
      const levels: any = { "main-menu": "home", "year-selection": "main-menu", "category-selection": "main-menu", "tournament-selection": "category-selection", "tournament-phases": "tournament-selection", "group-phase": "tournament-phases", "bracket-phase": "tournament-phases", "ranking-view": "category-selection", "direct-bracket": "tournament-selection", "damas-empty": "category-selection", "generate-bracket": "direct-bracket" };
      setNavState({ ...navState, level: levels[navState.level] || "home" });
    }
  }

  const buttonStyle = "w-full text-lg h-20 border-2 border-[#b35a38]/20 bg-white text-[#b35a38] hover:bg-[#b35a38] hover:text-white transform hover:scale-[1.01] transition-all duration-300 font-semibold shadow-md rounded-2xl flex items-center justify-center text-center";

  const GeneratedMatch = ({ match }: { match: any }) => (
      <div className="relative flex flex-col space-y-4 mb-8 w-full max-w-md mx-auto">
          <div className="flex items-center gap-4 border-b-2 border-slate-300 pb-2 relative bg-white">
              {match.p1 && <span className="text-orange-500 font-black text-lg w-16 text-right whitespace-nowrap">{match.p1.rank > 0 ? `${match.p1.rank}.` : ""}</span>}
              <span className={`font-black text-xl uppercase truncate ${match.p1 ? 'text-slate-800' : 'text-slate-300'}`}>{match.p1 ? match.p1.name : ""}</span>
          </div>
          <div className="flex items-center gap-4 border-b-2 border-slate-300 pb-2 relative bg-white">
              {match.p2 && match.p2.name !== 'BYE' && <span className="text-orange-500 font-black text-lg w-16 text-right whitespace-nowrap">{match.p2.rank > 0 ? `${match.p2.rank}.` : ""}</span>}
              <span className={`font-black text-xl uppercase truncate ${match.p2?.name === 'BYE' ? 'text-green-600' : (match.p2 ? 'text-slate-800' : 'text-slate-300')}`}>{match.p2 ? match.p2.name : ""}</span>
          </div>
      </div>
  );

  // --- ALTURA DINÁMICA DEL CUADRO ---
  const getContainerHeight = () => {
      // isLarge = 32 jugadores (16 partidos R1) -> 1600px
      if (bracketData.size === 32) return "min-h-[1600px]";
      if (bracketData.size === 16) return "min-h-[850px]";
      return "min-h-[500px]";
  };

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
              }).map((t) => (
                <Button key={t.id} onClick={() => {
                  if (t.type === "direct") { fetchBracketData(navState.category, t.short); setNavState({ ...navState, level: "direct-bracket", tournament: t.name, tournamentShort: t.short }); }
                  else { fetchGroupPhase(navState.category, t.short); }
                }} className={buttonStyle}>{t.name}</Button>
              ))}
            </div>
          )}
          {navState.level === "tournament-phases" && (
            <div className="space-y-4 text-center text-center">
              <h2 className="text-2xl font-black mb-4 text-slate-800 uppercase">Fases del Torneo</h2>
              {navState.hasGroups ? (
                <>
                  <Button onClick={() => setNavState({ ...navState, level: "group-phase" })} className={buttonStyle}><Users className="mr-2" /> Fase de Grupos</Button>
                  <Button onClick={() => { fetchBracketData(navState.currentCat, navState.currentTour); setNavState({ ...navState, level: "direct-bracket", tournament: navState.currentTour, tournamentShort: navState.currentTour }); }} className={buttonStyle}><Grid3x3 className="mr-2" /> Cuadro Final</Button>
                </>
              ) : (
                <>
                  <Button onClick={() => runATPDraw(navState.currentCat, navState.currentTour)} className={buttonStyle}><RefreshCw className="mr-2" /> Realizar Sorteo ATP</Button>
                  <Button onClick={() => { fetchBracketData(navState.currentCat, navState.currentTour); setNavState({ ...navState, level: "direct-bracket", tournament: navState.currentTour, tournamentShort: navState.currentTour }); }} className={buttonStyle}><Grid3x3 className="mr-2" /> Cuadro de Eliminación</Button>
                </>
              )}
            </div>
          )}
        </div>

        {navState.level === "generate-bracket" && (
          <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl text-center">
             <div className="bg-[#b35a38] p-4 rounded-2xl mb-8 text-center text-white italic min-w-[300px] mx-auto sticky left-0">
               <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider">{navState.bracketSize === 32 ? "Sorteo 16avos" : navState.bracketSize === 16 ? "Sorteo Octavos" : navState.bracketSize === 8 ? "Sorteo Cuartos" : "Sorteo Semis"}</h2>
             </div>
             <div className="flex flex-col items-center gap-2 mb-8">{generatedBracket.map((match, i) => (
                    <div key={i} className="w-full"><GeneratedMatch match={match} />
                        {i === (generatedBracket.length / 2) - 1 && (<div className="w-full max-w-md my-8 flex items-center gap-4 opacity-50 mx-auto"><div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent flex-1" /><span className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">Mitad de Cuadro</span><div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent flex-1" /></div>)}
                    </div>
                ))}</div>
             <div className="flex flex-col md:flex-row gap-4 justify-center mt-8 sticky bottom-4 z-20">
                <Button onClick={() => runDirectDraw(navState.category, navState.tournamentShort)} className="bg-orange-500 text-white font-bold h-12 px-8 shadow-lg"><Shuffle className="mr-2 w-4 h-4" /> Sortear</Button>
                <Button onClick={confirmarSorteoCuadro} className="bg-green-600 text-white font-bold h-12 px-8"><Send className="mr-2" /> CONFIRMAR Y ENVIAR</Button>
                <Button onClick={() => setNavState({ ...navState, level: "direct-bracket" })} className="bg-red-600 text-white font-bold h-12 px-8"><Trash2 className="mr-2" /> ELIMINAR</Button>
             </div>
          </div>
        )}

        {navState.level === "group-phase" && (
          <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl min-h-[600px] text-center">
            <div className="flex justify-between items-center mb-8"><Button onClick={goBack} variant="outline" size="sm" className="border-[#b35a38] text-[#b35a38] font-bold"><ArrowLeft className="mr-2" /> ATRÁS</Button>
              {!isSorteoConfirmado && !isFixedData && (<div className="flex space-x-2 text-center text-center"><Button onClick={() => runATPDraw(navState.currentCat, navState.currentTour)} className="bg-green-600 text-white font-bold"><Shuffle className="mr-2" /> SORTEAR</Button><Button onClick={confirmarYEnviar} size="sm" className="bg-green-600 text-white font-bold px-8"><Send className="mr-2" /> CONFIRMAR Y ENVIAR</Button><Button onClick={() => { setGroupData([]); setNavState({...navState, level: "tournament-phases"}); }} size="sm" variant="destructive" className="font-bold"><Trash2 className="mr-2" /> ELIMINAR</Button></div>)}
            </div>
            <div className="bg-[#b35a38] p-4 rounded-2xl mb-8 text-center text-white italic"><h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider">{navState.currentTour} - Fase de Grupos</h2><p className="text-xs opacity-80 mt-1 font-bold uppercase">{navState.currentCat}</p></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">{groupData.map((group, idx) => <GroupTable key={idx} group={group} />)}</div>
          </div>
        )}

        {navState.level === "direct-bracket" && (
          <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-4 shadow-2xl overflow-x-auto text-center">
            <div className="bg-[#b35a38] p-3 rounded-2xl mb-6 text-center text-white italic min-w-[300px] md:min-w-[800px] mx-auto sticky left-0 text-center"><h2 className="text-2xl font-black uppercase tracking-wider">{navState.tournament} - {navState.selectedCategory}</h2></div>
            {bracketData.hasData ? (
              <div className={`flex flex-row items-center justify-between min-w-[1300px] py-2 relative text-center ${getContainerHeight()}`}>
                
                {/* 16avos - Solo si size 32 */}
                {bracketData.size === 32 && (
                  <div className="flex flex-col justify-around h-full w-80 relative text-left">
                    {Array.from({length: 16}, (_, i) => i * 2).map((idx) => {
                      const p1 = bracketData.r1[idx]; const p2 = bracketData.r1[idx+1];
                      const w1 = p1 && bracketData.r2.includes(p1);
                      const w2 = p2 && bracketData.r2.includes(p2);
                      const s1 = bracketData.seeds ? bracketData.seeds[p1] : null;
                      const s2 = bracketData.seeds ? bracketData.seeds[p2] : null;
                      return (<div key={idx} className="relative flex flex-col space-y-4 mb-4"><div className={`h-8 border-b-2 ${w1 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end relative bg-white`}><span className={`${w1 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-[10px] uppercase truncate max-w-[200px]`}>{s1 ? <span className="text-xs text-orange-600 font-black mr-1">{s1}.</span> : null}{p1 || ""}</span><span className="text-[#b35a38] font-black text-[10px] ml-2">{bracketData.s1[idx]}</span></div><div className={`h-8 border-b-2 ${w2 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end relative bg-white`}><span className={`${w2 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-[10px] uppercase truncate max-w-[200px]`}>{s2 ? <span className="text-xs text-orange-600 font-black mr-1">{s2}.</span> : null}{p2 || ""}</span><span className="text-[#b35a38] font-black text-[10px] ml-2">{bracketData.s1[idx+1]}</span></div><div className="absolute top-1/2 -translate-y-1/2 -right-[100px] w-[40px] h-[2px] bg-slate-300" /></div>);
                    })}
                  </div>
                )}
                
                {/* Octavos - Si size 32 o 16 */}
                {bracketData.size >= 16 && (
                <div className={`flex flex-col justify-around h-full w-80 relative ${bracketData.size === 32 ? 'ml-24' : ''} text-left`}>
                  {Array.from({length: 8}, (_, i) => i * 2).map((idx) => {
                    // Si size 16, r1 son Octavos. Si size 32, r2 son Octavos.
                    const rBase = bracketData.size === 32 ? bracketData.r2 : bracketData.r1;
                    const sBase = bracketData.size === 32 ? bracketData.s2 : bracketData.s1;
                    const rNext = bracketData.size === 32 ? bracketData.r3 : bracketData.r2;

                    const p1 = rBase[idx]; const p2 = rBase[idx+1];
                    const w1 = p1 && rNext.includes(p1);
                    const w2 = p2 && rNext.includes(p2);
                    const s1 = sBase[idx]; const s2 = sBase[idx+1];
                    const seed1 = bracketData.seeds ? bracketData.seeds[p1] : null;
                    const seed2 = bracketData.seeds ? bracketData.seeds[p2] : null;
                    const spaceY = bracketData.size === 32 ? 'space-y-36' : 'space-y-12';

                    return (<div key={idx} className={`relative flex flex-col ${spaceY} mb-8`}><div className={`h-10 border-b-2 ${w1 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end bg-white relative text-left`}><span className={`${w1 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-sm uppercase truncate`}>{seed1 ? <span className="text-base text-orange-600 font-black mr-1">{seed1}.</span> : null}{p1 || ""}</span><span className="text-[#b35a38] font-black text-sm ml-3">{s1}</span></div><div className={`h-10 border-b-2 ${w2 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end relative bg-white text-left`}><span className={`${w2 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-sm uppercase truncate`}>{seed2 ? <span className="text-base text-orange-600 font-black mr-1">{seed2}.</span> : null}{p2 || ""}</span><span className="text-[#b35a38] font-black text-sm ml-3">{s2}</span></div><div className="absolute top-1/2 -translate-y-1/2 -right-[120px] w-[40px] h-[2px] bg-slate-300" /></div>);
                  })}
                </div>
                )}

                {/* Cuartos - Siempre */}
                <div className={`flex flex-col justify-around h-full w-80 ${bracketData.size >= 16 ? 'ml-32' : ''} text-left`}>
                  {Array.from({length: 4}, (_, i) => i * 2).map((idx) => {
                    const rBase = bracketData.size === 32 ? bracketData.r3 : (bracketData.size === 16 ? bracketData.r2 : bracketData.r1);
                    const sBase = bracketData.size === 32 ? bracketData.s3 : (bracketData.size === 16 ? bracketData.s2 : bracketData.s1);
                    const rNext = bracketData.size === 32 ? bracketData.r4 : (bracketData.size === 16 ? bracketData.r3 : bracketData.r2);

                    const p1 = rBase[idx]; const p2 = rBase[idx+1];
                    const w1 = p1 && rNext.includes(p1);
                    const w2 = p2 && rNext.includes(p2);
                    const s1 = sBase[idx]; const s2 = sBase[idx+1];
                    const seed1 = bracketData.seeds ? bracketData.seeds[p1] : null;
                    const seed2 = bracketData.seeds ? bracketData.seeds[p2] : null;
                    
                    let spaceY = 'space-y-32';
                    if (bracketData.size === 32) spaceY = 'space-y-[26rem]';
                    if (bracketData.size === 8) spaceY = 'space-y-12';

                    return (<div key={idx} className={`relative flex flex-col ${spaceY} mb-16`}><div className={`h-12 border-b-2 ${w1 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end bg-white relative text-center`}><span className={`${w1 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-base uppercase`}>{seed1 ? <span className="text-xl text-orange-600 font-black mr-1">{seed1}.</span> : null}{p1 || ""}</span><span className="text-[#b35a38] font-black text-lg ml-4">{s1}</span></div><div className={`h-12 border-b-2 ${w2 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end bg-white relative text-center`}><span className={`${w2 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-base uppercase`}>{seed2 ? <span className="text-xl text-orange-600 font-black mr-1">{seed2}.</span> : null}{p2 || ""}</span><span className="text-[#b35a38] font-black text-lg ml-4">{s2}</span></div><div className="absolute top-1/2 -translate-y-1/2 -right-[140px] w-[40px] h-[2px] bg-slate-300" /></div>);
                  })}
                </div>
                {/* Finalista */}
                <div className="flex flex-col justify-center h-full items-center ml-32 w-96 relative text-center">
                  <div className={`w-full ${bracketData.size === 8 ? 'space-y-12' : 'space-y-32'} mb-12 text-center`}>{[0, 1].map((idx) => {
                      const rFinal = bracketData.size === 32 ? bracketData.r4 : (bracketData.size === 16 ? bracketData.r3 : bracketData.r2);
                      const sFinal = bracketData.size === 32 ? bracketData.s4 : (bracketData.size === 16 ? bracketData.s3 : bracketData.s2);
                      const p = rFinal[idx]; const s = sFinal[idx];
                      const win = p && p === bracketData.winner;
                      const seed = bracketData.seeds ? bracketData.seeds[p] : null;
                      return (<div key={idx} className={`h-14 border-b-4 ${win ? 'border-[#b35a38]' : 'border-slate-200'} flex justify-between items-end bg-white text-center`}><span className={`${win ? 'text-[#b35a38] font-black' : 'text-slate-800 font-bold'} uppercase text-xl text-center`}>{seed ? <span className="text-xl text-orange-600 font-black mr-2">{seed}.</span> : null}{p || ""}</span><span className="text-[#b35a38] font-black text-lg ml-4">{s}</span></div>);
                    })}</div>
                  <Trophy className="w-24 h-24 text-orange-400 mb-6 mx-auto text-center animate-bounce" /><div className="flex flex-col items-center"><span className="text-[#b35a38]/70 font-black text-xl uppercase tracking-[0.2em] mb-2">CAMPEÓN</span><span className="text-[#b35a38] font-black text-4xl md:text-5xl italic uppercase text-center w-full block drop-shadow-sm">{bracketData.winner || ""}</span></div>
                </div>
              </div>
            ) : (<div className="py-20 flex flex-col items-center justify-center text-slate-400 text-center"><AlertCircle className="w-20 h-20 mb-4 opacity-50" /><h3 className="text-2xl font-black uppercase tracking-wider mb-2">Cuadro no definido aún</h3>{bracketData.canGenerate ? (<div className="mt-4"><p className="font-medium text-slate-500 mb-4">Se encontraron clasificados en el sistema.</p><Button onClick={() => runDirectDraw(navState.category, navState.tournamentShort)} className="bg-green-600 text-white font-bold px-8 shadow-lg mt-4"><Shuffle className="mr-2 w-4 h-4" /> Sortear</Button></div>) : (<p className="font-medium text-slate-500">Próximamente...</p>)}</div>)}
          </div>
        )}

        {showRankingCalc && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative max-h-[80vh] overflow-y-auto">
                    <Button onClick={() => setShowRankingCalc(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500" variant="ghost"><X className="w-6 h-6" /></Button>
                    <div className="text-center mb-6"><Trophy className="w-12 h-12 text-orange-500 mx-auto mb-2" /><h3 className="text-2xl font-black uppercase text-slate-800">Cálculo de Puntos</h3><p className="text-sm text-slate-500 font-medium">{navState.tournamentShort}</p></div>
                    <div className="bg-slate-50 rounded-xl border-2 border-slate-100 overflow-hidden"><table className="w-full text-left"><thead className="bg-[#b35a38] text-white"><tr><th className="p-3 font-bold text-sm uppercase">Jugador</th><th className="p-3 font-bold text-sm uppercase text-right">Puntos</th></tr></thead><tbody className="divide-y divide-slate-100">{calculatedRanking.map((p, i) => (<tr key={i} className="hover:bg-white transition-colors"><td className="p-3 font-bold text-slate-700 uppercase text-sm">{p.name}</td><td className="p-3 font-black text-orange-600 text-right">{p.points}</td></tr>))}</tbody></table></div>
                    <div className="mt-6 flex gap-4">
                        <Button onClick={() => { const text = calculatedRanking.map(p => `${p.name}\t${p.points}`).join('\n'); navigator.clipboard.writeText(text); alert("Tabla copiada"); }} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold h-12 rounded-xl"><Copy className="mr-2 w-4 h-4" /> COPIAR TABLA</Button>
                        <Button onClick={() => { let m = `*RANKING CALCULADO - ${navState.tournamentShort}*\n\n`; calculatedRanking.forEach(p => { m += `${p.name}: ${p.points}\n`; }); window.open(`https://wa.me/${MI_TELEFONO}?text=${encodeURIComponent(m)}`, '_blank'); }} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-xl"><Send className="mr-2 w-4 h-4" /> ENVIAR POR WHATSAPP</Button>
                    </div>
                </div>
            </div>
        )}

        {navState.level === "ranking-view" && (
          <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden text-center text-center">
            <div className="bg-[#b35a38] p-6 rounded-2xl mb-8 text-white italic text-center"><h2 className="text-3xl md:text-5xl font-black uppercase tracking-wider text-center">{navState.selectedCategory} {navState.year}</h2></div>
            {headers.length > 0 && rankingData.length > 0 ? (
              <div className="overflow-x-auto text-center"><table className="w-full text-lg font-bold text-center"><thead><tr className="bg-[#b35a38] text-white"><th className="p-4 text-center font-black first:rounded-tl-xl text-center">POS</th><th className="p-4 text-center font-black text-center text-center">JUGADOR</th>{headers.map((h, i) => (<th key={i} className="p-4 text-center font-black hidden sm:table-cell text-center">{h}</th>))}<th className="p-4 text-center font-black bg-[#8c3d26] last:rounded-tr-xl text-center text-center">TOTAL</th></tr></thead><tbody>{rankingData.map((p, i) => (<tr key={i} className="border-b border-[#fffaf5] hover:bg-[#fffaf5] text-center text-center"><td className="p-4 text-slate-400 text-center">{i + 1}</td><td className="p-4 uppercase text-slate-700 text-center">{p.name}</td>{p.points.map((val: any, idx: number) => (<td key={idx} className="p-4 text-center text-slate-400 hidden sm:table-cell text-center">{val || 0}</td>))}<td className="p-4 text-[#b35a38] text-2xl font-black bg-[#fffaf5] text-center">{p.total}</td></tr>))}</tbody></table></div>
            ) : (<div className="h-64 flex items-center justify-center text-slate-300 uppercase font-black animate-pulse text-center">Cargando datos...</div>)}
          </div>
        )}
      </div>
      {/* TRIGGER SECRETO DE RANKING EN EL FOOTER */}
      <p onClick={handleFooterClick} className="text-center text-slate-500/80 mt-12 text-sm font-bold uppercase tracking-widest animate-pulse text-center cursor-pointer select-none active:scale-95 transition-transform">Sistema de seguimiento de torneos en vivo</p>
    </div>
  );
}