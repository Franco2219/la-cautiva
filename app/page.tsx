"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Grid3x3, RefreshCw, ArrowLeft, Trash2, CheckCircle, Loader2 } from "lucide-react"

// --- CONFIGURACIÓN DE DATOS ---
const ID_2025 = '1_tDp8BrXZfmmmfyBdLIUhPk7PwwKvJ_t'; 
const ID_2026 = '1RVxm-lcNp2PWDz7HcDyXtq0bWIWA9vtw';

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
  const [isSorteoConfirmado, setIsSorteoConfirmado] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // --- MOTOR DE SORTEO ATP CORREGIDO ---
  const runATPDraw = async (categoryShort: string, tournamentShort: string) => {
    setIsLoading(true);
    setIsSorteoConfirmado(false);
    setGroupData([]);
    try {
      const rankUrl = `https://docs.google.com/spreadsheets/d/${ID_2026}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(`${categoryShort} 2026`)}`;
      const rankRes = await fetch(rankUrl);
      const rankCsv = await rankRes.text();
      const rankRows = rankCsv.split('\n').slice(1);
      
      const playersRanking = rankRows.map(row => {
        const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/"/g, '').trim());
        return { name: cols[1], total: parseInt(cols[11]) || 0 };
      });

      const inscUrl = `https://docs.google.com/spreadsheets/d/${ID_2026}/gviz/tq?tqx=out:csv&sheet=Inscriptos`;
      const inscRes = await fetch(inscUrl);
      const inscCsv = await inscRes.text();
      const inscRows = inscCsv.split('\n').slice(1);
      
      const filteredInscriptos = inscRows.map(r => r.split(',')).filter(cols => {
        const t = cols[0]?.replace(/"/g, '').trim();
        const c = cols[1]?.replace(/"/g, '').trim();
        return t === tournamentShort && c === categoryShort;
      }).map(cols => cols[2]?.replace(/"/g, '').trim());

      if (filteredInscriptos.length === 0) {
        alert("No se encontraron inscriptos para este torneo y categoría.");
        return;
      }

      // 1. ASIGNACIÓN ESTRICTA POR RANKING
      const entryList = filteredInscriptos.map(nombre => {
        const p = playersRanking.find(pr => pr.name?.toLowerCase() === nombre?.toLowerCase());
        return { name: nombre, points: p ? p.total : 0 };
      }).sort((a, b) => b.points - a.points); // Los más altos arriba

      const numGroups = Math.floor(entryList.length / 3);
      if (numGroups === 0) return;

      // 2. Los cabezas de serie son los primeros "numGroups" en orden de ranking
      let groups = Array.from({ length: numGroups }, (_, i) => ({
        groupName: `Zona ${i + 1}`,
        players: [entryList[i].name],
        seeds: [entryList[i].name]
      }));

      // 3. El resto de los jugadores se sortean al azar
      const restOfPlayers = entryList.slice(numGroups).sort(() => Math.random() - 0.5);
      
      let curr = 0;
      restOfPlayers.forEach(p => {
        if (groups[curr]) groups[curr].players.push(p.name);
        curr = (curr + 1) % numGroups;
      });

      setGroupData(groups);
      setNavState({ ...navState, level: "group-phase" });
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }

  // --- FETCH DE RANKING CORREGIDO PARA EVITAR DESFASAJE ---
  const fetchRankingData = async (categoryShort: string, year: string) => {
    setIsLoading(true);
    // LIMPIEZA TOTAL: Borramos datos y encabezados viejos para que no haya desfasaje visual
    setRankingData([]);
    setHeaders([]); 
    
    const sheetId = year === "2025" ? ID_2025 : ID_2026;
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(`${categoryShort} ${year}`)}`;
    
    try {
      const response = await fetch(url);
      const csvText = await response.text();
      const rows = csvText.split('\n');
      const firstRow = rows[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/"/g, '').trim());
      
      // Establecemos headers nuevos ANTES de los datos
      const newHeaders = year === "2025" 
        ? [firstRow[2], firstRow[3], firstRow[4], firstRow[5], firstRow[6], firstRow[7], firstRow[8]] 
        : [firstRow[2], firstRow[3], firstRow[4], firstRow[5], firstRow[6], firstRow[7], firstRow[8], firstRow[9], firstRow[10]];
      
      setHeaders(newHeaders);
      
      const parsedData = rows.slice(1).map(row => {
        const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/"/g, '').trim());
        return { 
          name: cols[1], 
          points: year === "2025" ? [cols[2], cols[3], cols[4], cols[5], cols[6], cols[7], cols[8]] : [cols[2], cols[3], cols[4], cols[5], cols[6], cols[7], cols[8], cols[9], cols[10]], 
          total: year === "2025" ? (parseInt(cols[9]) || 0) : (parseInt(cols[11]) || 0) 
        };
      }).filter(p => p.name && p.name !== "").sort((a, b) => b.total - a.total);
      
      setRankingData(parsedData);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  }

  const fetchBracketData = async (category: string, tournamentShort: string) => {
    setIsLoading(true);
    setBracketData({ r1: [], s1: [], r2: [], s2: [], r3: [], s3: [], r4: [], s4: [], winner: "", isLarge: false });
    const sheetName = `${category} ${tournamentShort}`;
    const url = `https://docs.google.com/spreadsheets/d/${ID_2026}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    try {
      const response = await fetch(url);
      const csvText = await response.text();
      const rows = csvText.split('\n').map(row => row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/"/g, '').trim()));
      const isLarge = rows.length > 8 && rows[8] && rows[8][0] !== "";
      if (isLarge) {
        setBracketData({ r1: rows.map(r => r[0]).slice(0, 16), s1: rows.map(r => r[1]).slice(0, 16), r2: rows.map(r => r[2]).slice(0, 8), s2: rows.map(r => r[3]).slice(0, 8), r3: rows.map(r => r[4]).slice(0, 4), s3: rows.map(r => r[5]).slice(0, 4), r4: rows.map(r => r[6]).slice(0, 2), s4: rows.map(r => r[7]).slice(0, 2), winner: rows[0][8] || "", isLarge: true });
      } else {
        setBracketData({ r1: rows.map(r => r[0]).slice(0, 8), s1: rows.map(r => r[1]).slice(0, 8), r2: rows.map(r => r[2]).slice(0, 4), s2: rows.map(r => r[3]).slice(0, 4), r3: rows.map(r => r[4]).slice(0, 2), s3: rows.map(r => r[5]).slice(0, 2), winner: rows[0][6] || "", isLarge: false });
      }
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  }

  const goBack = () => {
    const levels: any = { "main-menu": "home", "year-selection": "main-menu", "category-selection": "main-menu", "tournament-selection": "category-selection", "tournament-phases": "tournament-selection", "group-phase": "tournament-phases", "bracket-phase": "tournament-phases", "ranking-view": "category-selection", "direct-bracket": "tournament-selection" };
    setNavState({ ...navState, level: levels[navState.level] || "home" });
  }

  const buttonStyle = "w-full text-lg h-20 border-2 border-[#b35a38]/20 bg-white text-[#b35a38] hover:bg-[#b35a38] hover:text-white transform hover:scale-[1.01] transition-all duration-300 font-semibold shadow-md rounded-2xl flex items-center justify-center text-center";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-[#fffaf5]">
      <div className={`w-full ${navState.level === 'direct-bracket' || navState.level === 'group-phase' ? 'max-w-[95%]' : 'max-w-6xl'} mx-auto z-10`}>
        
        <div className="text-center mb-8">
            <div className="flex justify-center mb-5">
                <div className="relative group w-64 h-64">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/30 to-[#b35a38]/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Image src="/logo.png" alt="Logo" width={280} height={280} className="relative z-10 object-contain transition-transform duration-500 group-hover:scale-110 unoptimized" priority />
                </div>
            </div>
          <h1 className="text-5xl md:text-7xl font-black mb-2 text-[#b35a38] italic">La Cautiva</h1>
          <p className="text-xl text-slate-400 font-bold uppercase tracking-widest italic">Club de Tenis</p>
        </div>

        {navState.level !== "home" && <Button onClick={goBack} variant="ghost" className="mb-6 text-slate-500 font-bold">← VOLVER</Button>}

        {isLoading && (
          <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-[#b35a38] animate-spin" />
          </div>
        )}

        <div className="space-y-4 max-w-xl mx-auto">
          {navState.level === "home" && <Button onClick={() => setNavState({ level: "main-menu" })} className="w-full h-28 text-2xl bg-[#b35a38] text-white font-black rounded-3xl border-b-8 border-[#8c3d26]">INGRESAR</Button>}
          {navState.level === "main-menu" && <div className="grid grid-cols-1 gap-4 text-center"><Button onClick={() => setNavState({ level: "category-selection", type: "caballeros" })} className={buttonStyle}>CABALLEROS</Button><Button onClick={() => setNavState({ level: "category-selection", type: "damas" })} className={buttonStyle}>DAMAS</Button><Button onClick={() => setNavState({ level: "year-selection", type: "ranking" })} className={buttonStyle}><Trophy className="mr-2 opacity-50" /> RANKING</Button></div>}
          
          {navState.level === "year-selection" && (
            <div className="space-y-4 text-center">
              <Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2025" })} className={buttonStyle}>Ranking 2025</Button>
              <Button onClick={() => setNavState({ level: "category-selection", type: "ranking", year: "2026" })} className={buttonStyle}>Ranking 2026</Button>
            </div>
          )}

          {navState.level === "category-selection" && (
            <div className="space-y-4 text-center">
              <h2 className="text-xl font-bold text-slate-400 uppercase mb-4">{navState.type === 'ranking' ? `Ranking ${navState.year}` : 'Seleccionar Categoría'}</h2>
              {["Categoría A", "Categoría B1", "Categoría B2", "Categoría C"].map((cat) => (
                <Button key={cat} onClick={() => {
                  const catShort = cat.replace("Categoría ", "");
                  if (navState.type === "ranking") {
                    fetchRankingData(catShort, navState.year);
                    setNavState({ ...navState, level: "ranking-view", selectedCategory: cat, year: navState.year });
                  } else {
                    setNavState({ ...navState, level: "tournament-selection", category: catShort, selectedCategory: cat, gender: navState.type });
                  }
                }} className={buttonStyle}>{cat}</Button>
              ))}
            </div>
          )}

          {navState.level === "tournament-selection" && (
            <div className="space-y-4 text-center">
              {tournaments.filter(t => {
                if (t.id === "adelaide" && navState.gender === "damas") return false;
                if (t.id === "s8_500") return ["B1", "B2", "C"].includes(navState.category);
                if (t.id === "s8_250") return ["B1", "B2"].includes(navState.category);
                return true;
              }).map((t) => (
                <Button key={t.id} onClick={() => {
                  if (t.type === "direct") {
                    fetchBracketData(navState.category, t.short);
                    setNavState({ ...navState, level: "direct-bracket", tournament: t.name });
                  } else {
                    setNavState({ ...navState, level: "tournament-phases", tournament: t.name, tournamentShort: t.short });
                  }
                }} className={buttonStyle}>{t.name}</Button>
              ))}
            </div>
          )}

          {navState.level === "tournament-phases" && (
            <div className="space-y-4 text-center">
              <h2 className="text-2xl font-black mb-4 text-slate-800 uppercase text-center">{navState.tournament}</h2>
              <Button onClick={() => runATPDraw(navState.category, navState.tournamentShort)} className={buttonStyle}><RefreshCw className="mr-2" /> Realizar Sorteo ATP</Button>
              <Button onClick={() => { fetchBracketData(navState.category, navState.tournamentShort); setNavState({ ...navState, level: "direct-bracket", tournament: navState.tournament }); }} className={buttonStyle}><Grid3x3 className="mr-2" /> Cuadro de Eliminación</Button>
            </div>
          )}
        </div>

        {navState.level === "group-phase" && (
          <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2rem] p-6 md:p-10 shadow-2xl min-h-[600px]">
            <div className="flex justify-between items-center mb-8 text-center">
              <Button onClick={goBack} variant="outline" size="sm" className="border-[#b35a38] text-[#b35a38] font-bold"><ArrowLeft className="mr-2 w-4 h-4" /> ATRÁS</Button>
              {!isSorteoConfirmado && (
                <div className="flex space-x-2">
                  <Button onClick={() => runATPDraw(navState.category, navState.tournamentShort)} size="sm" className="bg-orange-500 text-white font-bold"><RefreshCw className="mr-2 w-4 h-4" /> REHACER</Button>
                  <Button onClick={() => { setGroupData([]); setNavState({...navState, level: "tournament-phases"}); }} size="sm" className="bg-red-500 text-white font-bold"><Trash2 className="mr-2 w-4 h-4" /> ELIMINAR</Button>
                  <Button onClick={() => setIsSorteoConfirmado(true)} size="sm" className="bg-green-600 text-white font-bold px-8"><CheckCircle className="mr-2 w-4 h-4" /> CONFIRMAR</Button>
                </div>
              )}
            </div>

            <div className="bg-[#b35a38] p-4 rounded-2xl mb-8 text-center text-white italic">
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider">Sorteo de Grupos: {navState.tournament}</h2>
              <p className="text-xs opacity-80 mt-1 font-bold uppercase">Categoría {navState.category} - {groupData.length} Zonas</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupData.map((group, idx) => (
                <div key={idx} className="bg-white border-2 border-[#b35a38]/20 rounded-2xl p-5 shadow-lg hover:border-[#b35a38]/40 transition-all text-center">
                  <h3 className="text-xl font-black mb-4 text-[#b35a38] italic underline decoration-orange-300">{group.groupName}</h3>
                  <div className="space-y-2">
                    {group.players.map((p: string, pIdx: number) => (
                      <div key={pIdx} className={`p-3 rounded-xl flex justify-between items-center ${pIdx === 0 ? 'bg-orange-50 border border-orange-200 shadow-md' : 'bg-slate-50 border border-slate-100'}`}>
                        <span className={`text-sm uppercase font-black ${pIdx === 0 ? 'text-[#b35a38]' : 'text-slate-600'}`}>{p}</span>
                        {pIdx === 0 && <Trophy className="w-4 h-4 text-orange-400" />}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {navState.level === "direct-bracket" && (
          <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-12 shadow-2xl overflow-x-auto min-h-[900px]">
            <div className="bg-[#b35a38] p-8 rounded-3xl mb-16 text-center text-white italic min-w-[800px]">
              <h2 className="text-4xl font-black uppercase tracking-wider">{navState.tournament} - {navState.selectedCategory}</h2>
            </div>
            <div className="flex flex-row items-center justify-between min-w-[1300px] py-10 relative text-center">
              {bracketData.isLarge && (
                <div className="flex flex-col justify-around h-[800px] w-80 relative text-left">
                  {[0, 2, 4, 6, 8, 10, 12, 14].map((idx) => {
                    const p1 = bracketData.r1[idx]; const p2 = bracketData.r1[idx+1];
                    const w1 = p1 && bracketData.r2.includes(p1);
                    const w2 = p2 && bracketData.r2.includes(p2);
                    return (
                      <div key={idx} className="relative flex flex-col space-y-8">
                        <div className={`h-8 border-b-2 ${w1 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end relative bg-white`}>
                          <span className={`${w1 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-xs uppercase truncate max-w-[200px]`}>{p1 || "TBD"}</span>
                          <span className="text-[#b35a38] font-black text-xs ml-2">{bracketData.s1[idx]}</span>
                          <div className="absolute -right-[60px] bottom-[-2px] w-[60px] h-[2px] bg-slate-300" />
                        </div>
                        <div className={`h-8 border-b-2 ${w2 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end relative bg-white`}>
                          <span className={`${w2 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-xs uppercase truncate max-w-[200px]`}>{p2 || "TBD"}</span>
                          <span className="text-[#b35a38] font-black text-xs ml-2">{bracketData.s1[idx+1]}</span>
                          <div className="absolute -right-[60px] bottom-[-2px] w-[60px] h-[2px] bg-slate-300" />
                        </div>
                        <div className="absolute top-[50%] translate-y-[-50%] -right-[100px] w-[40px] h-[2px] bg-slate-300" />
                      </div>
                    )
                  })}
                </div>
              )}
              <div className={`flex flex-col justify-around h-[800px] w-80 relative ${bracketData.isLarge ? 'ml-24' : ''} text-left`}>
                {[0, 2, 4, 6].map((idx) => {
                  const p1 = bracketData.isLarge ? bracketData.r2[idx] : bracketData.r1[idx];
                  const p2 = bracketData.isLarge ? bracketData.r2[idx+1] : bracketData.r1[idx+1];
                  const s1 = bracketData.isLarge ? bracketData.s2[idx] : bracketData.s1[idx];
                  const s2 = bracketData.isLarge ? bracketData.s2[idx+1] : bracketData.s1[idx+1];
                  const w1 = p1 && (bracketData.isLarge ? bracketData.r3.includes(p1) : bracketData.r2.includes(p1));
                  const w2 = p2 && (bracketData.isLarge ? bracketData.r3.includes(p2) : bracketData.r2.includes(p2));
                  return (
                    <div key={idx} className="relative flex flex-col space-y-24 mb-6">
                      <div className={`h-10 border-b-2 ${w1 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end bg-white relative`}>
                        <span className={`${w1 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-sm uppercase truncate`}>{p1 || "TBD"}</span>
                        <span className="text-[#b35a38] font-black text-sm ml-3">{s1}</span>
                        <div className="absolute -right-[80px] bottom-[-2px] w-[80px] h-[2px] bg-slate-300" />
                      </div>
                      <div className={`h-10 border-b-2 ${w2 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end relative bg-white`}>
                        <span className={`${w2 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-sm uppercase truncate`}>{p2 || "TBD"}</span>
                        <span className="text-[#b35a38] font-black text-sm ml-3">{s2}</span>
                        <div className="absolute -right-[80px] bottom-[-2px] w-[80px] h-[2px] bg-slate-300" />
                      </div>
                      <div className="absolute top-[50%] translate-y-[-50%] -right-[120px] w-[40px] h-[2px] bg-slate-300" />
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col justify-around h-[800px] w-80 ml-32 relative text-left">
                {[0, 2].map((idx) => {
                  const p1 = bracketData.isLarge ? bracketData.r3[idx] : bracketData.r2[idx];
                  const p2 = bracketData.isLarge ? bracketData.r3[idx+1] : bracketData.r2[idx+1];
                  const s1 = bracketData.isLarge ? bracketData.s3[idx] : bracketData.s2[idx];
                  const s2 = bracketData.isLarge ? bracketData.s3[idx+1] : bracketData.s2[idx+1];
                  const w1 = p1 && (bracketData.isLarge ? bracketData.r4.includes(p1) : bracketData.r3.includes(p1));
                  const w2 = p2 && (bracketData.isLarge ? bracketData.r4.includes(p2) : bracketData.r3.includes(p2));
                  return (
                    <div key={idx} className="relative flex flex-col space-y-48">
                      <div className={`h-12 border-b-2 ${w1 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end bg-white relative`}>
                        <span className={`${w1 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-base uppercase`}>{p1 || ""}</span>
                        <span className="text-[#b35a38] font-black text-base ml-4">{s1}</span>
                        <div className="absolute -right-[100px] bottom-[-2px] w-[100px] h-[2px] bg-slate-300" />
                      </div>
                      <div className={`h-12 border-b-2 ${w2 ? 'border-[#b35a38]' : 'border-slate-300'} flex justify-between items-end bg-white relative`}>
                        <span className={`${w2 ? 'text-[#b35a38] font-black' : 'text-slate-700 font-bold'} text-base uppercase`}>{p2 || ""}</span>
                        <span className="text-[#b35a38] font-black text-base ml-4">{s2}</span>
                        <div className="absolute -right-[100px] bottom-[-2px] w-[100px] h-[2px] bg-slate-300" />
                      </div>
                      <div className="absolute top-[50%] translate-y-[-50%] -right-[140px] w-[40px] h-[2px] bg-slate-300" />
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col justify-center h-[800px] items-center ml-32 w-96 relative text-center">
                <div className="w-full space-y-40 mb-20 text-center">
                  {[0, 1].map((idx) => {
                    const p = bracketData.isLarge ? bracketData.r4[idx] : bracketData.r3[idx];
                    const s = bracketData.isLarge ? bracketData.s4[idx] : bracketData.s3[idx];
                    const win = p && p === bracketData.winner;
                    return (
                      <div key={idx} className={`h-14 border-b-4 ${win ? 'border-[#b35a38]' : 'border-slate-200'} flex justify-between items-end bg-white text-center`}>
                        <span className={`${win ? 'text-[#b35a38] font-black' : 'text-slate-800 font-bold'} uppercase text-lg text-center`}>{p || ""}</span>
                        <span className="text-[#b35a38] font-black text-lg ml-4 text-center">{s}</span>
                      </div>
                    );
                  })}
                </div>
                <Trophy className="w-32 h-32 text-orange-400 mb-4 mx-auto" />
                <span className="text-[#b35a38] font-black text-5xl italic uppercase text-center w-full block text-center">{bracketData.winner || "Campeón"}</span>
              </div>
            </div>
          </div>
        )}

        {navState.level === "ranking-view" && (
          <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden text-center">
            <div className="bg-[#b35a38] p-6 rounded-2xl mb-8 text-white italic text-center">
              <h2 className="text-3xl md:text-5xl font-black uppercase text-center">{navState.selectedCategory} {navState.year}</h2>
            </div>
            {/* Solo mostramos la tabla si hay headers y datos cargados */}
            {headers.length > 0 && rankingData.length > 0 ? (
              <div className="overflow-x-auto text-center">
                <table className="w-full text-lg font-bold">
                  <thead>
                    <tr className="bg-[#b35a38] text-white">
                      <th className="p-4 text-center font-black first:rounded-tl-xl">POS</th>
                      <th className="p-4 text-center font-black">JUGADOR</th>
                      {headers.map((h, i) => (<th key={i} className="p-4 text-center font-black hidden sm:table-cell">{h}</th>))}
                      <th className="p-4 text-center font-black bg-[#8c3d26] last:rounded-tr-xl">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingData.map((p, i) => (
                      <tr key={i} className="border-b border-[#fffaf5] hover:bg-[#fffaf5] text-center">
                        <td className="p-4 text-slate-400">{i + 1}</td>
                        <td className="p-4 uppercase text-slate-700">{p.name}</td>
                        {p.points.map((val: any, idx: number) => (<td key={idx} className="p-4 text-center text-slate-400 hidden sm:table-cell">{val || 0}</td>))}
                        <td className="p-4 text-[#b35a38] text-2xl font-black bg-[#fffaf5]">{p.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-300 uppercase font-black tracking-widest animate-pulse text-center">
                Cargando datos...
              </div>
            )}
          </div>
        )}
      </div>
      <p className="text-center text-slate-500/80 mt-12 text-sm font-bold uppercase tracking-widest animate-pulse text-center">Sistema de seguimiento de torneos en vivo</p>
    </div>
  );
}