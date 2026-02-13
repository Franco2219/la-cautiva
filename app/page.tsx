"use client";

import { useState } from "react"; 
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Grid3x3, RefreshCw, ArrowLeft, Trash2, Loader2, Send, List, Shuffle, FileText, X, MapPin, Phone, MessageSquare, CheckCircle, AlertCircle, BarChart2, TrendingUp, History, Construction } from "lucide-react";
import { tournaments, PRINT_STYLES } from "@/lib/constants"; 
import { useTournamentData } from "@/hooks/useTournamentData"; 
import { getTournamentName, getTournamentStyle } from "@/lib/utils";
import { sendGAEvent } from '@next/third-parties/google';

import { GroupTable } from "@/components/tournament/GroupTable";
import { BracketView } from "@/components/tournament/BracketView";
import { RankingTable } from "@/components/tournament/RankingTable";
import { CalculatedRankingModal } from "@/components/tournament/CalculatedRankingModal";
import { TournamentHistoryView } from "@/components/stats/TournamentHistoryView";
import { PlayerStatsView } from "@/components/stats/PlayerStatsView";

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
    inscriptosList,
    showInscriptosModal,
    setShowInscriptosModal,
    fetchInscriptos,
    contactStatus,
    sendContactForm
  } = useTournamentData();

  // Estado para historial de torneos
  const [historyTourSelected, setHistoryTourSelected] = useState<string | null>(null);
  // NUEVO ESTADO: Para historial de jugadores
  const [selectedPlayerForStats, setSelectedPlayerForStats] = useState<string | null>(null);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50; 

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    if (e.targetTouches[0].clientX < window.innerWidth * 0.20) {
        setTouchStart(e.targetTouches[0].clientX);
    } else {
        setTouchStart(null);
    }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart !== null) {
        setTouchEnd(e.targetTouches[0].clientX);
    }
  }

  // --- LOGICA DEL BOTON VOLVER MODIFICADA ---
  const handleBackAction = () => {
    // Si estamos en stats de torneos y hay uno seleccionado, volvemos a la lista
    if (navState.level === "stats-tournaments" && historyTourSelected) {
        setHistoryTourSelected(null); 
    } 
    // NUEVO: Si estamos en stats de jugador y hay uno seleccionado, volvemos a la lista
    else if (navState.level === "stats-player" && selectedPlayerForStats) {
        setSelectedPlayerForStats(null);
    }
    // Si no, comportamiento normal (volver al menú anterior)
    else {
        goBack(); 
    }
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance < -minSwipeDistance; 
    
    if (isLeftSwipe && navState.level !== "home") {
        handleBackAction(); 
    }
  }

  const buttonStyle = "w-full text-lg h-20 border-2 border-[#b35a38]/20 bg-white text-[#b35a38] hover:bg-[#b35a38] hover:text-white transform hover:scale-[1.01] transition-all duration-300 font-semibold shadow-md rounded-2xl flex items-center justify-center text-center";
  
  const activeTour = navState.tournamentShort || navState.currentTour;
  const currentStyle = getTournamentStyle(activeTour);
  const FORMSPREE_ID = "xpqpqzdg";

  return (
    <div 
        className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-[#fffaf5]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
    >
      <style jsx global>{`
        ${PRINT_STYLES}
        @media print {
            @page {
                size: auto; 
                margin: 0.5cm; 
            }
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
            body {
                background-color: white !important;
                zoom: 0.7 !important; 
                -moz-transform: scale(0.7);
                -moz-transform-origin: top left;
                width: 100%;
            }
            .print\\:hidden {
                display: none !important;
            }
            .group-grid > div:nth-child(10n) {
                break-after: page;
                page-break-after: always;
            }
            .max-w-6xl, .max-w-\[95\%\] {
                max-width: none !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
            }
        }
      `}</style>

      <div className={`w-full ${['direct-bracket', 'group-phase', 'ranking-view', 'damas-empty', 'generate-bracket', 'contact', 'stats-player', 'stats-tournaments'].includes(navState.level) ? 'max-w-[95%]' : 'max-w-6xl'} mx-auto z-10 text-center`}>
        
        <div className="text-center mb-8 print:hidden">
            <div className="flex justify-center mb-5 text-center">
                <div className="relative group w-64 h-64">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/30 to-[#b35a38]/20 blur-2xl rounded-full opacity-100 transition-opacity duration-500" />
                <Image src="/logo.png" alt="Logo" width={280} height={280} className="relative z-10 object-contain transition-transform duration-500 group-hover:scale-110 unoptimized" priority />
                </div>
            </div>
          <h1 className="text-5xl md:text-7xl font-black mb-2 text-[#b35a38] italic">La Cautiva</h1>
          <p className="text-xl text-slate-400 font-bold uppercase tracking-widest italic text-center">Club de Tenis</p>
        </div>

        {/* --- BOTÓN VOLVER GLOBAL MODIFICADO --- */}
        {navState.level !== "home" && (
            <div className="flex justify-center mb-8 w-full print:hidden">
                <Button 
                    onClick={handleBackAction} 
                    className="bg-slate-800 hover:bg-slate-700 text-white font-black text-lg md:text-xl py-6 px-8 rounded-2xl shadow-xl border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-widest flex items-center gap-3 w-full md:w-auto justify-center h-auto whitespace-normal"
                >
                    <ArrowLeft className="w-6 h-6 shrink-0" />
                    {/* ETIQUETA DINÁMICA DEL BOTÓN */}
                    <span>
                        {navState.level === "tournament-selection" ? "VOLVER A CATEGORIAS" : 
                         (navState.level === "stats-tournaments" && historyTourSelected) ? "VOLVER A TORNEOS" : 
                         (navState.level === "stats-player" && selectedPlayerForStats) ? "VOLVER AL LISTADO" : // NUEVA ETIQUETA
                         "VOLVER"}
                    </span>
                </Button>
            </div>
        )}
        
        {isLoading && <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center print:hidden"><Loader2 className="w-12 h-12 text-[#b35a38] animate-spin" /></div>}

        <div className="space-y-4 max-w-xl mx-auto print:w-full print:max-w-none">
          {navState.level === "home" && (
            <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="bg-white/90 backdrop-blur-sm border-2 border-[#b35a38] text-[#b35a38] py-3 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-3 mx-4 transform hover:scale-105 transition-transform duration-300">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#b35a38]"></span>
                </span>
                <p className="font-black uppercase tracking-wide text-sm md:text-base">
                  Ya estan disponibles las Estadisticas! <span className="text-xl md:text-2xl">mira tu historial, conoce a tus rivales y mucho mas!</span>
                </p>
              </div>
            </div>
          )}
          
          {navState.level === "home" && <Button onClick={() => setNavState({ level: "main-menu" })} className="w-full h-28 text-2xl bg-[#b35a38] text-white font-black rounded-3xl border-b-8 border-[#8c3d26]">INGRESAR</Button>}
          
          {navState.level === "main-menu" && (
            <div className="grid grid-cols-1 gap-4 text-center">
              <Button onClick={() => setNavState({ level: "category-selection", type: "caballeros" })} className={buttonStyle}>CABALLEROS</Button>
              <Button onClick={() => {
                  sendGAEvent('event', 'button_click', { event_label: 'Menu: Damas' });
                  setNavState({ level: "category-selection", type: "damas" });
              }} className={buttonStyle}>DAMAS</Button>
              <Button onClick={() => {
                  sendGAEvent('event', 'button_click', { event_label: 'Menu Principal: Ranking' });
                  setNavState({ level: "year-selection", type: "ranking" })
                }} className={buttonStyle}>
                <Trophy className="mr-2 opacity-50" /> RANKING
              </Button>
              <Button onClick={() => {
                  sendGAEvent('event', 'button_click', { event_label: 'Menu Principal: Estadisticas' });
                  setNavState({ level: "statistics-menu" })
                }} className={buttonStyle}>
                <BarChart2 className="mr-2 opacity-50" /> ESTADÍSTICAS
              </Button>
            </div>
          )}

            {navState.level === "statistics-menu" && (
            <div className="grid grid-cols-1 gap-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Button onClick={() => {
                    sendGAEvent('event', 'button_click', { event_label: 'Estadisticas: Por Jugador' });
                    setNavState({ level: "stats-player" });
                }} className={buttonStyle}>
                    <TrendingUp className="mr-2 opacity-50" /> Estadísticas por Jugador
                </Button>
                
                <Button onClick={() => {
                    sendGAEvent('event', 'button_click', { event_label: 'Estadisticas: Por Torneo' });
                    setNavState({ level: "stats-tournaments" });
                }} className={buttonStyle}>
                    <History className="mr-2 opacity-50" /> Estadísticas de Torneos
                </Button>
            </div>
            )}

            {navState.level === "stats-player" && (
               <PlayerStatsView 
                 // PASAMOS EL ESTADO Y EL SETTER DESDE AQUÍ
                 selectedPlayer={selectedPlayerForStats}
                 onSelectPlayer={setSelectedPlayerForStats}
               />
            )}

            {navState.level === "stats-tournaments" && (
               <TournamentHistoryView 
                 selectedTour={historyTourSelected} 
                 onSelectTour={setHistoryTourSelected} 
               />
            )}

          {navState.level === "year-selection" && (
            <div className="space-y-4 text-center">
                <Button onClick={() => {
                    sendGAEvent('event', 'button_click', { event_label: 'Ver Ranking 2025' });
                    setNavState({ level: "category-selection", type: "ranking", year: "2025" });
                }} className={buttonStyle}>Ranking 2025</Button>
                
                <Button onClick={() => {
                    sendGAEvent('event', 'button_click', { event_label: 'Ver Ranking 2026' });
                    setNavState({ level: "category-selection", type: "ranking", year: "2026" });
                }} className={buttonStyle}>Ranking 2026</Button>
            </div>
          )}
          
          {navState.level === "category-selection" && (
            <div className="space-y-4 text-center">
              {["Categoría A", "Categoría B1", "Categoría B2", "Categoría C"].map((cat) => (
                <Button key={cat} onClick={() => {
                  const catShort = cat.replace("Categoría ", "");
                  if (navState.type === "ranking") {
                      sendGAEvent('event', 'button_click', { event_label: `Ranking ${navState.year} ${cat}` });
                  } else if (navState.type === "caballeros") {
                      sendGAEvent('event', 'button_click', { event_label: `Caballeros ${cat}` });
                  }
                  
                  if (navState.type === "damas") { 
                    setNavState({ ...navState, level: "tournament-selection", category: "Damas " + catShort, selectedCategory: cat, gender: navState.type }); 
                }
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
                if (t.id === "adelaide_250" && navState.gender === "damas") return false;
                if (t.id === "s8_500" && navState.gender === "damas") return false;
                if (t.id === "s8_250" && navState.gender === "damas") return false;
                if ((t.id === "s8_500" || t.id === "s8_250") && navState.category === "A") return false;
                if (t.id === "s8_250" && navState.category === "C") return false;
                return true;
              }).map((t) => (
                  <Button key={t.id} onClick={() => {
                      sendGAEvent('event', 'button_click', { event_label: `Torneo ${t.name} - Cat ${navState.category}` });
                      if (t.type === "direct") { fetchBracketData(navState.category, t.short); setNavState({ ...navState, level: "direct-bracket", tournament: t.name, tournamentShort: t.short }); }
                      else { fetchGroupPhase(navState.category, t.short); }
                    }} className={buttonStyle}> {t.name}
                  </Button>
                ))}
            </div>
          )}

          {navState.level === "tournament-phases" && (
            <div className="space-y-4 text-center text-center">
              <h2 className="text-lg font-black mb-4 text-slate-800 uppercase">Fases del Torneo</h2>
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
                  <Button onClick={() => {
                      sendGAEvent('event', 'button_click', { event_label: 'Ver Inscriptos' });
                      fetchInscriptos(navState.currentCat, navState.currentTour);
                  }} className={buttonStyle}>
                      <FileText className="mr-2" /> Inscriptos
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {navState.level === "contact" && (
          <div className="bg-white border-4 border-[#b35a38] rounded-[2rem] p-8 md:p-12 shadow-2xl max-w-5xl mx-auto text-left relative overflow-hidden">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8 flex flex-col justify-between">
                   <div>
                      <h2 className="text-3xl md:text-4xl font-black text-[#b35a38] uppercase mb-2">La Cautiva Tenis y Pádel</h2>
                      <div className="h-1 w-20 bg-[#b35a38] mb-6"></div>
                      <div className="space-y-4 text-slate-600 font-medium text-lg">
                         <div className="flex items-start gap-3">
                            <MapPin className="w-6 h-6 text-[#b35a38] shrink-0 mt-1" />
                            <p>La Cautiva 7651, B1682AWM<br/>Villa Bosch, Provincia de Buenos Aires</p>
                         </div>
                         <div className="flex items-center gap-3">
                            <Phone className="w-6 h-6 text-[#b35a38] shrink-0" />
                            <p className="font-bold">11 2396-5949</p>
                         </div>
                      </div>
                   </div>
                   <div className="w-full h-48 bg-slate-100 rounded-2xl border-2 border-slate-200 overflow-hidden shadow-inner relative group">
                      <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen src="https://maps.google.com/maps?q=La+Cautiva+7651%2C+Villa+Bosch&t=&z=15&ie=UTF8&iwloc=&output=embed" className="absolute inset-0 w-full h-full"></iframe>
                   </div>
                   <p className="text-xl font-bold text-slate-800 italic">¡Agendá tu próximo partido y sumate!</p>
                </div>

                <div className="bg-[#fffaf5] p-8 rounded-3xl border border-[#b35a38]/20">
                   <h3 className="text-xl font-black text-[#b35a38] mb-4 flex items-center gap-2">
                      <MessageSquare className="w-6 h-6" />
                      ¿Tenés alguna duda o recomendación?
                   </h3>
                   <p className="text-slate-500 mb-6 text-sm font-bold">¡Escribinos! Reporta errores o danos tu feedback.</p>
                   
                   <form className="space-y-4" onSubmit={(e: any) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      sendContactForm(formData, FORMSPREE_ID);
                   }}>
                      <div>
                         <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre</label>
                         <input name="name" required disabled={contactStatus === 'sending'} className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:border-[#b35a38] focus:outline-none transition-colors font-bold text-slate-700" placeholder="Tu nombre..." />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
                         <input name="email" type="email" required disabled={contactStatus === 'sending'} className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:border-[#b35a38] focus:outline-none transition-colors font-bold text-slate-700" placeholder="tucorreo@ejemplo.com" />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mensaje</label>
                         <textarea name="message" required disabled={contactStatus === 'sending'} className="w-full h-32 p-4 rounded-xl border-2 border-slate-200 focus:border-[#b35a38] focus:outline-none transition-colors font-bold text-slate-700 resize-none" placeholder="Escribí tu mensaje aquí..."></textarea>
                      </div>
                      
                      {contactStatus === 'idle' && (
                        <Button type="submit" className="w-full h-14 bg-[#b35a38] hover:bg-[#8c3d26] text-white font-black text-lg rounded-xl shadow-lg transform active:scale-95 transition-all">
                           <Send className="mr-2 w-5 h-5" /> ENVIAR MENSAJE
                        </Button>
                      )}
                      {contactStatus === 'sending' && (
                        <Button disabled className="w-full h-14 bg-slate-300 text-slate-500 font-black text-lg rounded-xl shadow-none cursor-not-allowed">
                           <Loader2 className="mr-2 w-5 h-5 animate-spin" /> ENVIANDO...
                        </Button>
                      )}
                      {contactStatus === 'success' && (
                        <div className="w-full h-14 bg-green-500 text-white font-black text-lg rounded-xl shadow-lg flex items-center justify-center animate-in fade-in zoom-in">
                           <CheckCircle className="mr-2 w-6 h-6" /> ¡ENVIADO!
                        </div>
                      )}
                      {contactStatus === 'error' && (
                        <div className="w-full h-14 bg-red-500 text-white font-black text-lg rounded-xl shadow-lg flex items-center justify-center animate-in fade-in zoom-in">
                           <AlertCircle className="mr-2 w-6 h-6" /> ERROR - INTENTAR DE NUEVO
                        </div>
                      )}
                   </form>
                </div>
             </div>
          </div>
        )}

        {showInscriptosModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
              <div className="bg-[#b35a38] p-6 text-white flex justify-between items-center">
                <div>
                   <h3 className="text-xl font-black uppercase tracking-wider">Inscriptos</h3>
                   <p className="text-sm opacity-80 font-bold">{navState.currentTour} - Cat {navState.currentCat}</p>
                </div>
                <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full h-10 w-10 p-0" onClick={() => setShowInscriptosModal(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <div className="p-6 overflow-y-auto">
                 {inscriptosList.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {inscriptosList.map((player, index) => (
                        <div key={index} className="py-3 flex items-center">
                          <span className="w-8 h-8 flex items-center justify-center bg-[#b35a38]/10 text-[#b35a38] font-black rounded-full text-sm mr-3">
                            {index + 1}
                          </span>
                          <span className="text-lg font-medium text-slate-700">{player}</span>
                        </div>
                      ))}
                    </div>
                 ) : (
                    <p className="text-center text-slate-500 py-8">No se encontraron jugadores.</p>
                 )}
              </div>
              <div className="p-4 border-t bg-slate-50">
                <Button onClick={() => setShowInscriptosModal(false)} className="w-full bg-slate-800 text-white font-bold h-12 rounded-xl">Cerrar</Button>
              </div>
            </div>
          </div>
        )}

        {navState.level === "generate-bracket" && (
          <div className="flex flex-col items-center">
             {(() => {
                const previewR1: string[] = [];
                const previewS1: string[] = [];
                const previewSeeds: any = {};

                generatedBracket.forEach((match) => {
                    const p1Name = match.p1 ? match.p1.name : "BYE";
                    const p2Name = match.p2 ? match.p2.name : "BYE";
                    previewR1.push(p1Name); previewR1.push(p2Name);
                    previewS1.push(""); previewS1.push("");

                    if (match.p1 && match.p1.rank) {
                        const label = match.p1.groupIndex !== undefined ? `${match.p1.rank} ZN ${match.p1.groupIndex + 1}` : `${match.p1.rank}`;
                        previewSeeds[p1Name] = label;
                    }
                    if (match.p2 && match.p2.rank) {
                        const label = match.p2.groupIndex !== undefined ? `${match.p2.rank} ZN ${match.p2.groupIndex + 1}` : `${match.p2.rank}`;
                        previewSeeds[p2Name] = label;
                    }
                });

                const previewData = { bracketSize: navState.bracketSize, r1: previewR1, s1: previewS1, r2: [], s2: [], r3: [], s3: [], r4: [], s4: [], r5: [], s5: [], winner: "", runnerUp: "", hasData: true, seeds: previewSeeds, canGenerate: false };

                return (
                    <div className="w-full">
                        <BracketView bracketData={previewData} navState={navState} runDirectDraw={runDirectDraw} fetchQualifiersAndDraw={fetchQualifiersAndDraw} />
                        {!isSorteoConfirmado && (
                            <div className="bg-white/90 backdrop-blur-sm border-t-2 border-[#b35a38]/20 p-4 rounded-3xl mt-4 shadow-2xl flex flex-col md:flex-row gap-4 justify-center sticky bottom-4 z-50 print:hidden">
                                <Button onClick={enviarListaBasti} className="bg-blue-500 text-white font-bold h-12 px-8 shadow-lg"><List className="mr-2 w-4 h-4" /> LISTA BASTI</Button>
                                {tournaments.find(t => t.short === navState.tournamentShort)?.type === 'direct' ? (
                                <Button onClick={() => runDirectDraw(navState.category, navState.tournamentShort)} className="bg-orange-500 text-white font-bold h-12 px-8 shadow-lg"><Shuffle className="mr-2 w-4 h-4" /> Sortear</Button>
                                ) : (
                                <Button onClick={() => fetchQualifiersAndDraw(navState.category, navState.tournamentShort)} className="bg-orange-500 text-white font-bold h-12 px-8 shadow-lg"><Shuffle className="mr-2 w-4 h-4" /> Sortear</Button>
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
          <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl min-h-[600px] text-center print:border-0 print:shadow-none print:p-0">
            <div className="flex justify-between items-center mb-8 print:hidden">
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
            <div className={`${currentStyle.color} p-4 rounded-2xl mb-8 text-center text-white italic relative flex items-center justify-between overflow-hidden print:mb-4`}>
               <div className="w-20 h-20 flex items-center justify-center relative">{currentStyle.logo && <Image src={currentStyle.logo} alt="Tour Logo" width={80} height={80} className="object-contain" />}</div>
               <div className="flex-1"><h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider">{getTournamentName(activeTour)} - Fase de Grupos</h2><p className="text-xs opacity-80 mt-1 font-bold uppercase">{navState.currentCat}</p></div>
               <div className="w-20 h-20 flex items-center justify-center relative">{currentStyle.pointsLogo && <Image src={currentStyle.pointsLogo} alt="Points" width={80} height={80} className="object-contain opacity-80" />}</div>
            </div>
            {/* AÑADIDO: Clase group-grid para controlar los saltos de página */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start group-grid">
              {groupData.map((group, idx) => <GroupTable key={idx} group={group} tournamentShort={activeTour} />)}
            </div>
          </div>
        )}

        {navState.level === "direct-bracket" && (
           <BracketView bracketData={bracketData} navState={navState} runDirectDraw={runDirectDraw} fetchQualifiersAndDraw={fetchQualifiersAndDraw} />
        )}

        {navState.level === "ranking-view" && (
           <RankingTable headers={headers} data={rankingData} category={navState.selectedCategory} year={navState.year} />
        )}

        {showRankingCalc && (
          <CalculatedRankingModal ranking={calculatedRanking} onClose={() => setShowRankingCalc(false)} tournamentShort={activeTour} category={navState.category} />
        )}

      </div>
      
      {/* Footer con el botón de Contacto - OCULTO EN IMPRESIÓN */}
      <div className="mt-12 flex justify-center items-center gap-3 text-center select-none text-slate-500/80 text-sm font-bold uppercase tracking-widest animate-pulse print:hidden">
         <p onClick={handleFooterClick} className="cursor-pointer hover:text-[#b35a38] transition-colors">Sistema de seguimiento de torneos</p>
         <span className="text-slate-300">|</span>
         <p onClick={() => {
             // AVISO A GOOGLE: CONTACTO
             sendGAEvent('event', 'button_click', { event_label: 'Footer: Contacto' });
             setNavState({ level: "contact" });
         }} className="cursor-pointer hover:text-[#b35a38] transition-colors">Contacto</p>
      </div>
    </div>
  );
}