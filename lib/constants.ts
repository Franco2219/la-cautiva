import { Trophy, Calendar, Star, MapPin } from "lucide-react";

export const ID_DATOS_GENERALES = "1RVxm-lcNp2PWDz7HcDyXtq0bWIWA9vtw"; 
export const ID_TORNEOS = "117mHAgirc9WAaWjHAhsalx1Yp6DgQj5bv2QpVZ-nWmI"; 
export const ID_2025 = "1_tDp8BrXZfmmmfyBdLIUhPk7PwwKvJ_t"; 

export const MI_TELEFONO = "5491150568353"; 
export const TELEFONO_BASTI = "5491123965949"; 

// --- LISTA DE TORNEOS ---
// IMPORTANTE: El 'short' aquí debe ser IDÉNTICO a la clave en TOURNAMENT_STYLES de abajo
export const tournaments = [
  { id: "adelaide", name: "Adelaide", short: "adelaide", type: "direct" },
  { id: "adelaide_250", name: "Adelaide 250", short: "adelaide 250", type: "direct" },
  { id: "s8_500", name: "Super 8 / 500", short: "s8_500", type: "direct" },
  { id: "s8_250", name: "Super 8 / 250", short: "s8_250", type: "direct" },
  { id: "ao", name: "Australian Open", short: "ao", type: "full" }, 
  { id: "iw", name: "Indian Wells", short: "iw", type: "full" },
  { id: "mc", name: "Monte Carlo", short: "mc", type: "full" },
  { id: "rg", name: "Roland Garros", short: "rg", type: "full" },
  { id: "wimbledon", name: "Wimbledon", short: "wimbledon", type: "full" },
  { id: "us", name: "US Open", short: "us", type: "direct" },
  { id: "masters", name: "Masters", short: "masters", type: "full" },
];

// --- CONFIGURACIÓN DE ESTILOS Y LOGOS POR TORNEO ---
// NOTA: Usamos códigos HEX (ej: [#1e3a8a]) en lugar de nombres (blue-900) 
// para que el botón pueda detectar el color y hacer el efecto hover blanco.

export const TOURNAMENT_STYLES: any = {
    // SUPERFICIE DURA (AZUL OSCURO - BLUE 900 es #1e3a8a)
    "adelaide": { 
        color: "bg-[#1e3a8a]", 
        borderColor: "border-[#1e3a8a]", 
        textColor: "text-[#1e3a8a]", 
        trophyColor: "text-[#1e3a8a]", 
        logo: "/logos/adelaide.png", 
        pointsLogo: "/logos/pts_s8_500.png" 
    },
    "adelaide 250": {
        color: "bg-[#1e3a8a]", 
        borderColor: "border-[#1e3a8a]", 
        textColor: "text-[#1e3a8a]", 
        trophyColor: "text-[#1e3a8a]", 
        logo: "/logos/adelaide.png", 
        pointsLogo: "/logos/pts_s8_250.png" 
    },
    "ao": { 
        color: "bg-[#1e3a8a]", 
        borderColor: "border-[#1e3a8a]", 
        textColor: "text-[#1e3a8a]", 
        trophyColor: "text-[#1e3a8a]", 
        logo: "/logos/ao.png", 
        pointsLogo: null 
    },
    "us": { 
        color: "bg-[#1e3a8a]", 
        borderColor: "border-[#1e3a8a]", 
        textColor: "text-[#1e3a8a]", 
        trophyColor: "text-[#1e3a8a]", 
        logo: "/logos/usopen.png", 
        pointsLogo: null
    },
    "iw": { 
        color: "bg-[#1e3a8a]", 
        borderColor: "border-[#1e3a8a]", 
        textColor: "text-[#1e3a8a]", 
        trophyColor: "text-[#1e3a8a]", 
        logo: "/logos/indianwells.png", 
        pointsLogo: "/logos/pts_indianwells.png" 
    },
    "masters": { 
        color: "bg-[#172554]", // blue-950
        borderColor: "border-[#172554]", 
        textColor: "text-[#172554]", 
        trophyColor: "text-[#172554]", 
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