"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Grid3x3, RefreshCw, ArrowLeft, Trash2, CheckCircle, Loader2, Send, Shuffle } from "lucide-react"

// --- CONFIGURACIÓN DE DATOS ---
const ID_2025 = '1_tDp8BrXZfmmmfyBdLIUhPk7PwwKvJ_t'; 
const ID_DATOS_GENERALES = '1RVxm-lcNp2PWDz7HcDyXtq0bWIWA9vtw'; // Ranking e Inscriptos
const ID_TORNEOS = '117mHAgirc9WAaWjHAhsalx1Yp6DgQj5bv2QpVZ-nWmI'; // Grupos y Cuadros Fijos
const MI_TELEFONO = "5491150568353"; 

const tournaments = [
  { id: "adelaide", name: "Adelaide", short: "Adelaide", type: "direct" },
  { id: "s8_500", name: "Super 8 / 500", short: "S8 500", type: "direct" },
  { id: "s8_250", name: "Super 8 / 250", short: "S8 250", type: "direct" },
  { id: "ao", name: "Australian Open", short: "AO", type: "full" },
  { id: "iw", name: "Indian Wells", short: "IW", type: "full" },
  { id: "mc", name: "Monte Carlo", short: "MC", type: "full" },
  { id: "rg", name: "Roland Garros", short: "RG", type: "full" },
  { id: "wimbledon", name: "Wimbledon", short: "W", type: "full" },
  { id: "us", name: "US Open", short: "US", type: "full" },
]

