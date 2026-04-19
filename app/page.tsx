"use client";

import { useState } from "react"; 
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Grid3x3, RefreshCw, ArrowLeft, Trash2, Loader2, Send, List, Shuffle, FileText, X, MapPin, Phone, MessageSquare, CheckCircle, AlertCircle, BarChart2, TrendingUp, History, Construction } from "lucide-react";
import { tournaments, PRINT_STYLES } from "@/lib/constants"; 
import { useTournamentData } from "@/hooks/useTournamentData"; 
import { getTournamentName, getTournamentStyle, getEffectiveTourType } from "@/lib/utils";
import { sendGAEvent } from '@next/third-parties/google';

import { GroupTable } from "@/components/tournament/GroupTable";
import { BracketView } from "@/components/tournament/BracketView";
import { RankingTable } from "@/components/tournament/RankingTable";
import { CalculatedRankingModal } from "@/components/tournament/CalculatedRankingModal";
import { TournamentHistoryView } from "@/components/stats/TournamentHistoryView";
import { PlayerStatsView } from "@/components/stats/PlayerStatsView";

const PreclasificadosList = ({ seeds, gender, isDirect }: { seeds: Record<string, string> | undefined, gender: string, isDirect: boolean }) => {
    // Validamos que sea caballeros, que existan preclasificados y que sea torneo directo
    if (gender !== "caballeros" || !seeds || !isDirect) return null;

    const preclasificados = Object.entries(seeds)
        .filter(([name, seedLabel]) => {
            if (!name || name === "BYE") return false;
            const num = parseInt(String(seedLabel).replace(/[^\d].*/, ''), 10);
            return !isNaN(num);
        })
        .map(([name, seedLabel]) => ({
            name,
            label: String(seedLabel),
            num: parseInt(String(seedLabel).replace(/[^\d].*/, ''), 10)
        }))
        .sort((a, b) => a.num - b.num);

    if (preclasificados.length === 0) return null;

    return (
        <div className="absolute top-20 right-8 bg-white/95 backdrop-blur-sm border-2 border-[#b35a38]/20 rounded-2xl p-4 shadow-2xl z-20 print:hidden w-56 hidden md:block">
            <h3 className="text-xs font-black text-[#b35a38] uppercase italic mb-3 text-center border-b-2 border-[#b35a38]/10 pb-2">Preclasificados</h3>
            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
                {preclasificados.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-[#fffaf5] px-3 py-2 rounded-xl border border-[#b35a38]/10 shadow-sm hover:border-[#b35a38]/30 transition-colors">
                        <span className="flex items-center justify-center bg-[#b35a38] text-white font-black rounded-full h-7 w-7 text-xs shrink-0 shadow-inner">
                            {p.label}
                        </span>
                        <span className="text-slate-700 font-bold text-xs truncate" title={p.name}>{p.name}</span>
                    </div>
                ))}
            </div>
        </div>
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
    inscriptosList,
    showInscriptosModal,
    setShowInscriptosModal,
    fetchInscriptos,
    contactStatus,
    sendContactForm
  } = useTournamentData();

  const [historyTourSelected, setHistoryTourSelected] = useState<string | null>(null);
  const [selectedPlayerForStats, setSelectedPlayerForStats] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50; 

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    if (e.targetTouches.clientX < window.innerWidth * 0.20) {
        setTouchStart(e.targetTouches.clientX);
    } else {
        setTouchStart(null);
    }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart !== null) {
        setTouchEnd(e.targetTouches.clientX);
    }
  }

  const handleBackAction = () => {
    if (navState.level === "stats-tournaments" && historyTourSelected) {
        setHistoryTourSelected(null); 
    } 
    else if (navState.level === "stats-player" && selectedPlayerForStats) {
        setSelectedPlayerForStats(null);
    }
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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Montserrat:wght@500;700&display=swap');

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

        .sponsor-banner {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          background-color: #f4eaff; 
          border-radius: 12px;
          padding: 8px 16px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          font-family: Arial, sans-serif;
          max-width: 550px;
          margin: 0 auto 20px auto;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.1); 
        }
        .logo-column {
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          left: 12px;
        }
        .sponsor-logo {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          object-fit: cover;
          background-color: transparent; 
          border: none; 
        }
        .social-column {
          display: flex;
          flex-direction: column;
          align-items: flex-end; 
          justify-content: center;
          position: absolute;
          right: 12px; 
        }
        .sponsor-actions {
          display: flex;
          flex-direction: column; 
          gap: 8px;
          align-items: flex-start;
        }
        .btn-sponsor-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px; 
          text-decoration: none;
          background-color: transparent; 
          transition: transform 0.2s;
        }
        .btn-sponsor-icon:hover {
          transform: scale(1.15); 
        }
        .icon-svg {
          width: 22px; 
          height: 22px;
        }
        .text-column {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 2px; 
          margin: 0 auto; 
          width: 100%;
          max-width: 350px; 
        }
        .sponsor-title {
          margin: 0;
          color: #3e3e3e;
          font-size: 1.8rem;
          font-family: 'Playfair Display', serif; 
          font-weight: 900; 
          text-align: center; 
        }
        .sponsor-subtitle {
          margin-top: 4px;
          color: #555555;
          font-size: 0.8rem;
          font-family: 'Montserrat', sans-serif; 
          font-weight: 500; 
          text-align: center; 
          line-height: 1.2;
        }
        .sponsor-location {
          margin: 0;
          color: #777777;
          font-size: 0.7rem;
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          text-align: center;
        }
        @media (max-width: 650px) {
          .sponsor-banner {
            flex-direction: column;
            text-align: center;
            padding: 15px 12px;
          }
          .logo-column, .social-column {
            position: static;
            margin: 8px 0;
            align-items: center;
          }
          .sponsor-actions {
            flex-direction: row; 
            justify-content: center;
          }
          .text-column {
            max-width: 100%;
          }
          .sponsor-title {
            font-size: 1.6rem;
          }
        }
      `}</style>

      <div className={`w-full ${['direct-bracket', 'group-phase', 'ranking-view', 'damas-empty', 'generate-bracket', 'contact', 'stats-player', 'stats-tournaments', 'modality-selection'].includes(navState.level) ? 'max-w-[95%]' : 'max-w-6xl'} mx-auto z-10 text-center`}>
        
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

        {navState.level !== "home" && (
            <div className="flex justify-center mb-8 w-full print:hidden">
                <Button 
                    onClick={handleBackAction} 
                    className="bg-slate-800 hover:bg-slate-700 text-white font-black text-lg md:text-xl py-6 px-8 rounded-2xl shadow-xl border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-widest flex items-center gap-3 w-full md:w-auto justify-center h-auto whitespace-normal"
                >
                    <ArrowLeft className="w-6 h-6 shrink-0" />
                    <span>
                        {navState.level === "tournament-selection" ? "VOLVER A CATEGORIAS" : 
                         (navState.level === "stats-tournaments" && historyTourSelected) ? "VOLVER A TORNEOS" : 
                         (navState.level === "stats-player" && selectedPlayerForStats) ? "VOLVER AL LISTADO" : 
                         "VOLVER"}
                    </span>
                </Button>
            </div>
        )}

        {navState.gender === "caballeros" && ["tournament-selection", "tournament-phases", "group-phase", "direct-bracket", "generate-bracket", "modality-selection"].includes(navState.level) && (
          <div className="sponsor-banner print:hidden">
            <div className="logo-column">
              <img src="/logofer.jpg" alt="Cocinando con Fer Logo" className="sponsor-logo" />
            </div>

            <div className="text-column">
              <h1 className="sponsor-title">Cocinando con Fer</h1>
              <p className="sponsor-subtitle">Todo lo dulce que necesites. <br />Catering - desayuno - bandejas de desayuno</p>
              <p className="sponsor-location">📍 Ciudad Jardín</p>
            </div>

            <div className="social-column">
              <div className="sponsor-actions">
                <a href="https://wa.me/1562776599" target="_blank" rel="noopener noreferrer" className="btn-sponsor-icon" title="WhatsApp">
                  <svg className="icon-svg" viewBox="0 0 24 24">
                    <path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/cocinandoconfer/" target="_blank" rel="noopener noreferrer" className="btn-sponsor-icon" title="Instagram">
                  <svg className="icon-svg" viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id="ig-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f09433" />
                        <stop offset="25%" stopColor="#e6683c" />
                        <stop offset="50%" stopColor="#dc2743" />
                        <stop offset="75%" stopColor="#cc2366" />
                        <stop offset="100%" stopColor="#bc1888" />
                      </linearGradient>
                    </defs>
                    <path fill="url(#ig-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.203 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.98a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"/>
                  </svg>
                </a>
              </div>
            </div>
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
                  Ya estan sorteados los cuadros de Montecarlo! Entra a ver contra quien vas a jugar!
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
                      
                      // LOGICA AUSTRALIAN OPEN DAMAS: MOSTRAR SELECCION MODALIDAD
                      if (t.short === "AO" && navState.gender === "damas") {
                          setNavState({ ...navState, level: "modality-selection", tournament: t.name, tournamentShort: t.short });
                          return;
                      }

                      const effectiveType = getEffectiveTourType(t.short, navState.gender);
                      if (effectiveType === "direct") { 
                          setNavState({ ...navState, level: "tournament-phases", tournament: t.name, tournamentShort: t.short, currentTour: t.short, currentCat: navState.category, hasGroups: false }); 
                      } else { 
                          fetchGroupPhase(navState.category, t.short); 
                      }
                    }} className={buttonStyle}> {t.name}
                  </Button>
                ))}
            </div>
          )}

          {/* NUEVO: SELECCIÓN DE MODALIDAD (SINGLES / DOBLES) PARA DAMAS AO */}
          {navState.level === "modality-selection" && (
            <div className="space-y-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-black text-[#b35a38] uppercase italic mb-6">{navState.tournament}</h2>
                <Button onClick={() => {
                    // Guardamos la modalidad "S" en el estado
                    setNavState({ ...navState, modality: "S" });
                    
                    if (navState.category === "Damas A" || navState.category === "Damas B1") {
                        // Esto va a hacer que fetchGroupPhase busque "Grupos AO Damas A Singles"
                        fetchGroupPhase(`${navState.category} Singles`, navState.tournamentShort);
                    } else {
                        setNavState({ ...navState, level: "tournament-phases", tournament: navState.tournament, tournamentShort: navState.tournamentShort, currentTour: navState.tournamentShort, currentCat: navState.category, hasGroups: false, modality: "S" });
                    }
                }} className={buttonStyle}>Singles</Button>
                <Button onClick={() => {
                    // Guardamos la modalidad "D" en el estado
                    setNavState({ ...navState, modality: "D" });

                    if (navState.category === "Damas A" || navState.category === "Damas B1") {
                        // Ambas categorías van a buscar la fase de grupos
                        fetchGroupPhase(`${navState.category} Dobles`, navState.tournamentShort);
                    } else {
                        setNavState({ ...navState, level: "tournament-phases", tournament: navState.tournament, tournamentShort: navState.tournamentShort, currentTour: navState.tournamentShort, currentCat: navState.category, hasGroups: false, modality: "D" });
                    }
                }} className={buttonStyle}>Dobles</Button>
            </div>
          )}

          {navState.level === "tournament-phases" && (
            <div className="space-y-4 text-center">
              <h2 className="text-lg font-black mb-4 text-slate-800 uppercase">Fases del Torneo</h2>
              {navState.hasGroups ? (
                <>
                  <Button onClick={() => setNavState({ ...navState, level: "group-phase" })} className={buttonStyle}><Users className="mr-2" /> Fase de Grupos</Button>
                  <Button onClick={() => { 
                      const tourName = getTournamentName(navState.currentTour);
                      // Limpiamos " Singles" y " Dobles" de la categoría actual para que fetchBracketData arme bien el string
                      const catForBracket = navState.currentCat.replace(" Singles", "").replace(" Dobles", "");
                      fetchBracketData(catForBracket, navState.currentTour); 
                      setNavState({ ...navState, level: "direct-bracket", tournament: tourName, tournamentShort: navState.currentTour }); 
                  }} className={buttonStyle}><Grid3x3 className="mr-2" /> Cuadro Final</Button>
                </>
              ) : (
                <>
                  {getEffectiveTourType(navState.currentTour, navState.gender) !== "direct" && (
                      <Button onClick={() => runATPDraw(navState.currentCat, navState.currentTour)} className={buttonStyle}><RefreshCw className="mr-2" /> Realizar Sorteo ATP</Button>
                  )}
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
                    <div className="w-full relative">
                        <PreclasificadosList seeds={previewData.seeds} gender={navState.gender} isDirect={getEffectiveTourType(activeTour, navState.gender) === 'direct'} />
                        <BracketView bracketData={previewData} navState={navState} runDirectDraw={runDirectDraw} fetchQualifiersAndDraw={fetchQualifiersAndDraw} />
                        {!isSorteoConfirmado && (
                            <div className="bg-white/90 backdrop-blur-sm border-t-2 border-[#b35a38]/20 p-4 rounded-3xl mt-4 shadow-2xl flex flex-col md:flex-row gap-4 justify-center sticky bottom-4 z-50 print:hidden">
                                <Button onClick={enviarListaBasti} className="bg-blue-500 text-white font-bold h-12 px-8 shadow-lg"><List className="mr-2 w-4 h-4" /> LISTA BASTI</Button>
                                {getEffectiveTourType(navState.tournamentShort, navState.gender) === 'direct' ? (
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
                <div className="flex space-x-2 text-center">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start group-grid">
              {groupData.map((group, idx) => <GroupTable key={idx} group={group} tournamentShort={activeTour} />)}
            </div>
          </div>
        )}

        {navState.level === "direct-bracket" && (
           <div className="w-full relative">
               <PreclasificadosList seeds={bracketData?.seeds} gender={navState.gender} isDirect={getEffectiveTourType(activeTour, navState.gender) === 'direct'} />
               <BracketView bracketData={bracketData} navState={navState} runDirectDraw={runDirectDraw} fetchQualifiersAndDraw={fetchQualifiersAndDraw} />
           </div>
        )}

        {navState.level === "ranking-view" && (
           <RankingTable headers={headers} data={rankingData} category={navState.selectedCategory} year={navState.year} />
        )}

        {showRankingCalc && (
          <CalculatedRankingModal ranking={calculatedRanking} onClose={() => setShowRankingCalc(false)} tournamentShort={activeTour} category={navState.category} />
        )}

      </div>
      
      <div className="mt-12 flex justify-center items-center gap-3 text-center select-none text-slate-500/80 text-sm font-bold uppercase tracking-widest animate-pulse print:hidden">
         <p onClick={handleFooterClick} className="cursor-pointer hover:text-[#b35a38] transition-colors">Sistema de seguimiento de torneos</p>
         <span className="text-slate-300">|</span>
         <p onClick={() => {
             sendGAEvent('event', 'button_click', { event_label: 'Footer: Contacto' });
             setNavState({ level: "contact" });
         }} className="cursor-pointer hover:text-[#b35a38] transition-colors">Contacto</p>
      </div>
    </div>
  );
}