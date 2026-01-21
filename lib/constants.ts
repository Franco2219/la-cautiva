import { Trophy, Calendar, Star, MapPin } from "lucide-react";

export const ID_DATOS_GENERALES = "1RVxm-lcNp2PWDz7HcDyXtq0bWIWA9vtw"; 
export const ID_TORNEOS = "117mHAgirc9WAaWjHAhsalx1Yp6DgQj5bv2QpVZ-nWmI"; 
export const ID_2025 = "1_tDp8BrXZfmmmfyBdLIUhPk7PwwKvJ_t"; 

export const MI_TELEFONO = "5491150568353"; 
export const TELEFONO_BASTI = "5491123965949"; 

// --- LISTA DE TORNEOS ---
// La propiedad 'short' es la CLAVE. Tiene que ser idéntica (letra por letra) a la de abajo.
export const tournaments = [
  { id: "adelaide", name: "Adelaide", short: "Adelaide", type: "direct" },
  { id: "adelaide_250", name: "Adelaide 250", short: "Adelaide 250", type: "direct" },
  { id: "s8_500", name: "Super 8 / 500", short: "S8 500", type: "direct" },
  { id: "s8_250", name: "Super 8 / 250", short: "S8 250", type: "direct" },
  { id: "ao", name: "Australian Open", short: "AO", type: "full" }, 
  { id: "iw", name: "Indian Wells", short: "IW", type: "full" },
  { id: "mc", name: "Monte Carlo", short: "MC", type: "full" },
  { id: "rg", name: "Roland Garros", short: "RG", type: "full" },
  { id: "wimbledon", name: "Wimbledon", short: "Wimbledon", type: "full" }, // Corregido: "Wimbledon" en lugar de "W"
  { id: "us", name: "US Open", short: "US", type: "direct" },
  { id: "masters", name: "Masters", short: "Masters", type: "full" },
];

// --- CONFIGURACIÓN DE ESTILOS Y LOGOS POR TORNEO ---
// Las claves aquí coinciden EXACTAMENTE con los 'short' de arriba.
export const TOURNAMENT_STYLES: any = {
    // SUPERFICIE DURA (AZUL)
    "Adelaide": { 
        color: "bg-[#1e3a8a]", // Azul oscuro
        borderColor: "border-[#1e3a8a]", 
        textColor: "text-[#1e3a8a]", 
        trophyColor: "text-[#1e3a8a]", 
        logo: "/logos/adelaide.png", 
        pointsLogo: "/logos/pts_s8_500.png" 
    },
    "Adelaide 250": {
        color: "bg-[#1e3a8a]", 
        borderColor: "border-[#1e3a8a]", 
        textColor: "text-[#1e3a8a]", 
        trophyColor: "text-[#1e3a8a]", 
        logo: "/logos/adelaide.png", 
        pointsLogo: "/logos/pts_s8_250.png" 
    },
    "AO": { 
        color: "bg-[#0091d2]", // Azul AO característico
        borderColor: "border-[#0091d2]", 
        textColor: "text-[#0091d2]", 
        trophyColor: "text-[#0091d2]", 
        logo: "/logos/ao.png", 
        pointsLogo: null 
    },
    "US": { 
        color: "bg-[#003369]", // Azul oscuro US Open
        borderColor: "border-[#003369]", 
        textColor: "text-[#003369]", 
        trophyColor: "text-[#003369]", 
        logo: "/logos/usopen.png", 
        pointsLogo: null
    },
    "IW": { 
        color: "bg-[#00572e]", // Verde Indian Wells 
        borderColor: "border-[#00572e]", 
        textColor: "text-[#00572e]", 
        trophyColor: "text-[#00572e]", 
        logo: "/logos/indianwells.png", 
        pointsLogo: "/logos/pts_indianwells.png" 
    },
    "Masters": { 
        color: "bg-[#002865]", // Azul Masters
        borderColor: "border-[#002865]", 
        textColor: "text-[#002865]", 
        trophyColor: "text-[#002865]", 
        logo: "/logos/masters.png", 
        pointsLogo: null
    },
    
    // CÉSPED (VERDE)
    "Wimbledon": { 
      color: "bg-[#00572e]", // Verde Wimbledon
      borderColor: "border-[#00572e]", 
      textColor: "text-[#00572e]", 
      trophyColor: "text-[#00572e]", 
      logo: "/logos/wimbledon.png", 
      pointsLogo: null 
    },

    // POLVO DE LADRILLO (NARANJA)
    "RG": { 
        color: "bg-[#b35a38]", // Naranja ladrillo
        borderColor: "border-[#b35a38]", 
        textColor: "text-[#b35a38]", 
        trophyColor: "text-[#b35a38]", 
        logo: "/logos/rg.svg", 
        pointsLogo: null 
    },
    "MC": { 
        color: "bg-[#b35a38]", 
        borderColor: "border-[#b35a38]", 
        textColor: "text-[#b35a38]", 
        trophyColor: "text-[#b35a38]", 
        logo: "/logos/mc.png", 
        pointsLogo: "/logos/pts_mc.png" 
    },
    "S8 500": { 
        color: "bg-[#e10600]", // Rojo intenso
        borderColor: "border-[#e10600]", 
        textColor: "text-[#e10600]", 
        trophyColor: "text-[#e10600]", 
        logo: "/logos/s8_500.png", 
        pointsLogo: "/logos/pts_s8_500.png" 
    },
    "S8 250": { 
        color: "bg-[#0091d2]", // Azul claro
        borderColor: "border-[#0091d2]", 
        textColor: "text-[#0091d2]", 
        trophyColor: "text-[#0091d2]", 
        logo: "/logos/s8_250.png", 
        pointsLogo: "/logos/pts_s8_250.png" 
    },
    
    // FALLBACK (Por si algo falla, usa este)
    "default": { 
        color: "bg-[#b35a38]", 
        borderColor: "border-[#b35a38]", 
        textColor: "text-[#b35a38]", 
        trophyColor: "text-[#b35a38]", 
        logo: "/logo.png", 
        pointsLogo: null 
    }
};