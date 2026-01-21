import React from "react";
import Image from "next/image";
import { Trophy, AlertCircle, Shuffle } from "lucide-react";
import { getTournamentName, getTournamentStyle } from "../../lib/utils";
import { tournaments } from "../../lib/constants";

interface BracketViewProps {
  bracketData: any;
  navState: any;
  runDirectDraw: (category: string, tournament: string) => void;
  fetchQualifiersAndDraw: (category: string, tournament: string) => void;
}

const MiddleSpacer = () => (
  <div className="h-4 md:h-8 w-full relative">
    <div className="absolute left-0 top-1/2 w-full border-t-2 border-dotted border-slate-200/50"></div>
  </div>
);

export const BracketView = ({
  bracketData,
  navState,
  runDirectDraw,
  fetchQualifiersAndDraw,
}: BracketViewProps) => {
  const bracketStyle = getTournamentStyle(navState.tournamentShort);
  const tournamentName = getTournamentName(navState.tournamentShort);
  
  // --- CORRECCIÓN DEFINITIVA DE TAMAÑO ---
  // Por defecto confiamos en el dato bracketSize, pero si es dudoso, usamos 32.
  let getSize = Number(bracketData.bracketSize) || 32;

  // Lógica de "Fuerza Bruta": Si la lista de la Ronda 1 tiene más de 32 elementos 
  // (independientemente de bracketSize), TIENE que ser un cuadro de 64.
  if (bracketData.r1 && bracketData.r1.length > 32) {
      getSize = 64;
  }
  
  // Doble chequeo: Si el nombre del torneo sugiere Grand Slam (AO, US Open, etc) y no es qualy,
  // y tenemos datos en r1, forzamos 64 para evitar errores visuales.
  const isGrandSlam = ["AO", "US", "WB", "RG"].includes(navState.tournamentShort);
  if (isGrandSlam && bracketData.r1 && bracketData.r1.length >= 32 && getSize < 64) {
      // Si es Grand Slam y hay bastantes datos, ante la duda mostramos 64 para no ocultar la primera ronda
      getSize = 64;
  }

  // Helper para mapear las rondas dinámicamente según el tamaño del cuadro
  const getRoundData = (roundName: 'r64' | 'r32' | 'r16' | 'qf' | 'sf' | 'f') => {
      if (roundName === 'r64') {
          if (getSize === 64) return [bracketData.r1, bracketData.s1, bracketData.r2];
          return [null, null, null];
      }
      if (roundName === 'r32') {
          if (getSize === 64) return [bracketData.r2, bracketData.s2, bracketData.r3];
          if (getSize === 32) return [bracketData.r1, bracketData.s1, bracketData.r2];
          return [null, null, null];
      }
      if (roundName === 'r16') {
          if (getSize === 64) return [bracketData.r3, bracketData.s3, bracketData.r4];
          if (getSize === 32) return [bracketData.r2, bracketData.s2, bracketData.r3];
          if (getSize === 16) return [bracketData.r1, bracketData.s1, bracketData.r2];
          return [null, null, null];
      }
      if (roundName === 'qf') {
          if (getSize === 64) return [bracketData.r4, bracketData.s4, bracketData.r5];
          if (getSize === 32) return [bracketData.r3, bracketData.s3, bracketData.r4];
          if (getSize === 16) return [bracketData.r2, bracketData.s2, bracketData.r3];
          if (getSize === 8)  return [bracketData.r1, bracketData.s1, bracketData.r2];
          return [null, null, null];
      }
      if (roundName === 'sf') {
          if (getSize === 64) return [bracketData.r5, bracketData.s5, bracketData.r6];
          if (getSize === 32) return [bracketData.r4, bracketData.s4, bracketData.r5];
          if (getSize === 16) return [bracketData.r3, bracketData.s3, bracketData.r4];
          if (getSize === 8)  return [bracketData.r2, bracketData.s2, bracketData.r3];
          return [null, null, null];
      }
      return [null, null, null];
  };

  // Helper para renderizar el seed sin punto extra si es texto (zona)
  const renderSeed = (name: string) => {
      if (!name || !bracketData.seeds) return null;
      const seed = bracketData.seeds[name];
      if (!seed) return null;
      
      const label = isNaN(seed) ? seed : `${seed}.`;
      return (
        <span className="text-[10px] text-orange-600 font-black mr-1 whitespace-nowrap">
          {label}
        </span>
      );
  };

  return (
    <div className="bg-white border-2 border-[#b35a38]/10 rounded-[2.5rem] p-4 shadow-2xl text-center md:overflow-visible overflow-hidden">
      {/* Header del Bracket */}
      <div
        className={`${bracketStyle.color} p-3 rounded-2xl mb-6 text-center text-white italic w-full mx-auto flex flex-wrap md:flex-nowrap items-center justify-between`}
      >
        <div className="w-20 h-20 flex items-center justify-center relative order-1">
          {bracketStyle.logo && (
            <Image
              src={bracketStyle.logo}
              alt="Tour Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          )}
        </div>
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider order-3 md:order-2 w-full md:w-auto mt-2 md:mt-0">
          {tournamentName} - {navState.selectedCategory}
        </h2>
        <div className="w-20 h-20 flex items-center justify-center relative order-2 md:order-3">
          {bracketStyle.pointsLogo && (
            <Image
              src={bracketStyle.pointsLogo}
              alt="Points"
              width={80}
              height={80}
              className="object-contain opacity-80"
            />
          )}
        </div>
      </div>

      {bracketData.hasData ? (
        <div className="flex flex-row items-stretch justify-between w-full overflow-x-auto gap-0 md:gap-1 py-8 px-1 relative text-left">
          
          {/* NUEVA COLUMNA: 64 JUGADORES (32 PARTIDOS) */}
          {getSize === 64 && (
            <div className="flex flex-col justify-around min-w-[150px] md:min-w-0 md:flex-1 relative">
              {Array.from({ length: 32 }, (_, i) => i * 2).map((idx) => {
                const [r, s, nextR] = getRoundData('r64');
                const p1 = r ? r[idx] : null;
                const p2 = r ? r[idx + 1] : null;
                // Usamos verificaciones seguras (p1 && nextR && nextR.includes...) para evitar errores si la siguiente ronda está vacía
                const w1 = p1 && nextR && nextR.includes(p1);
                const w2 = p2 && nextR && nextR.includes(p2);

                return (
                  <React.Fragment key={idx}>
                    <div className="relative flex flex-col space-y-1 mb-1">
                      <div
                        className={`h-5 border-b-2 ${
                          w1 ? bracketStyle.borderColor : "border-slate-300"
                        } flex justify-between items-end relative bg-white`}
                      >
                        <span
                          className={`${
                            p1 === "BYE"
                              ? "text-green-600 font-black"
                              : w1
                              ? `${bracketStyle.textColor} font-black`
                              : "text-slate-700 font-bold"
                          } text-[10px] md:text-[11px] uppercase truncate max-w-[160px]`}
                        >
                          {renderSeed(p1)}
                          {p1 || ""}
                        </span>
                        <span className="text-black font-black text-[9px] ml-1">
                          {s ? s[idx] : ""}
                        </span>
                      </div>
                      <div
                        className={`h-5 border-b-2 ${
                          w2 ? bracketStyle.borderColor : "border-slate-300"
                        } flex justify-between items-end relative bg-white`}
                      >
                        <span
                          className={`${
                            p2 === "BYE"
                              ? "text-green-600 font-black"
                              : w2
                              ? `${bracketStyle.textColor} font-black`
                              : "text-slate-700 font-bold"
                          } text-[10px] md:text-[11px] uppercase truncate max-w-[160px]`}
                        >
                          {renderSeed(p2)}
                          {p2 || ""}
                        </span>
                        <span className="text-black font-black text-[9px] ml-1">
                          {s ? s[idx + 1] : ""}
                        </span>
                      </div>
                      <div className="absolute top-1/2 -translate-y-1/2 -right-[5px] w-[5px] h-[1px] bg-slate-300" />
                    </div>
                    {idx === 30 && <MiddleSpacer />}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* COLUMNA: 32 JUGADORES */}
          {getSize >= 32 && (
            <div className="flex flex-col justify-around min-w-[150px] md:min-w-0 md:flex-1 relative">
              {Array.from({ length: 16 }, (_, i) => i * 2).map((idx) => {
                const [r, s, nextR] = getRoundData('r32');
                if (!r) return null; // Safety check
                const p1 = r[idx];
                const p2 = r[idx + 1];
                const w1 = p1 && nextR && nextR.includes(p1);
                const w2 = p2 && nextR && nextR.includes(p2);

                return (
                  <React.Fragment key={idx}>
                    <div className="relative flex flex-col space-y-2 mb-2">
                      <div
                        className={`h-6 border-b-2 ${
                          w1 ? bracketStyle.borderColor : "border-slate-300"
                        } flex justify-between items-end relative bg-white`}
                      >
                        <span
                          className={`${
                            p1 === "BYE"
                              ? "text-green-600 font-black"
                              : w1
                              ? `${bracketStyle.textColor} font-black`
                              : "text-slate-700 font-bold"
                          } text-[11px] md:text-xs uppercase truncate max-w-[160px]`}
                        >
                          {renderSeed(p1)}
                          {p1 || ""}
                        </span>
                        <span className="text-black font-black text-[10px] ml-1">
                          {s ? s[idx] : ""}
                        </span>
                      </div>
                      <div
                        className={`h-6 border-b-2 ${
                          w2 ? bracketStyle.borderColor : "border-slate-300"
                        } flex justify-between items-end relative bg-white`}
                      >
                        <span
                          className={`${
                            p2 === "BYE"
                              ? "text-green-600 font-black"
                              : w2
                              ? `${bracketStyle.textColor} font-black`
                              : "text-slate-700 font-bold"
                          } text-[11px] md:text-xs uppercase truncate max-w-[160px]`}
                        >
                          {renderSeed(p2)}
                          {p2 || ""}
                        </span>
                        <span className="text-black font-black text-[10px] ml-1">
                          {s ? s[idx + 1] : ""}
                        </span>
                      </div>
                      <div className="absolute top-1/2 -translate-y-1/2 -right-[10px] w-[10px] h-[1px] bg-slate-300" />
                    </div>
                    {idx === 14 && <MiddleSpacer />}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* COLUMNA: 16 JUGADORES (OCTAVOS) */}
          {getSize >= 16 && (
            <div className="flex flex-col justify-around min-w-[150px] md:min-w-0 md:flex-1 relative">
              {[0, 2, 4, 6, 8, 10, 12, 14].map((idx, i) => {
                const [r, s, nextR] = getRoundData('r16');
                if (!r) return null;
                const p1 = r[idx];
                const p2 = r[idx + 1];
                const w1 = p1 && nextR && nextR.includes(p1);
                const w2 = p2 && nextR && nextR.includes(p2);

                return (
                  <React.Fragment key={idx}>
                    <div className="relative flex flex-col space-y-4">
                      <div
                        className={`h-8 border-b-2 ${
                          w1 ? bracketStyle.borderColor : "border-slate-300"
                        } flex justify-between items-end bg-white relative`}
                      >
                        <span
                          className={`${
                            p1 === "BYE"
                              ? "text-green-600 font-black"
                              : w1
                              ? `${bracketStyle.textColor} font-black`
                              : "text-slate-700 font-bold"
                          } text-xs md:text-sm uppercase truncate`}
                        >
                          {renderSeed(p1)}
                          {p1 || ""}
                        </span>
                        <span className="text-black font-black text-xs ml-1">
                          {s ? s[idx] : ""}
                        </span>
                      </div>
                      <div
                        className={`h-8 border-b-2 ${
                          w2 ? bracketStyle.borderColor : "border-slate-300"
                        } flex justify-between items-end relative bg-white`}
                      >
                        <span
                          className={`${
                            p2 === "BYE"
                              ? "text-green-600 font-black"
                              : w2
                              ? `${bracketStyle.textColor} font-black`
                              : "text-slate-700 font-bold"
                          } text-xs md:text-sm uppercase truncate`}
                        >
                          {renderSeed(p2)}
                          {p2 || ""}
                        </span>
                        <span className="text-black font-black text-xs ml-1">
                          {s ? s[idx + 1] : ""}
                        </span>
                      </div>
                      <div className="absolute top-1/2 -translate-y-1/2 -right-[10px] w-[10px] h-[1px] bg-slate-300" />
                    </div>
                    {i === 3 && <MiddleSpacer />}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* COLUMNA: CUARTOS DE FINAL */}
          <div className="flex flex-col justify-around min-w-[150px] md:min-w-0 md:flex-1 relative">
            {[0, 2, 4, 6].map((idx, i) => {
              const [r, s, nextR] = getRoundData('qf');
              const p1 = r ? r[idx] : null;
              const p2 = r ? r[idx + 1] : null;
              const w1 = p1 && nextR && nextR.includes(p1);
              const w2 = p2 && nextR && nextR.includes(p2);

              return (
                <React.Fragment key={idx}>
                  <div className="relative flex flex-col space-y-8">
                    <div
                      className={`h-8 border-b-2 ${
                        w1 ? bracketStyle.borderColor : "border-slate-300"
                      } flex justify-between items-end bg-white relative text-center`}
                    >
                      <span
                        className={`${
                          p1 === "BYE"
                            ? "text-green-600 font-black"
                            : w1
                            ? `${bracketStyle.textColor} font-black`
                            : "text-slate-700 font-bold"
                        } text-xs md:text-sm uppercase truncate`}
                      >
                        {renderSeed(p1)}
                        {p1 || ""}
                      </span>
                      <span className="text-black font-black text-xs ml-1">
                        {s ? s[idx] : ""}
                      </span>
                    </div>
                    <div
                      className={`h-8 border-b-2 ${
                        w2 ? bracketStyle.borderColor : "border-slate-300"
                      } flex justify-between items-end bg-white relative text-center`}
                    >
                      <span
                        className={`${
                          p2 === "BYE"
                            ? "text-green-600 font-black"
                            : w2
                            ? `${bracketStyle.textColor} font-black`
                            : "text-slate-700 font-bold"
                        } text-xs md:text-sm uppercase truncate`}
                      >
                        {renderSeed(p2)}
                        {p2 || ""}
                      </span>
                      <span className="text-black font-black text-xs ml-1">
                        {s ? s[idx + 1] : ""}
                      </span>
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 -right-[10px] w-[10px] h-[1px] bg-slate-300" />
                  </div>
                  {i === 1 && <MiddleSpacer />}
                </React.Fragment>
              );
            })}
          </div>

          {/* COLUMNA: SEMIFINALES */}
          <div className="flex flex-col justify-around min-w-[150px] md:min-w-0 md:flex-1 relative">
            {[0, 2].map((idx, i) => {
              const [r, s] = getRoundData('sf');
              const p1 = r ? r[idx] : null;
              const p2 = r ? r[idx + 1] : null;

              // Determinamos ganadores de Semis mirando si están en la final o si son el winner/runnerUp
              let finals = [];
              if (getSize === 64) finals = bracketData.r6 || [];
              else if (getSize === 32) finals = bracketData.r5 || [];
              else if (getSize === 16) finals = bracketData.r4 || [];
              else finals = bracketData.r3 || [];
              
              const isFinalist = (p: string) => {
                  if (!p || p === "BYE") return false;
                  if (p === bracketData.winner || p === bracketData.runnerUp) return true;
                  return finals.includes(p);
              };

              const w1 = isFinalist(p1);
              const w2 = isFinalist(p2);

              return (
                <React.Fragment key={idx}>
                  <div className="relative flex flex-col space-y-12">
                    <div
                      className={`h-8 border-b-2 ${
                        w1 ? bracketStyle.borderColor : "border-slate-300"
                      } flex justify-between items-end bg-white relative text-center`}
                    >
                      <span
                        className={`${
                          p1 === "BYE"
                            ? "text-green-600 font-black"
                            : w1
                            ? `${bracketStyle.textColor} font-black`
                            : "text-slate-700 font-bold"
                        } text-xs md:text-sm uppercase truncate`}
                      >
                        {renderSeed(p1)}
                        {p1 || ""}
                      </span>
                      <span className="text-black font-black text-xs ml-1">
                        {s ? s[idx] : ""}
                      </span>
                    </div>
                    <div
                      className={`h-8 border-b-2 ${
                        w2 ? bracketStyle.borderColor : "border-slate-300"
                      } flex justify-between items-end bg-white relative text-center`}
                    >
                      <span
                        className={`${
                          p2 === "BYE"
                            ? "text-green-600 font-black"
                            : w2
                            ? `${bracketStyle.textColor} font-black`
                            : "text-slate-700 font-bold"
                        } text-xs md:text-sm uppercase truncate`}
                      >
                        {renderSeed(p2)}
                        {p2 || ""}
                      </span>
                      <span className="text-black font-black text-xs ml-1">
                        {s ? s[idx + 1] : ""}
                      </span>
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 -right-[10px] w-[10px] h-[1px] bg-slate-300" />
                  </div>
                  {i === 0 && <MiddleSpacer />}
                </React.Fragment>
              );
            })}
          </div>

          {/* COLUMNA: FINAL */}
          <div className="flex flex-col justify-center min-w-[150px] md:min-w-0 md:flex-1 relative">
            {(() => {
              let topFinalistName = "";
              let botFinalistName = "";
              
              // Buscamos array de final
              let finalRound = [];
              if (getSize === 64) finalRound = bracketData.r6;
              else if (getSize === 32) finalRound = bracketData.r5;
              else if (getSize === 16) finalRound = bracketData.r4;
              else finalRound = bracketData.r3;

              if (finalRound && finalRound.length >= 2) {
                topFinalistName = finalRound[0];
                botFinalistName = finalRound[1];
              } else {
                if (bracketData.winner) {
                  topFinalistName = bracketData.winner;
                  botFinalistName = bracketData.runnerUp;
                }
              }
              const isTopWinner =
                topFinalistName && topFinalistName === bracketData.winner;
              const isBotWinner =
                botFinalistName && botFinalistName === bracketData.winner;
              return (
                <div className="relative flex flex-col space-y-2">
                  <div
                    className={`h-8 border-b-2 ${
                      isTopWinner ? bracketStyle.borderColor : "border-slate-300"
                    } flex justify-between items-end bg-white relative`}
                  >
                    <span
                      className={`${
                        topFinalistName === "BYE"
                          ? "text-green-600 font-black"
                          : isTopWinner
                          ? `${bracketStyle.textColor} font-black`
                          : "text-slate-700 font-bold"
                      } text-xs md:text-sm uppercase truncate`}
                    >
                      {topFinalistName || ""}
                    </span>
                  </div>
                  <div
                    className={`h-8 border-b-2 ${
                      isBotWinner ? bracketStyle.borderColor : "border-slate-300"
                    } flex justify-between items-end bg-white relative`}
                  >
                    <span
                      className={`${
                        botFinalistName === "BYE"
                          ? "text-green-600 font-black"
                          : isBotWinner
                          ? `${bracketStyle.textColor} font-black`
                          : "text-slate-700 font-bold"
                      } text-xs md:text-sm uppercase truncate`}
                    >
                      {botFinalistName || ""}
                    </span>
                  </div>
                  <div className="absolute top-1/2 -translate-y-1/2 -right-[10px] w-[10px] h-[1px] bg-slate-300" />
                </div>
              );
            })()}
          </div>

          {/* COLUMNA: CAMPEÓN */}
          <div className="flex flex-col justify-center min-w-[80px] md:min-w-0 md:flex-1 relative">
            <div className="relative flex flex-col items-center">
              <div className="h-px w-6 bg-slate-300 absolute left-0 top-1/2 -translate-y-1/2 -ml-1" />
              <Trophy
                className={`w-14 h-14 ${bracketStyle.trophyColor} mb-2 animate-bounce`}
              />
              <span
                className={`text-xs md:text-base font-black uppercase tracking-[0.2em] mb-1 scale-125 ${bracketStyle.textColor} opacity-70`}
              >
                CAMPEÓN
              </span>
              <span className="text-[#b35a38] font-black text-lg md:text-xl italic uppercase text-center w-full block drop-shadow-sm leading-tight">
                {bracketData.winner || ""}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* ESTADO VACÍO / GENERAR SORTEO */
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <AlertCircle className="w-20 h-20 mb-4 opacity-50" />
          <h3 className="text-2xl font-black uppercase tracking-wider mb-2">
            Cuadro no definido aún
          </h3>
          {bracketData.canGenerate ? (
            <div className="mt-4">
              <p className="font-medium text-slate-500 mb-4">
                Se encontraron clasificados en el sistema.
              </p>
              <div className="flex gap-2 justify-center">
                {tournaments.find(
                  (t) => t.short === navState.tournamentShort
                )?.type === "direct" ? (
                  <button
                    onClick={() =>
                      runDirectDraw(navState.category, navState.tournamentShort)
                    }
                    className={`${bracketStyle.color} hover:brightness-110 transition-all text-white font-bold px-8 py-2 rounded-md shadow-lg flex items-center justify-center`}
                  >
                    <Shuffle className="mr-2 w-4 h-4" /> Sortear
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      fetchQualifiersAndDraw(
                        navState.category,
                        navState.tournamentShort
                      )
                    }
                    className={`${bracketStyle.color} hover:brightness-110 transition-all text-white font-bold px-8 py-2 rounded-md shadow-lg flex items-center justify-center`}
                  >
                    <Shuffle className="mr-2 w-4 h-4" /> Sortear
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="font-medium text-slate-500">
              Los cruces para este torneo estarán disponibles próximamente.
            </p>
          )}
        </div>
      )}
    </div>
  );
};