// --- CONFIGURACIÓN DE DATOS ---
export const ID_2025 = '1_tDp8BrXZfmmmfyBdLIUhPk7PwwKvJ_t'; 
export const ID_DATOS_GENERALES = '1RVxm-lcNp2PWDz7HcDyXtq0bWIWA9vtw'; 
export const ID_SORTEO_TEMPORAL = '1xMFa1oCUKPK6fEPt1Skge4Tmz6IMGykL';
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
  /* 1. OCULTAR NAVEGACIÓN Y ELEMENTOS DE INTERFAZ */
  nav, header, footer, button, .navbar, .btn, .cursor-pointer, .animate-pulse {
    display: none !important;
  }

  /* 2. OCULTAR SOLO EL LOGO Y TÍTULO DE "LA CAUTIVA" (EL DE ARRIBA DE TODO) */
  /* Ocultamos el contenedor del logo principal */
  .relative.group.w-64.h-64 {
     display: none !important;
  }
  /* Ocultamos el texto "La Cautiva" y "Club de Tenis" */
  h1.text-5xl.md\\:text-7xl, 
  p.text-xl.text-slate-400 {
     display: none !important;
  }

  /* 3. CONFIGURACIÓN DE LA HOJA Y ZOOM (AQUÍ ESTÁ EL CAMBIO) */
  @page {
    margin: 0.5cm; /* Margen moderado */
    size: auto; 
  }

  body {
    zoom: 60%; /* <--- ZOOM IDEAL: Grande pero permite varios grupos por hoja */
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    -webkit-print-color-adjust: exact; /* Para que salga el color de fondo del header */
  }

  /* 4. CONTENEDORES AL 100% */
  main, .main-content, .max-w-6xl, .max-w-[95%] {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* 5. HEADER DEL TORNEO (WIMBLEDON...) - VISIBLE Y AJUSTADO */
  /* Nos aseguramos que la barra de color del torneo SE VEA */
  .rounded-2xl.mb-8 {
     display: flex !important;
     margin-bottom: 15px !important;
     padding: 10px !important;
     break-inside: avoid !important;
  }
  
  /* Opcional: Si quieres ganar un poco de altura, ocultamos los logos DENTRO de la barra del torneo */
  /* Si prefieres que se vean, borra estas 3 líneas de abajo */
  .rounded-2xl.mb-8 img, 
  .rounded-2xl.mb-8 .w-20.h-20 {
     display: none !important;
  }

  /* 6. GRILLA DE ZONAS */
  .grid {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 10px !important;
    justify-content: center !important;
  }

  .grid > div {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    width: 48% !important; /* 2 columnas */
    margin-bottom: 10px !important;
    border: 1px solid #333 !important;
    box-shadow: none !important;
    border-radius: 6px !important;
  }
  
  /* Ajuste de celdas para que no sean tan altas innecesariamente */
  td, th {
     padding: 4px 6px !important;
  }
}
`;