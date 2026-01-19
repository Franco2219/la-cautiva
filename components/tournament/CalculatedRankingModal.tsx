import React from "react";
import { Button } from "@/components/ui/button";
import { Trophy, X, Copy, Send } from "lucide-react";
import { getTournamentStyle, getTournamentName } from "@/lib/utils";
import { MI_TELEFONO } from "@/lib/constants";

interface CalculatedRankingModalProps {
  ranking: { name: string; points: number }[];
  onClose: () => void;
  tournamentShort: string;
  category: string;
}

export const CalculatedRankingModal = ({
  ranking,
  onClose,
  tournamentShort,
  category,
}: CalculatedRankingModalProps) => {
  const style = getTournamentStyle(tournamentShort);
  const tournamentName = getTournamentName(tournamentShort);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative max-h-[80vh] overflow-y-auto">
        <Button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
          variant="ghost"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Header del Modal */}
        <div className="text-center mb-6">
          <Trophy
            className={`w-12 h-12 mx-auto mb-2 ${style.trophyColor}`}
          />
          <h3 className={`text-2xl font-black uppercase ${style.textColor}`}>
            Cálculo de Puntos
          </h3>
          <p className="text-sm text-slate-500 font-medium uppercase mt-1">
            Torneo: {tournamentName}
            <br />
            <span className="text-xs opacity-80">{category}</span>
          </p>
        </div>

        {/* Tabla de Puntos */}
        <div className="bg-slate-50 rounded-xl border-2 border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className={`${style.color} text-white`}>
              <tr>
                <th className="p-3 font-bold text-sm uppercase tracking-wider">
                  Jugador
                </th>
                <th className="p-3 font-bold text-sm uppercase tracking-wider text-right">
                  Puntos
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ranking.map((p, i) => (
                <tr key={i} className="hover:bg-white transition-colors">
                  <td className="p-3 font-bold text-slate-700 uppercase text-sm">
                    {p.name}
                  </td>
                  <td
                    className={`p-3 font-black text-right ${style.textColor}`}
                  >
                    {p.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Botones de Acción */}
        <div className="mt-6 flex gap-4">
          <Button
            onClick={() => {
              const text = ranking
                .map((p) => `${p.name}\t${p.points}`)
                .join("\n");
              navigator.clipboard.writeText(text);
              alert("Tabla copiada al portapapeles");
            }}
            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold h-12 rounded-xl"
          >
            <Copy className="mr-2 w-4 h-4" /> COPIAR TABLA
          </Button>
          <Button
            onClick={() => {
              let mensaje = `*RANKING CALCULADO - ${tournamentShort}*\n\n`;
              ranking.forEach((p) => {
                mensaje += `${p.name}: ${p.points}\n`;
              });
              window.open(
                `https://wa.me/${MI_TELEFONO}?text=${encodeURIComponent(
                  mensaje
                )}`,
                "_blank"
              );
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-xl"
          >
            <Send className="mr-2 w-4 h-4" /> ENVIAR WHATSAPP
          </Button>
        </div>
      </div>
    </div>
  );
};