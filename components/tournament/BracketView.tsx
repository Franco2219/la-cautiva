import React from "react";
import Image from "next/image";
import { Button } from "../ui/button"; 
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
          {/* COLUMNA 1: 32 JUGADORES (Si aplica) */}
          {bracketData.bracketSize === 32 && (
            <div className="flex flex-col justify-around min-w-[150px] md:min-w-0 md:flex-1 relative">
              {Array.from({ length: 16 }, (_, i) => i * 2).map((idx) => {
                const p1 = bracketData.r1[idx];
                const p2 = bracketData.r1[idx + 1];
                const w1 = p1 && bracketData.r2.includes(p1);
                const w2 = p2 && bracketData.r2.includes(p2);
                const seed1 = bracketData.seeds ? bracketData.seeds[p1] : null;
                const seed2 = bracketData.seeds ? bracketData.seeds[p2] : null;

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
                          {seed1 ? (
                            <span className="text-[10px] text-orange-600 font-black mr-1">
                              {seed1}.
                            </span>
                          ) : null}
                          {p1 || ""}
                        </span>
                        <span className="text-black font-black text-[10px] ml-1">
                          {bracketData.s1[idx]}
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
                          {seed2 ? (
                            <span className="text-[10px] text-orange-600 font-black mr-1">
                              {seed2}.
                            </span>
                          ) : null}
                          {p2 || ""}
                        </span>
                        <span className="text-black font-black text-[10px] ml-1">
                          {bracketData.s1[idx + 1]}
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

          {/* COLUMNA 2: 16 JUGADORES (OCTAVOS) */}
          {bracketData.bracketSize >= 16 && (
            <div className="flex flex-col justify-around min-w-[150px] md:min-w-0 md:flex-1 relative">
              {[0, 2, 4, 6, 8, 10, 12, 14].map((idx, i) => {
                const r =
                  bracketData.bracketSize === 32
                    ? bracketData.r2
                    : bracketData.r1;
                const s =
                  bracketData.bracketSize === 32
                    ? bracketData.s2
                    : bracketData.s1;
                const nextR =
                  bracketData.bracketSize === 32
                    ? bracketData.r3
                    : bracketData.r2;
                const p1 = r[idx];
                const p2 = r[idx + 1];
                const w1 = p1 && nextR.includes(p1);
                const w2 = p2 && nextR.includes(p2);
                const s1 = s[idx];
                const s2 = s[idx + 1];
                const seed1 = bracketData.seeds ? bracketData.seeds[p1] : null;
                const seed2 = bracketData.seeds ? bracketData.seeds[p2] : null;

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
                          {seed1 ? (
                            <span className="text-[11px] text-orange-600 font-black mr-1">
                              {seed1}.
                            </span>
                          ) : null}
                          {p1 || ""}
                        </span>
                        <span className="text-black font-black text-xs ml-1">
                          {s1}
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
                          {seed2 ? (
                            <span className="text-[11px] text-orange-600 font-black mr-1">
                              {seed2}.
                            </span>
                          ) : null}
                          {p2 || ""}
                        </span>
                        <span className="text-black font-black text-xs ml-1">
                          {s2}
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

          {/* COLUMNA 3: CUARTOS DE FINAL */}
          <div className="flex flex-col justify-around min-w-[150px] md:min-w-0 md:flex-1 relative">
            {[0, 2, 4, 6].map((idx, i) => {
              const r =
                bracketData.bracketSize === 32
                  ? bracketData.r3
                  : bracketData.bracketSize === 16
                  ? bracketData.r2
                  : bracketData.r1;
              const s =
                bracketData.bracketSize === 32
                  ? bracketData.s3
                  : bracketData.bracketSize === 16
                  ? bracketData.s2
                  : bracketData.s1;
              const nextR =
                bracketData.bracketSize === 32
                  ? bracketData.r4
                  : bracketData.bracketSize === 16
                  ? bracketData.r3
                  : bracketData.r2;
              const p1 = r[idx];
              const p2 = r[idx + 1];
              const w1 = p1 && nextR.includes(p1);
              const w2 = p2 && nextR.includes(p2);
              const s1 = s[idx];
              const s2 = s[idx + 1];
              const seed1 = bracketData.seeds ? bracketData.seeds[p1] : null;
              const seed2 = bracketData.seeds ? bracketData.seeds[p2] : null;

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
                        {seed1 ? (
                          <span className="text-[11px] text-orange-600 font-black mr-1">
                            {seed1}.
                          </span>
                        ) : null}
                        {p1 || ""}
                      </span>
                      <span className="text-black font-black text-xs ml-1">
                        {s1}
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
                        {seed2 ? (
                          <span className="text-[11px] text-orange-600 font-black mr-1">
                            {seed2}.
                          </span>
                        ) : null}
                        {p2 || ""}
                      </span>
                      <span className="text-black font-black text-xs ml-1">
                        {s2}
                      </span>
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 -right-[10px] w-[10px] h-[1px] bg-slate-300" />
                  </div>
                  {i === 1 && <MiddleSpacer />}
                </React.Fragment>
              );
            })}
          </div>

          {/* COLUMNA 4: SEMIFINALES */}
          <div className="flex flex-col justify-around min-w-[150px] md:min-w-0 md:flex-1 relative">
            {[0, 2].map((idx, i) => {
              const r =
                bracketData.bracketSize === 32
                  ? bracketData.r4
                  : bracketData.bracketSize === 16
                  ? bracketData.r3
                  : bracketData.r2;
              const s =
                bracketData.bracketSize === 32
                  ? bracketData.s4
                  : bracketData.bracketSize === 16
                  ? bracketData.s3
                  : bracketData.s2;
              const p1 = r[idx];
              const p2 = r[idx + 1];
              const w1 = p1 && p1 === bracketData.winner;
              const w2 = p2 && p2 === bracketData.winner;
              const s1 = s[idx];
              const s2 = s[idx + 1];
              const seed1 = bracketData.seeds ? bracketData.seeds[p1] : null;
              const seed2 = bracketData.seeds ? bracketData.seeds[p2] : null;

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
                        {seed1 ? (
                          <span className="text-[11px] text-orange-600 font-black mr-1">
                            {seed1}.
                          </span>
                        ) : null}
                        {p1 || ""}
                      </span>
                      <span className="text-black font-black text-xs ml-1">
                        {s1}
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
                        {seed2 ? (
                          <span className="text-[11px] text-orange-600 font-black mr-1">
                            {seed2}.
                          </span>
                        ) : null}
                        {p2 || ""}
                      </span>
                      <span className="text-black font-black text-xs ml-1">
                        {s2}
                      </span>
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 -right-[10px] w-[10px] h-[1px] bg-slate-300" />
                  </div>
                  {i === 0 && <MiddleSpacer />}
                </React.Fragment>
              );
            })}
          </div>

          {/* COLUMNA 5: FINAL */}
          <div className="flex flex-col justify-center min-w-[150px] md:min-w-0 md:flex-1 relative">
            {(() => {
              let topFinalistName = "";
              let botFinalistName = "";
              if (
                bracketData.bracketSize === 16 &&
                bracketData.r4 &&
                bracketData.r4.length >= 2
              ) {
                topFinalistName = bracketData.r4[0];
                botFinalistName = bracketData.r4[1];
              } else if (
                bracketData.bracketSize === 32 &&
                bracketData.r5 &&
                bracketData.r5.length >= 2
              ) {
                topFinalistName = bracketData.r5[0];
                botFinalistName = bracketData.r5[1];
              } else if (
                bracketData.bracketSize === 8 &&
                bracketData.r3 &&
                bracketData.r3.length >= 2
              ) {
                topFinalistName = bracketData.r3[0];
                botFinalistName = bracketData.r3[1];
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

          {/* COLUMNA 6: CAMPEÓN */}
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
                  <Button
                    onClick={() =>
                      runDirectDraw(navState.category, navState.tournamentShort)
                    }
                    className={`${bracketStyle.color} text-white font-bold px-8 shadow-lg`}
                  >
                    <Shuffle className="mr-2 w-4 h-4" /> Sortear
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      fetchQualifiersAndDraw(
                        navState.category,
                        navState.tournamentShort
                      )
                    }
                    className={`${bracketStyle.color} text-white font-bold px-8 shadow-lg`}
                  >
                    <Shuffle className="mr-2 w-4 h-4" /> Sortear
                  </Button>
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