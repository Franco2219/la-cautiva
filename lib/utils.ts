import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { tournaments, TOURNAMENT_STYLES } from './constants';

// --- 1. FUNCIÓN NECESARIA PARA UI (BOTONES) ---
// Esta es la función que faltaba y causaba el error
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- 2. FUNCIONES DEL TORNEO (NUESTRAS) ---

// Función para parsear CSV
export const parseCSV = (text: string) => {
  if (!text) return [];
  return text.split('\n').map(row => 
    row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c ? c.replace(/"/g, '').trim() : "")
  );
};

// Función para obtener el nombre completo del torneo
export const getTournamentName = (shortName: string) => {
    const tour = tournaments.find(t => t.short === shortName);
    return tour ? tour.name : shortName;
};

// Función para obtener los estilos del torneo
export const getTournamentStyle = (shortName: string) => {
    const key = shortName ? shortName.toLowerCase().trim() : "default";
    const map: any = { 
        "adelaide": "adelaide", 
        "ao": "ao", 
        "us open": "us", "us": "us", 
        "indian wells": "iw", "iw": "iw", 
        "masters": "masters", 
        "wimbledon": "wimbledon", "w": "wimbledon",
        "roland garros": "rg", "rg": "rg",
        "monte carlo": "mc", "mc": "mc",
        "s8 500": "s8_500", "super 8 / 500": "s8_500",
        "s8 250": "s8_250", "super 8 / 250": "s8_250"
    };
    const styleKey = map[key] || "default";
    return TOURNAMENT_STYLES[styleKey] || TOURNAMENT_STYLES["default"];
};