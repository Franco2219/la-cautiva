"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Grid3x3, RefreshCw, ArrowLeft, Trash2, Loader2, Send, AlertCircle, Shuffle, X, Copy, List } from "lucide-react"

// --- 1. IMPORTS DE UTILIDADES Y CONSTANTES (Lo que ya creamos/crearemos) ---
import { 
  ID_2025, 
  ID_DATOS_GENERALES, 
  ID_TORNEOS, 
  MI_TELEFONO, 
  TELEFONO_BASTI, 
  tournaments 
} from "@/lib/constants"

import { 
  parseCSV, 
  getTournamentName, 
  getTournamentStyle 
} from "@/lib/utils"

// --- 2. IMPORTS DE COMPONENTES VISUALES (Los que te pasaré luego) ---
import { GroupTable } from "@/components/tournament/GroupTable"
import { GeneratedMatch } from "@/components/tournament/GeneratedMatch"
import { BracketView } from "@/components/tournament/BracketView"
import { RankingTable } from "@/components/tournament/RankingTable"
import { CalculatedRankingModal } from "@/components/tournament/CalculatedRankingModal"

export default function Home() {
  // --- ESTADOS (Se mantienen aquí para controlar la app) ---
  const [navState, setNavState] = useState<any>({ level: "home" })
  const [rankingData, setRankingData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [bracketData, setBracketData] = useState<any>({ 
    r1: [], s1: [], r2: [], s2: [], r3: [], s3: [], r4: [], s4: [], r5: [], s5: [], 
    winner: "", runnerUp: "", bracketSize: 16, hasData: false, canGenerate: false, seeds: {} 
  });
  const [groupData, setGroupData] = useState<any[]>([])
  const [isSorteoConfirmado, setIsSorteoConfirmado] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [generatedBracket, setGeneratedBracket] = useState<any[]>([])
  const [isFixedData, setIsFixedData] = useState(false)
  
  const [footerClicks, setFooterClicks] = useState(0);
  const [showRankingCalc, setShowRankingCalc] = useState(false);
  const [calculatedRanking, setCalculatedRanking] = useState<any[]>([]);

  const buttonStyle = "w-full text-lg h-20 border-2 border-[#b35a38]/20 bg-white text-[#b35a38] hover:bg-[#b35a38] hover:text-white transform hover:scale-[1.01] transition-all duration-300 font-semibold shadow-md rounded-2xl flex items-center justify-center text-center";

  // --- LÓGICA DE NEGOCIO (Fetches y cálculos) ---
  // (Esta parte se queda aquí porque "controla" los datos de la página)

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
        for(let i=0; i<headerRow.length; i++) {
            if (headerRow[i] && headerRow[i].trim().toLowerCase() === currentTourShort) { colIndex = i; break; }
        }
        if (colIndex === -1) {
            for(let i=0; i<headerRow.length; i++) {
                if (headerRow[i] && headerRow[i].trim().toLowerCase().includes(currentTourShort)) { colIndex = i; break; }
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

        // ... (Lógica de sorteo directo abreviada para no repetir 200 lineas, se mantiene igual)
        // [Aquí iría toda la lógica de runDirectDraw que ya tienes]
        // Para simplificar la respuesta te pido que MANTENGAS el contenido de esta función 
        // tal cual estaba en tu archivo original.
        
        // ... LÓGICA DE SORTEO ...
        // Simulando finalización para el ejemplo:
        setNavState({ ...navState, level: "generate-bracket", category: categoryShort, tournamentShort: tournamentShort, bracketSize: 16 }); // Ajustar bracketSize según lógica
        
    } catch (e) { alert("Error al generar sorteo directo."); } finally { setIsLoading(false); }
  }

  // NOTA: Debes mantener el contenido completo de runATPDraw, fetchGroupPhase, generatePlayoffBracket, 
  // fetchQualifiersAndDraw, fetchBracketData, fetchRankingData.
  // No los he borrado, solo los omito aquí para que veas la estructura del archivo.
  // Cuando copies este archivo, ASEGÚRATE de copiar las funciones fetch... completas del original.
  
  const runATPDraw = async (categoryShort: string, tournamentShort: string) => {
      // ... Copiar lógica original ...
      setIsLoading(true);
      // ...
      setIsLoading(false);
  }

  const fetchGroupPhase = async (categoryShort: string, tournamentShort: string) => {
      // ... Copiar lógica original ...
      setIsLoading(true);
      // ...
      setIsLoading(false);
  }

  const confirmarYEnviar = () => {
    let mensaje = `*SORTEO CONFIRMADO - ${getTournamentName(navState.currentTour)}*\n*Categoría:* ${navState.currentCat}\n\n`;
    groupData.forEach(g => { mensaje += `*${g.groupName}*\n${g.players.join('\n')}\n`; });
    window.open(`https://wa.me/${MI_TELEFONO}?text=${encodeURIComponent(mensaje)}`, '_blank');
    setIsSorteoConfirmado(true);
  };

  const fetchQualifiersAndDraw = async (category: string, tournamentShort: string) => {
      // ... Copiar lógica original ...
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
  }

  const fetchRankingData = async (categoryShort: string, year: string) => {
    // ... Copiar lógica original ...
  }

  const fetchBracketData = async (category: string, tournamentShort: string) => {
    // ... Copiar lógica original ...
  }

  const goBack = () => {
    setIsSorteoConfirmado(false);
    const levels: any = { "main-menu": "home", "year-selection": "main-menu", "category-selection": "main-menu", "tournament-selection": "category-selection", "tournament-phases": "tournament-selection", "group-phase": "tournament-phases", "bracket-phase": "tournament-phases", "ranking-view": "category-selection", "direct-bracket": "tournament-selection", "damas-empty": "category-selection", "generate-bracket": "direct-bracket" };
    setNavState({ ...navState, level: levels[navState.level] || "home" });
  }

  // --- RENDER ---
  const tourStyle = getTournamentStyle(navState.tournamentShort || navState.currentTour);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-[#fffaf5]">
      <div className={`w-full ${['direct-bracket', 'group-phase', 'ranking-view', 'damas-empty', 'generate-bracket'].includes(navState.level) ? 'max-w-[95%]' : 'max-w-6xl'} mx-auto z-10 text-center`}>
        
        {/* HEADER LOGO */}
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

        {/* --- VIEW: GENERATE BRACKET --- */}
        {navState.level === "generate-bracket" && (
          <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl text-center">
             <div className={`${tourStyle.color} p-4 rounded-2xl mb-8 text-center text-white italic min-w-[300px] mx-auto sticky left-0`}>
               <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider">
                   {navState.bracketSize === 64 ? "Sorteo 32avos" :
                    navState.bracketSize === 32 ? "Sorteo 16avos" : 
                    navState.bracketSize === 16 ? "Sorteo Octavos" : 
                    navState.bracketSize === 8 ? "Sorteo Cuartos" : "Sorteo Semis"}
               </h2>
               <p className="text-sm font-bold uppercase mt-1 opacity-90">
                   {getTournamentName(navState.tournamentShort)} - {navState.category}
               </p>
             </div>
             
             {/* Componente extraído de Partido Individual */}
             <div className="flex flex-col items-center gap-2 mb-8">
                {generatedBracket.map((match, i) => (
                    <>
                        <GeneratedMatch key={i} match={match} />
                        {i === (generatedBracket.length / 2) - 1 && (
                            <div className="w-full max-w-md my-8 flex items-center gap-4 opacity-50">
                                <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent flex-1" />
                                <span className="text-xs text-slate-400 font-black uppercase tracking-[0.2em]">Mitad de Cuadro</span>
                                <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent flex-1" />
                            </div>
                        )}
                    </>
                ))}
             </div>

             <div className="flex flex-col md:flex-row gap-4 justify-center mt-8 sticky bottom-4 z-20">
                <Button onClick={enviarListaBasti} className="bg-blue-500 text-white font-bold h-12 px-8 shadow-lg">
                    <List className="mr-2 w-4 h-4" /> LISTA BASTI
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

        {/* --- VIEW: GROUP PHASE --- */}
        {navState.level === "group-phase" && (
          <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl min-h-[600px] text-center">
            <div className="flex justify-between items-center mb-8">
              <Button onClick={goBack} variant="outline" size="sm" className="border-[#b35a38] text-[#b35a38] font-bold"><ArrowLeft className="mr-2" /> ATRÁS</Button>
              {!isSorteoConfirmado && !isFixedData && (
                <div className="flex space-x-2 text-center text-center">
                  <Button onClick={() => runATPDraw(navState.currentCat, navState.currentTour)} className="bg-green-600 text-white font-bold h-12"><Shuffle className="mr-2" /> SORTEAR</Button>
                  <Button onClick={enviarListaBasti} className="bg-blue-500 text-white font-bold h-12"><List className="mr-2" /> LISTA BASTI</Button>
                  <Button onClick={confirmarYEnviar} className="bg-green-600 text-white font-bold h-12 px-8"><Send className="mr-2" /> CONFIRMAR Y ENVIAR</Button>
                  <Button onClick={() => { setGroupData([]); setNavState({...navState, level: "tournament-phases"}); }} variant="destructive" className="font-bold h-12"><Trash2 className="mr-2" /> ELIMINAR</Button>
                </div>
              )}
            </div>
            
            <div className={`${tourStyle.color} p-4 rounded-2xl mb-8 text-center text-white italic relative flex items-center justify-between overflow-hidden`}>
               <div className="w-20 h-20 flex items-center justify-center relative">
                   {tourStyle.logo && <Image src={tourStyle.logo} alt="Tour Logo" width={80} height={80} className="object-contain" />}
               </div>
               <div className="flex-1">
                 <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider">{getTournamentName(navState.currentTour)} - Fase de Grupos</h2>
                 <p className="text-xs opacity-80 mt-1 font-bold uppercase">{navState.currentCat}</p>
               </div>
               <div className="w-20 h-20 flex items-center justify-center relative">
                   {tourStyle.pointsLogo && <Image src={tourStyle.pointsLogo} alt="Points" width={80} height={80} className="object-contain opacity-80" />}
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* COMPONENTE DE TABLA DE GRUPO EXTRAÍDO */}
              {groupData.map((group, idx) => (
                <GroupTable key={idx} group={group} tournamentShort={navState.currentTour} />
              ))}
            </div>
          </div>
        )}

        {/* --- VIEW: BRACKET --- */}
        {navState.level === "direct-bracket" && (
          <BracketView 
            bracketData={bracketData} 
            navState={navState} 
            runDirectDraw={runDirectDraw} 
            fetchQualifiersAndDraw={fetchQualifiersAndDraw}
          />
        )}

        {/* --- MODAL: RANKING CALCULATOR --- */}
        {showRankingCalc && (
            <CalculatedRankingModal 
                ranking={calculatedRanking} 
                onClose={() => setShowRankingCalc(false)} 
                tournamentShort={navState.tournamentShort}
                category={navState.category}
            />
        )}

        {/* --- VIEW: RANKING ANUAL --- */}
        {navState.level === "ranking-view" && (
           <RankingTable 
              headers={headers} 
              data={rankingData} 
              category={navState.selectedCategory} 
              year={navState.year} 
           />
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