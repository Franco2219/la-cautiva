// --- CONFIGURACIÓN DE DATOS ---
export const ID_2025 = '1_tDp8BrXZfmmmfyBdLIUhPk7PwwKvJ_t'; 
export const ID_DATOS_GENERALES = '1RVxm-lcNp2PWDz7HcDyXtq0bWIWA9vtw'; 
export const ID_TORNEOS = '117mHAgirc9WAaWjHAhsalx1Yp6DgQj5bv2QpVZ-nWmI'; 
export const MI_TELEFONO = "5491150568353"; 
export const TELEFONO_BASTI = "5491123965949"; 

export const tournaments = [
  { id: "adelaide", name: "Adelaide", short: "Adelaide", type: "direct" },
  { id: "s8_500", name: "Super 8 / 500", short: "S8 500", type: "direct" },
  { id: "s8_250", name: "Super 8 / 250", short: "S8 250", type: "direct" },
  { id: "ao", name: "Australian Open", short: "AO", type: "full" }, 
  { id: "iw", name: "Indian Wells", short: "IW", type: "full" },
  { id: "mc", name: "Monte Carlo", short: "MC", type: "full" },
  { id: "rg", name: "Roland Garros", short: "RG", type: "full" },
  { id: "wimbledon", name: "Wimbledon", short: "W", type: "full" },
  { id: "us", name: "US Open", short: "US", type: "direct" },
  { id: "masters", name: "Masters", short: "Masters", type: "full" },
  { id: "adelaide 250", name: "Adelaide 250, short: "Adelaide 250", type: "direct" },
];

// --- CONFIGURACIÓN DE ESTILOS Y LOGOS POR TORNEO ---
// Definimos una interfaz básica para que TypeScript no se queje
export interface TournamentStyle {
    color: string;
    borderColor: string;
    textColor: string;
    trophyColor: string;
    logo: string;
    pointsLogo: string | null;
}

export const TOURNAMENT_STYLES: Record<string, TournamentStyle> = {
    // SUPERFICIE DURA (AZUL OSCURO - BLUE 900)
    "adelaide": { 
        color: "bg-blue-900", 
        borderColor: "border-blue-900", 
        textColor: "text-blue-900", 
        trophyColor: "text-blue-900", 
        logo: "/logos/adelaide.png", 
        pointsLogo: "/logos/pts_s8_500.png" 
    },
    "ao": { 
        color: "bg-blue-900", 
        borderColor: "border-blue-900", 
        textColor: "text-blue-900", 
        trophyColor: "text-blue-900", 
        logo: "/logos/ao.png", 
        pointsLogo: null 
    },
    "us": { 
        color: "bg-blue-900", 
        borderColor: "border-blue-900", 
        textColor: "text-blue-900", 
        trophyColor: "text-blue-900", 
        logo: "/logos/usopen.png", 
        pointsLogo: null
    },
    "iw": { 
        color: "bg-blue-900", 
        borderColor: "border-blue-900", 
        textColor: "text-blue-900", 
        trophyColor: "text-blue-900", 
        logo: "/logos/indianwells.png", 
        pointsLogo: "/logos/pts_indianwells.png" 
    },
    "masters": { 
        color: "bg-blue-950", 
        borderColor: "border-blue-950", 
        textColor: "text-blue-950", 
        trophyColor: "text-blue-950", 
        logo: "/logos/masters.png", 
        pointsLogo: null
    },
    
    // CESPED (VERDE OFICIAL WIMBLEDON)
    "wimbledon": { 
      color: "bg-[#00703C]", 
      borderColor: "border-[#00703C]", 
      textColor: "text-[#00703C]", 
      trophyColor: "text-[#00703C]", 
      logo: "/logos/wimbledon.png", 
      pointsLogo: null 
    },

    // POLVO DE LADRILLO (NARANJA - DEFAULT)
    "rg": { 
        color: "bg-[#b35a38]", 
        borderColor: "border-[#b35a38]", 
        textColor: "text-[#b35a38]", 
        trophyColor: "text-[#b35a38]", 
        logo: "/logos/rg.svg", 
        pointsLogo: null 
    },
    "mc": { 
        color: "bg-[#b35a38]", 
        borderColor: "border-[#b35a38]", 
        textColor: "text-[#b35a38]", 
        trophyColor: "text-[#b35a38]", 
        logo: "/logos/mc.png", 
        pointsLogo: "/logos/pts_mc.png" 
    },
    "s8_500": { 
        color: "bg-[#b35a38]", 
        borderColor: "border-[#b35a38]", 
        textColor: "text-[#b35a38]", 
        trophyColor: "text-[#b35a38]", 
        logo: "/logos/s8_500.png", 
        pointsLogo: "/logos/pts_s8_500.png" 
    },
    "s8_250": { 
        color: "bg-[#b35a38]", 
        borderColor: "border-[#b35a38]", 
        textColor: "text-[#b35a38]", 
        trophyColor: "text-[#b35a38]", 
        logo: "/logos/s8_250.png", 
        pointsLogo: "/logos/pts_s8_250.png" 
    },
    "adelaide_250: {
        color: "bg-blue-900", 
        borderColor: "border-blue-900", 
        textColor: "text-blue-900", 
        trophyColor: "text-blue-900", 
        logo: "/logos/adelaide.png", 
        pointsLogo: "/logos/pts_s8_250.png" 

    // FALLBACK
    "default": { 
        color: "bg-[#b35a38]", 
        borderColor: "border-[#b35a38]", 
        textColor: "text-[#b35a38]", 
        trophyColor: "text-[#b35a38]", 
        logo: "/logo.png", 
        pointsLogo: null 
    }
};