// --- CONFIGURACIÓN DE DATOS ---
export const ID_2025 = '1_tDp8BrXZfmmmfyBdLIUhPk7PwwKvJ_t'; 
export const ID_DATOS_GENERALES = '1RVxm-lcNp2PWDz7HcDyXtq0bWIWA9vtw'; 
export const ID_TORNEOS = '117mHAgirc9WAaWjHAhsalx1Yp6DgQj5bv2QpVZ-nWmI'; 
export const MI_TELEFONO = "5491150568353"; 
export const TELEFONO_BASTI = "5491123965949"; 

export const tournaments = [
  { id: "adelaide", name: "Adelaide", short: "Adelaide", type: "direct" },
  { id: "adelaide_250", name: "Adelaide 250", short: "adelaide_250", type: "direct" },
  { id: "s8_500", name: "Super 8 / 500", short: "S8 500", type: "direct" },
  { id: "s8_250", name: "Super 8 / 250", short: "S8 250", type: "direct" },
  { id: "ao", name: "Australian Open", short: "AO", type: "full" }, 
  { id: "iw", name: "Indian Wells", short: "IW", type: "full" },
  { id: "mc", name: "Monte Carlo", short: "MC", type: "full" },
  { id: "rg", name: "Roland Garros", short: "RG", type: "full" },
  { id: "wimbledon", name: "Wimbledon", short: "W", type: "full" },
  { id: "us", name: "US Open", short: "US", type: "direct" },
  { id: "masters", name: "Masters", short: "Masters", type: "full" },
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
    "adelaide_250": {
        color: "bg-blue-900", 
        borderColor: "border-blue-900", 
        textColor: "text-blue-900", 
        trophyColor: "text-blue-900", 
        logo: "/logos/adelaide.png", 
        pointsLogo: "/logos/pts_s8_250.png" 
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
        pointsLogo: null 
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
// En lib/constants.ts

export const PRINT_STYLES = `
@media print {
  /* 1. LIMPIEZA TOTAL DE ELEMENTOS NO DESEADOS */
  /* Ocultamos navegación, botones, footer y elementos interactivos */
  nav, header, footer, button, .navbar, .btn, .cursor-pointer, .animate-pulse {
    display: none !important;
  }

  /* Ocultamos el bloque del título principal "La Cautiva" y su logo para arrancar directo con el Torneo */
  /* Apuntamos al contenedor específico del logo y título del home */
  .text-center.mb-8 {
     display: none !important;
  }

  /* 2. MÁRGENES DE HOJA AL MÍNIMO */
  @page {
    margin: 0.3cm; /* Márgenes muy estrechos para aprovechar toda la hoja */
    size: auto; 
  }

  /* 3. ZOOM AGRESIVO PARA QUE ENTREN MÁS ZONAS */
  body {
    zoom: 52%; /* Con esto deberían entrar cómodamente 14-16 zonas */
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    -webkit-print-color-adjust: exact;
  }

  /* 4. CONTENEDORES FULL WIDTH */
  main, .main-content, .max-w-6xl, .max-w-[95%] {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* 5. GRILLA DE ZONAS COMPACTA */
  .grid {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 5px !important; /* Espacio mínimo entre zonas */
    justify-content: center !important;
  }

  .grid > div {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    width: 49% !important; /* Dos columnas ocupando casi todo el ancho */
    margin-bottom: 5px !important; /* Mínimo margen vertical */
    border: 1px solid #000 !important;
    box-shadow: none !important;
    border-radius: 4px !important;
  }

  /* 6. ENCABEZADO DEL TORNEO (BARRA DE COLOR) */
  /* Lo hacemos mucho más fino y quitamos sus logos internos */
  .rounded-2xl.mb-8 {
     margin-bottom: 10px !important;
     padding: 4px !important;
     min-height: 0 !important;
     border-radius: 4px !important;
  }

  /* Texto del título del torneo */
  .rounded-2xl.mb-8 h2 {
     font-size: 1.8rem !important;
     margin: 0 !important;
     line-height: 1.1 !important;
  }
  
  /* Texto de la categoría */
  .rounded-2xl.mb-8 p {
     font-size: 1rem !important;
     margin: 0 !important;
  }

  /* Ocultamos los logos DENTRO de la barra del torneo para ganar altura */
  .rounded-2xl.mb-8 img, 
  .rounded-2xl.mb-8 .w-20.h-20 {
     display: none !important;
  }

  /* 7. AJUSTE FINO DE LAS TABLAS INTERNAS */
  /* Reducimos el padding de las celdas para que cada zona ocupe menos altura */
  td, th {
     padding: 2px 4px !important;
  }
}
`;