export default function Home() {
  const [navState, setNavState] = useState<any>({ level: "home" })
  const [rankingData, setRankingData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [bracketData, setBracketData] = useState<any>({ r1: [], s1: [], r2: [], s2: [], r3: [], s3: [], r4: [], s4: [], winner: "", isLarge: false });
  const [groupData, setGroupData] = useState<any[]>([])
  const [qualifiers, setQualifiers] = useState<any>({ winners: [], runners: [] })
  const [isSorteoConfirmado, setIsSorteoConfirmado] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const parseCSV = (text: string) => {
    if (!text) return [];
    return text.split('\n').map(row => 
      row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c ? c.replace(/"/g, '').trim() : "")
    );
  };

  // --- 1. LECTURA AUTOMÁTICA DE GRUPOS FIJOS (ID_TORNEOS) ---
  const fetchGroupPhase = async (categoryShort: string, tournamentShort: string) => {
    setIsLoading(true);
    setGroupData([]);
    setQualifiers({ winners: [], runners: [] });
    setIsSorteoConfirmado(false);
    try {
      // Busca la pestaña exacta: "B1 Adelaide", "C AO"
      const sheetName = `${categoryShort} ${tournamentShort}`;
      const url = `https://docs.google.com/spreadsheets/d/${ID_TORNEOS}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
      const res = await fetch(url);
      const csvText = await res.text();
      
      // Si la pestaña existe y tiene datos de "Zona" o "Grupo"
      if (res.ok && !csvText.includes("<!DOCTYPE html>") && (csvText.includes("Zona") || csvText.includes("Grupo"))) {
        const rows = parseCSV(csvText);
        const parsedGroups = [];
        const winners = [];
        const runners = [];

        for (let i = 0; i < rows.length; i += 4) {
          if (rows[i] && rows[i][0] && (rows[i][0].includes("Zona") || rows[i][0].includes("Grupo"))) {
            parsedGroups.push({
              groupName: rows[i][0],
              players: [rows[i+1]?.[0], rows[i+2]?.[0], rows[i+3]?.[0]].filter(n => n && n !== "-" && n !== ""),
              results: rows.slice(i+1, i+4).map(r => r.slice(1, 4))
            });
            // Leer clasificados de Columna F (Idx 5) y G (Idx 6)
            // Asumimos que el dueño escribe en la fila de la Zona correspondiente
            if (rows[i+1]?.[5]) winners.push(rows[i+1][5]); 
            if (rows[i+1]?.[6]) runners.push(rows[i+1][6]);
          }
        }

        if (parsedGroups.length > 0) {
          setGroupData(parsedGroups);
          setQualifiers({ winners, runners });
          setIsSorteoConfirmado(true);
          setNavState({ ...navState, level: "group-phase", currentCat: categoryShort, currentTour: tournamentShort });
        } else {
          // Pestaña vacía -> Sorteo
          setNavState({ ...navState, level: "tournament-phases", currentCat: categoryShort, currentTour: tournamentShort });
        }
      } else {
        // Pestaña no existe -> Sorteo
        setNavState({ ...navState, level: "tournament-phases", currentCat: categoryShort, currentTour: tournamentShort });
      }
    } catch (e) {
      setNavState({ ...navState, level: "tournament-phases", currentCat: categoryShort, currentTour: tournamentShort });
    } finally { setIsLoading(false); }
  }

  // --- 2. MOTOR DE SORTEO ATP (ID_DATOS_GENERALES) ---
  const runATPDraw = async (categoryShort: string, tournamentShort: string) => {
    setIsLoading(true);
    setIsSorteoConfirmado(false);
    try {
      // Ranking
      const rankUrl = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(`${categoryShort} 2026`)}`;
      const rankRes = await fetch(rankUrl);
      const rankCsv = await rankRes.text();
      const playersRanking = parseCSV(rankCsv).slice(1).map(row => ({
        name: row[1] || "", total: row[11] ? parseInt(row[11]) : 0
      })).filter(p => p.name !== "");

      // Inscriptos
      const inscUrl = `https://docs.google.com/spreadsheets/d/${ID_DATOS_GENERALES}/gviz/tq?tqx=out:csv&sheet=Inscriptos`;
      const inscRes = await fetch(inscUrl);
      const inscCsv = await inscRes.text();
      const filteredInscriptos = parseCSV(inscCsv).slice(1).filter(cols => 
        cols[0] === tournamentShort && cols[1] === categoryShort
      ).map(cols => cols[2]);

      if (filteredInscriptos.length === 0) {
        alert("No se encontraron inscriptos.");
        setIsLoading(false);
        return;
      }

      const entryList = filteredInscriptos.map(n => {
        const p = playersRanking.find(pr => pr.name.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(pr.name.toLowerCase()));
        return { name: n, points: p ? p.total : 0 };
      }).sort((a, b) => b.points - a.points);

      const totalPlayers = entryList.length;
      if (totalPlayers < 2) { alert("Mínimo 2 jugadores."); setIsLoading(false); return; }

      // Grupos de 2 y 3
      let groupsOf3 = 0, groupsOf2 = 0;
      const remainder = totalPlayers % 3;
      if (remainder === 0) groupsOf3 = totalPlayers / 3;
      else if (remainder === 1) { groupsOf2 = 2; groupsOf3 = (totalPlayers - 4) / 3; }
      else if (remainder === 2) { groupsOf2 = 1; groupsOf3 = (totalPlayers - 2) / 3; }

      let capacities = [];
      for(let i=0; i<groupsOf3; i++) capacities.push(3);
      for(let i=0; i<groupsOf2; i++) capacities.push(2);
      capacities = capacities.sort(() => Math.random() - 0.5);

      const numGroups = capacities.length;
      let groups = capacities.map((cap, i) => ({
        groupName: `Zona ${i + 1}`,
        capacity: cap,
        players: [],
        results: [["-","-","-"], ["-","-","-"], ["-","-","-"]]
      }));

      // Semillas
      for (let i = 0; i < numGroups; i++) {
        if (entryList[i]) groups[i].players.push(entryList[i].name);
      }

      // Resto
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
    } catch (e) { alert("Error al sortear."); } finally { setIsLoading(false); }
  }

  // --- 3. SORTEO CUADRO FINAL (LÓGICA CRUZADA ESTRICTA) ---
  const generateFinalBracket = () => {
    const { winners, runners } = qualifiers;
    if (winners.length < 2) {
      alert("Faltan clasificados. Llená las columnas F (1ros) y G (2dos) en el Excel.");
      return;
    }

    let r1 = [], s1 = [], r2 = [], s2 = [];
    const numZones = winners.length;

    // --- LÓGICA 2 ZONAS ---
    if (numZones === 2) {
      // 1A vs 2B y 1B vs 2A
      r2 = [winners[0], runners[1], winners[1], runners[0]]; 
      s2 = ["", "", "", ""];
    }
    // --- LÓGICA 4 ZONAS (REGLA DE ORO + SORTEO) ---
    else if (numZones === 4) {
      // 1. Seeds Fijos
      const seedTop = winners[0]; // 1A
      const seedBottom = winners[1]; // 2A (Visualmente abajo)

      // 2. Seeds Flotantes (3A y 4A)
      // Se sortean para ver cuál va a la mitad de arriba y cuál a la de abajo
      const floatingSeeds = [
        { name: winners[2], groupIdx: 2 }, // 3A
        { name: winners[3], groupIdx: 3 }  // 4A
      ].sort(() => Math.random() - 0.5);

      const midSeedTop = floatingSeeds[0];    // Va a Top Half
      const midSeedBottom = floatingSeeds[1]; // Va a Bottom Half

      // 3. Pool de Segundos (Runners)
      let runnersForTop = [];
      let runnersForBottom = [];

      // REGLA FIJA:
      // 1B (runners[0]) -> Bottom (Opuesto a 1A)
      runnersForBottom.push(runners[0]);
      // 2B (runners[1]) -> Top (Opuesto a 2A)
      runnersForTop.push(runners[1]);

      // REGLA DINÁMICA:
      // Si 3A está en Top -> 3B (runners[2]) va a Bottom
      if (midSeedTop.groupIdx === 2) runnersForBottom.push(runners[2]);
      else runnersForTop.push(runners[2]);

      // Si 4A está en Top -> 4B (runners[3]) va a Bottom
      if (midSeedTop.groupIdx === 3) runnersForBottom.push(runners[3]);
      else runnersForTop.push(runners[3]);

      // Mezclar los pools para que no sea fijo el cruce
      runnersForTop.sort(() => Math.random() - 0.5);
      runnersForBottom.sort(() => Math.random() - 0.5);

      // ASIGNACIÓN AL CUADRO (R2 - Cuartos)
      // Top Half
      r2[0] = seedTop;           r2[1] = runnersForTop[0];
      r2[2] = midSeedTop.name;   r2[3] = runnersForTop[1];

      // Bottom Half
      r2[4] = midSeedBottom.name; r2[5] = runnersForBottom[0];
      r2[6] = seedBottom;         r2[7] = runnersForBottom[1];

      s2 = Array(8).fill("");
    } 
    else {
      alert("Sorteo automático solo para 2 o 4 zonas. Hacelo manual en el Excel.");
      return;
    }

    setBracketData({ 
      r1: [], s1: [], 
      r2, s2, 
      r3: Array(4).fill(""), s3: Array(4).fill(""), 
      r4: Array(2).fill(""), s4: Array(2).fill(""), 
      winner: "", isLarge: numZones === 4 
    });
    setNavState({ ...navState, level: "direct-bracket", generatedFromGroups: true });
  }

  const confirmarGruposYEnviar = () => {
    let mensaje = `*SORTEO GRUPOS - ${navState.currentTour}*\n*Categoría:* ${navState.currentCat}\n\n`;
    groupData.forEach(g => { mensaje += `*${g.groupName}*\n${g.players.join('\n')}\n\n`; });
    window.open(`https://wa.me/${MI_TELEFONO}?text=${encodeURIComponent(mensaje)}`, '_blank');
    setIsSorteoConfirmado(true);
  };

  const confirmarLlaveYEnviar = () => {
    let mensaje = `*CUADRO FINAL - ${navState.currentTour}*\n*Categoría:* ${navState.currentCat}\n\n`;
    if (bracketData.isLarge) {
      mensaje += `Cuartos:\n1: ${bracketData.r2[0]} vs ${bracketData.r2[1]}\n2: ${bracketData.r2[2]} vs ${bracketData.r2[3]}\n3: ${bracketData.r2[4]} vs ${bracketData.r2[5]}\n4: ${bracketData.r2[6]} vs ${bracketData.r2[7]}`;
    } else {
      mensaje += `Semis:\n1: ${bracketData.r2[0]} vs ${bracketData.r2[1]}\n2: ${bracketData.r2[2]} vs ${bracketData.r2[3]}`;
    }
    window.open(`https://wa.me/${MI_TELEFONO}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const GroupTable = ({ group }: { group: any }) => (
    <div className="bg-white border-2 border-[#b35a38]/20 rounded-2xl overflow-hidden shadow-lg mb-4 text-center">
      <div className="bg-[#b35a38] p-3 text-white font-black italic text-center uppercase tracking-wider">{group.groupName}</div>
      <table className="w-full text-[11px] md:text-xs">
        <thead>
          <tr className="bg-slate-50 border-b">
            <th className="p-3 border-r w-32 text-left font-bold text-[#b35a38]">JUGADOR</th>
            {group.players.map((p: string, i: number) => (
              <th key={i} className="p-3 border-r text-center font-bold text-slate-400">{p ? p.split(' ')[0] : ""}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {group.players.map((p1: string, i: number) => (
            <tr key={i} className="border-b">
              <td className="p-3 border-r font-black bg-slate-50 uppercase text-[#b35a38] text-left">{p1}</td>
              {group.players.map((p2: string, j: number) => (
                <td key={j} className={`p-3 border-r text-center font-black text-lg ${i === j ? 'bg-slate-100 text-slate-300' : 'text-slate-700'}`}>
                  {i === j ? "/" : (group.results?.[i]?.[j] || "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

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

  const fetchBracketData = async (category: string, tournamentShort: string) => {
    setIsLoading(true); setBracketData({ r1: [], s1: [], r2: [], s2: [], r3: [], s3: [], r4: [], s4: [], winner: "", isLarge: false });
    const sheetName = `${category} ${tournamentShort}`;
    const url = `https://docs.google.com/spreadsheets/d/${ID_TORNEOS}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    try {
      const response = await fetch(url);
      const csvText = await response.text();
      const rows = parseCSV(csvText);
      const isLarge = rows.length > 8 && rows[8] && rows[8][0] !== "";
      if (isLarge) {
        setBracketData({ r1: rows.map(r => r[0]).slice(0, 16), s1: rows.map(r => r[1]).slice(0, 16), r2: rows.map(r => r[2]).slice(0, 8), s2: rows.map(r => r[3]).slice(0, 8), r3: rows.map(r => r[4]).slice(0, 4), s3: rows.map(r => r[5]).slice(0, 4), r4: rows.map(r => r[6]).slice(0, 2), s4: rows.map(r => r[7]).slice(0, 2), winner: rows[0][8] || "", isLarge: true });
      } else {
        setBracketData({ r1: rows.map(r => r[0]).slice(0, 8), s1: rows.map(r => r[1]).slice(0, 8), r2: rows.map(r => r[2]).slice(0, 4), s2: rows.map(r => r[3]).slice(0, 4), r3: rows.map(r => r[4]).slice(0, 2), s3: rows.map(r => r[5]).slice(0, 2), winner: rows[0][6] || "", isLarge: false });
      }
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  }

  const goBack = () => {
    setIsSorteoConfirmado(false);
    const levels: any = { "main-menu": "home", "year-selection": "main-menu", "category-selection": "main-menu", "tournament-selection": "category-selection", "tournament-phases": "tournament-selection", "group-phase": "tournament-selection", "bracket-phase": "tournament-phases", "ranking-view": "category-selection", "direct-bracket": "tournament-selection", "damas-empty": "category-selection" };
    setNavState({ ...navState, level: levels[navState.level] || "home" });
  }

  const buttonStyle = "w-full text-lg h-20 border-2 border-[#b35a38]/20 bg-white text-[#b35a38] hover:bg-[#b35a38] hover:text-white transform hover:scale-[1.01] transition-all duration-300 font-semibold shadow-md rounded-2xl flex items-center justify-center text-center";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-[#fffaf5]">
      <div className={`w-full ${['direct-bracket', 'group-phase', 'ranking-view', 'damas-empty'].includes(navState.level) ? 'max-w-[95%]' : 'max-w-6xl'} mx-auto z-10 text-center`}>
        
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
              <Button onClick={() => runATPDraw(navState.currentCat, navState.currentTour)} className={buttonStyle}><RefreshCw className="mr-2" /> Realizar Sorteo ATP</Button>
              <Button onClick={() => { fetchBracketData(navState.currentCat, navState.currentTour); setNavState({ ...navState, level: "direct-bracket", tournament: navState.currentTour }); }} className={buttonStyle}><Grid3x3 className="mr-2" /> Cuadro de Eliminación</Button>
            </div>
          )}
        </div>

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
              <div className="flex space-x-2 text-center">
                {!isSorteoConfirmado && (
                  <>
                    <Button onClick={() => runATPDraw(navState.currentCat, navState.currentTour)} size="sm" className="bg-orange-500 text-white font-bold"><RefreshCw className="mr-2" /> REHACER</Button>
                    <Button onClick={confirmarYEnviar} size="sm" className="bg-green-600 text-white font-bold px-8"><Send className="mr-2" /> CONFIRMAR GRUPOS</Button>
                    <Button onClick={() => setGroupData([])} size="sm" variant="destructive" className="font-bold"><Trash2 className="mr-2" /> ELIMINAR</Button>
                  </>
                )}
                {/* BOTÓN SORTEAR CUADRO FINAL (Solo si hay clasificados en Excel) */}
                {isSorteoConfirmado && qualifiers.winners.length > 0 && (
                  <Button onClick={generateFinalBracket} size="sm" className="bg-[#b35a38] text-white font-bold px-8 animate-pulse"><Shuffle className="mr-2" /> SORTEAR CUADRO FINAL</Button>
                )}
              </div>
            </div>
            <div className="bg-[#b35a38] p-4 rounded-2xl mb-8 text-center text-white italic">
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider">{navState.currentTour} - Fase de Grupos</h2>
              <p className="text-xs opacity-80 mt-1 font-bold uppercase">{navState.currentCat}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {groupData.map((group, idx) => <GroupTable key={idx} group={group} />)}
            </div>
          </div>
        )}

        {/* BRACKET (Con scroll externo y altura automática) */}
        {navState.level === "direct-bracket" && (
          <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-4 shadow-2xl overflow-hidden text-center">
            {navState.generatedFromGroups && (
               <div className="mb-4 flex justify-end">
                 <Button onClick={confirmarLlaveYEnviar} className="bg-green-600 text-white font-bold"><Send className="mr-2" /> CONFIRMAR LLAVE</Button>
               </div>
            )}
            <div className="bg-[#b35a38] p-3 rounded-2xl mb-6 text-center text-white italic min-w-[800px]">
              <h2 className="text-2xl font-black uppercase tracking-wider">{navState.tournament || navState.currentTour} - {navState.selectedCategory || navState.currentCat}</h2>
            </div>
            <div className="flex flex-row items-center justify-between min-w-[1300px] py-2 relative text-center h-auto min-h-[600px] items-stretch">
              
              {bracketData.isLarge && (
                <div className="flex flex-col justify-around w-80 relative text-left h-auto py-10">
                  {[0, 2, 4, 6, 8, 10, 12, 14].map((idx) => {
                    const p1 = bracketData.r1[idx]; const p2 = bracketData.r1[idx+1];
                    const w1 = p1 && bracketData.r2.includes(p1);
                    const w2 = p2 && bracketData.r2.includes(p2);
                    return (
                      <div key={idx} className="relative flex flex-col justify-center h-full max-h-[80px] mb-8">
                        <div className={`h-8 border-b-2 ${w1 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end relative bg-white`}><span className={`${w1 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-[10px] uppercase truncate max-w-[200px]`}>{p1 || "TBD"}</span><span className="text-[#b35a38] font-black text-[10px] ml-2">{bracketData.s1[idx]}</span><div className="absolute -right-[60px] bottom-[-2px] w-[60px] h-[2px] bg-slate-300" /></div>
                        <div className={`h-8 border-b-2 ${w2 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end relative bg-white`}><span className={`${w2 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-[10px] uppercase truncate max-w-[200px]`}>{p2 || "TBD"}</span><span className="text-[#b35a38] font-black text-[10px] ml-2">{bracketData.s1[idx+1]}</span><div className="absolute -right-[60px] bottom-[-2px] w-[60px] h-[2px] bg-slate-300" /></div>
                        <div className="absolute top-[50%] translate-y-[-50%] -right-[100px] w-[40px] h-[2px] bg-slate-300" />
                      </div>
                    )
                  })}
                </div>
              )}

              <div className={`flex flex-col justify-around w-80 relative ${bracketData.isLarge ? 'ml-24' : ''} text-left h-auto py-20`}>
                {[0, 2, 4, 6].map((idx) => {
                  const p1 = bracketData.isLarge ? bracketData.r2[idx] : bracketData.r1[idx];
                  const p2 = bracketData.isLarge ? bracketData.r2[idx+1] : bracketData.r1[idx+1];
                  const w1 = p1 && (bracketData.isLarge ? bracketData.r3.includes(p1) : bracketData.r2.includes(p1));
                  const w2 = p2 && (bracketData.isLarge ? bracketData.r3.includes(p2) : bracketData.r2.includes(p2));
                  const s1 = bracketData.isLarge ? bracketData.s2[idx] : bracketData.s1[idx];
                  const s2 = bracketData.isLarge ? bracketData.s2[idx+1] : bracketData.s1[idx+1];
                  return (
                    <div key={idx} className="relative flex flex-col justify-center h-full mb-16">
                      <div className={`h-10 border-b-2 ${w1 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end bg-white relative`}><span className={`${w1 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-sm uppercase truncate`}>{p1 || "TBD"}</span><span className="text-[#b35a38] font-black text-sm ml-3">{s1}</span><div className="absolute -right-[80px] bottom-[-2px] w-[80px] h-[2px] bg-slate-300" /></div>
                      <div className={`h-10 border-b-2 ${w2 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end relative bg-white`}><span className={`${w2 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-sm uppercase truncate`}>{p2 || "TBD"}</span><span className="text-[#b35a38] font-black text-sm ml-3">{s2}</span><div className="absolute -right-[80px] bottom-[-2px] w-[80px] h-[2px] bg-slate-300" /></div>
                      <div className="absolute top-[50%] translate-y-[-50%] -right-[120px] w-[40px] h-[2px] bg-slate-300" />
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col justify-around w-80 ml-32 relative text-left h-auto py-32">
                {[0, 2].map((idx) => {
                  const p1 = bracketData.isLarge ? bracketData.r3[idx] : bracketData.r2[idx];
                  const p2 = bracketData.isLarge ? bracketData.r3[idx+1] : bracketData.r2[idx+1];
                  const w1 = p1 && (bracketData.isLarge ? bracketData.r4.includes(p1) : bracketData.r3.includes(p1));
                  const w2 = p2 && (bracketData.isLarge ? bracketData.r4.includes(p2) : bracketData.r3.includes(p2));
                  const s1 = bracketData.isLarge ? bracketData.s3[idx] : bracketData.s2[idx];
                  const s2 = bracketData.isLarge ? bracketData.s3[idx+1] : bracketData.s2[idx+1];
                  return (
                    <div key={idx} className="relative flex flex-col justify-center h-full mb-24">
                      <div className={`h-12 border-b-2 ${w1 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end bg-white relative text-center`}><span className={`${w1 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-base uppercase`}>{p1 || ""}</span><span className="text-[#b35a38] font-black text-base ml-4">{s1}</span><div className="absolute -right-[100px] bottom-[-2px] w-[100px] h-[2px] bg-slate-300" /></div>
                      <div className={`h-12 border-b-2 ${w2 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end bg-white relative text-center`}><span className={`${w2 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-base uppercase`}>{p2 || ""}</span><span className="text-[#b35a38] font-black text-base ml-4">{s2}</span><div className="absolute -right-[100px] bottom-[-2px] w-[100px] h-[2px] bg-slate-300" /></div>
                      <div className="absolute top-[50%] translate-y-[-50%] -right-[140px] w-[40px] h-[2px] bg-slate-300" />
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col justify-center w-96 ml-32 relative text-center h-auto">
                <div className="w-full space-y-40 mb-20">
                  {[0, 1].map((idx) => {
                    const p = bracketData.isLarge ? bracketData.r4[idx] : bracketData.r3[idx];
                    const s = bracketData.isLarge ? bracketData.s4[idx] : bracketData.s3[idx];
                    const win = p && p === bracketData.winner;
                    return (<div key={idx} className={`h-14 border-b-4 ${win ? 'border-[#b35a38]' : 'border-slate-200'} flex justify-between items-end bg-white text-center`}><span className={`${win ? 'text-[#b35a38] font-black' : 'text-slate-800 font-bold'} uppercase text-lg text-center`}>{p || ""}</span><span className="text-[#b35a38] font-black text-lg ml-4">{s}</span></div>);
                  })}
                </div>
                <Trophy className="w-32 h-32 text-orange-400 mb-4 mx-auto text-center" />
                <span className="text-[#b35a38] font-black text-5xl italic uppercase text-center w-full block text-center">{bracketData.winner || "Campeón"}</span>
              </div>
            </div>
          </div>
        )}

        {/* RANKING BLINDADO */}
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
      <p className="text-center text-slate-500/80 mt-12 text-sm font-bold uppercase tracking-widest animate-pulse text-center">Sistema de seguimiento de torneos en vivo</p>
    </div>
  );
}