"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button"; // Botones normales (grises/blancos)
import { Trophy, Users, Grid3x3, RefreshCw, ArrowLeft, Trash2, Loader2, Send, List, Shuffle } from "lucide-react";
import { tournaments } from "@/lib/constants"; 
import { useTournamentData } from "@/hooks/useTournamentData"; 
import { getTournamentName, getTournamentStyle } from "@/lib/utils";
import { useState } from "react";

// Componentes extraídos
import { GroupTable } from "@/components/tournament/GroupTable";
import { GeneratedMatch } from "@/components/tournament/GeneratedMatch";
import { BracketView } from "@/components/tournament/BracketView";
import { RankingTable } from "@/components/tournament/RankingTable";
import { CalculatedRankingModal } from "@/components/tournament/CalculatedRankingModal";

// --- BOTÓN DINÁMICO INTEGRADO ---
// Este componente vive aquí para asegurar que tenga acceso a la lógica de colores sin dependencias externas.
const DynamicButton = ({ onClick, className, icon: Icon, children, colorClass }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  // Diccionario local para traducir las clases de constants.ts a HEX real
  const colorMap: Record<string, string> = {
    "bg-blue-900": "#1e3a8a", // Adelaide, US Open, etc.
    "bg-blue-950": "#172554", // Masters
    "bg-[#00703C]": "#00703C", // Wimbledon
    "bg-[#b35a38]": "#b35a38", // RG / Polvo
    "bg-[#e10600]": "#e10600", // S8 500
    "bg-[#0091d2]": "#0091d2", // AO / S8 250
    "bg-[#003369]": "#003369", // US Open alt
    "bg-[#002865]": "#002865", // Masters alt
    "bg-[#00572e]": "#00572e"  // Indian Wells
  };

  // Determinamos el color hexadecimal exacto
  let hexColor = "#ea580c"; // Fallback naranja por defecto

  if (colorClass) {
    if (colorMap[colorClass]) {
      // Caso 1: Es una clase conocida (ej: bg-blue-900)
      hexColor = colorMap[colorClass];
    } else {
      // Caso 2: Es una clase arbitraria con brackets (ej: bg-[#123456])
      const match = colorClass.match(/\[(#[0-9a-fA-F]+)\]/);
      if (match) {
        hexColor = match[1];
      }
    }
  }

  return (
    <button 
      onClick={onClick} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      // Usamos style inline para tener prioridad máxima sobre Tailwind
      style={{
        backgroundColor: isHovered ? "white" : hexColor,
        color: isHovered ? hexColor : "white",
        border: `2px solid ${hexColor}`,
        transition: "all 0.3s ease",
      }}
      // Clases base para forma y tipografía
      className={`${className} flex items-center justify-center rounded-xl font-bold h-12 shadow-lg text-sm focus-visible:outline-none disabled:opacity-50 select-none uppercase tracking-wide`}
    >
      {Icon && <Icon className="mr-2 w-4 h-4" />}
      {children}
    </button>
  );
};

export default function Home() {
  const {
    navState, setNavState,
    rankingData, headers,
    bracketData, groupData,
    isSorteoConfirmado, isLoading,
    generatedBracket, isFixedData,
    footerClicks, showRankingCalc, setShowRankingCalc,
    calculatedRanking,
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
    calculateAndShowRanking
  } = useTournamentData();

  const buttonStyle = "w-full text-lg h-20 border-2 border-[#b35a38]/20 bg-white text-[#b35a38] hover:bg-[#b35a38] hover:text-white transform hover:scale-[1.01] transition-all duration-300 font-semibold shadow-md rounded-2xl flex items-center justify-center text-center";
  
  const activeTour = navState.tournamentShort || navState.currentTour;
  const currentStyle = getTournamentStyle(activeTour);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-[#fffaf5]">
      <div className={`w-full ${['direct-bracket', 'group-phase', 'ranking-view', 'damas-empty', 'generate-bracket'].includes(navState.level) ? 'max-w-[95%]' : 'max-w-6xl'} mx-auto z-10 text-center`}>
        
        {/* LOGO PRINCIPAL */}
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
                    }} className={buttonStyle}> {t.name}
                  </Button>
                ))}
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

        {/* VISTAS ESPECÍFICAS */}
        
        {navState.level === "generate-bracket" && (
          <div className="flex flex-col items-center">
             {(() => {
                const previewR1: any[] = []; // IMPORTANTE: Array de objetos
                const previewS1: string[] = [];
                const previewSeeds: any = {};

                generatedBracket.forEach((match) => {
                    const p1Obj = match.p1 ? match.p1 : { name: "BYE", rank: 0 };
                    const p2Obj = match.p2 ? match.p2 : { name: "BYE", rank: 0 };
                    
                    previewR1.push(p1Obj); // Guardamos objeto completo para tener el rank
                    previewR1.push(p2Obj);
                    previewS1.push("");
                    previewS1.push("");

                    if (match.p1 && match.p1.rank) {
                        const label = match.p1.groupIndex !== undefined ? `${match.p1.rank} ZN ${match.p1.groupIndex + 1}` : `${match.p1.rank}`;
                        previewSeeds[match.p1.name] = label;
                    }
                    if (match.p2 && match.p2.rank) {
                        const label = match.p2.groupIndex !== undefined ? `${match.p2.rank} ZN ${match.p2.groupIndex + 1}` : `${match.p2.rank}`;
                        previewSeeds[match.p2.name] = label;
                    }
                });

                const previewData = {
                    bracketSize: navState.bracketSize,
                    r1: previewR1, 
                    s1: previewS1,
                    r2: [], s2: [], r3: [], s3: [], r4: [], s4: [], r5: [], s5: [],
                    winner: "", 
                    runnerUp: "",
                    hasData: true,
                    seeds: previewSeeds,
                    canGenerate: false
                };

                return (
                    <div className="w-full">
                        <BracketView 
                            bracketData={previewData}
                            navState={navState}
                            runDirectDraw={runDirectDraw}
                            fetchQualifiersAndDraw={fetchQualifiersAndDraw}
                        />

                        {!isSorteoConfirmado && (
                            <div className="bg-white/90 backdrop-blur-sm border-t-2 border-[#b35a38]/20 p-4 rounded-3xl mt-4 shadow-2xl flex flex-col md:flex-row gap-4 justify-center sticky bottom-4 z-50">
                                <Button onClick={enviarListaBasti} className="bg-blue-500 text-white font-bold h-12 px-8 shadow-lg"><List className="mr-2 w-4 h-4" /> LISTA BASTI</Button>
                                
                                {/* USO DEL BOTÓN DINÁMICO */}
                                {tournaments.find(t => t.short === navState.tournamentShort)?.type === 'direct' ? (
                                  <DynamicButton 
                                    onClick={() => runDirectDraw(navState.category, navState.tournamentShort)} 
                                    className="px-8"
                                    icon={Shuffle}
                                    colorClass={currentStyle.color}
                                  >
                                    Sortear
                                  </DynamicButton>
                                ) : (
                                  <DynamicButton 
                                    onClick={() => fetchQualifiersAndDraw(navState.category, navState.tournamentShort)} 
                                    className="px-8"
                                    icon={Shuffle}
                                    colorClass={currentStyle.color}
                                  >
                                    Sortear
                                  </DynamicButton>
                                )}

                                <Button onClick={confirmarSorteoCuadro} className="bg-green-600 text-white font-bold h-12 px-8"><Send className="mr-2" /> CONFIRMAR Y ENVIAR</Button>
                                <Button onClick={() => setNavState({ ...navState, level: "direct-bracket" })} className="bg-red-600 text-white font-bold h-12 px-8"><Trash2 className="mr-2" /> ELIMINAR</Button>
                            </div>
                        )}
                    </div>
                );
             })()}
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
                  <DynamicButton 
                    onClick={() => runATPDraw(navState.currentCat, navState.currentTour)} 
                    className="w-full"
                    icon={Shuffle}
                    colorClass={currentStyle.color}
                  >
                    SORTEAR
                  </DynamicButton>
                  <Button onClick={enviarListaBasti} className="bg-blue-500 text-white font-bold h-12"><List className="mr-2" /> LISTA BASTI</Button>
                  <Button onClick={confirmarYEnviar} className="bg-green-600 text-white font-bold h-12 px-8"><Send className="mr-2" /> CONFIRMAR Y ENVIAR</Button>
                  <Button onClick={() => { setGroupData([]); setNavState({...navState, level: "tournament-phases"}); }} variant="destructive" className="font-bold h-12"><Trash2 className="mr-2" /> ELIMINAR</Button>
                </div>
              )}
            </div>
            <div className={`${currentStyle.color} p-4 rounded-2xl mb-8 text-center text-white italic relative flex items-center justify-between overflow-hidden`}>
               <div className="w-20 h-20 flex items-center justify-center relative">{currentStyle.logo && <Image src={currentStyle.logo} alt="Tour Logo" width={80} height={80} className="object-contain" />}</div>
               <div className="flex-1"><h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider">{getTournamentName(activeTour)} - Fase de Grupos</h2><p className="text-xs opacity-80 mt-1 font-bold uppercase">{navState.currentCat}</p></div>
               <div className="w-20 h-20 flex items-center justify-center relative">{currentStyle.pointsLogo && <Image src={currentStyle.pointsLogo} alt="Points" width={80} height={80} className="object-contain opacity-80" />}</div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {groupData.map((group, idx) => <GroupTable key={idx} group={group} tournamentShort={activeTour} />)}
            </div>
          </div>
        )}

        {navState.level === "direct-bracket" && (
           <BracketView 
              bracketData={bracketData} 
              navState={navState} 
              runDirectDraw={runDirectDraw} 
              fetchQualifiersAndDraw={fetchQualifiersAndDraw} 
           />
        )}

        {navState.level === "ranking-view" && (
           <RankingTable 
             headers={headers} 
             data={rankingData} 
             category={navState.selectedCategory} 
             year={navState.year} 
           />
        )}

        {showRankingCalc && (
          <CalculatedRankingModal 
            ranking={calculatedRanking} 
            onClose={() => setShowRankingCalc(false)} 
            tournamentShort={activeTour} 
            category={navState.category} 
          />
        )}

      </div>
      <p onClick={handleFooterClick} className="text-center text-slate-500/80 mt-12 text-sm font-bold uppercase tracking-widest animate-pulse text-center cursor-pointer select-none active:scale-95 transition-transform">Sistema de seguimiento de torneos en vivo</p>
    </div>
  );
}