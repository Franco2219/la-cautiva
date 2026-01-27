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
  /* 1. OCULTAR TODO LO QUE NO SIRVE PARA PAPEL */
  nav, header, footer, button, .navbar, .btn, .cursor-pointer, .animate-pulse {
    display: none !important;
  }

  /* 2. CONFIGURACIÓN DE LA HOJA */
  @page {
    margin: 0.5cm; 
    size: auto;
  }

  /* 3. ACHICAR TODO EL CONTENIDO (ZOOM) */
  body {
    zoom: 55%; /* Ajuste agresivo para meter 4 cuadros. Si es muy chico, prueba 60% */
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    -webkit-print-color-adjust: exact;
  }

  /* 4. CONTENEDORES FLUIDOS */
  main, .main-content, .max-w-6xl, .max-w-\[95\%\] {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* 5. DISEÑO DE LAS TABLAS (ZONAS) */
  /* Forzamos que los cuadros floten uno al lado del otro si hay espacio, o bloque compacto */
  .grid {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 10px !important;
    justify-content: flex-start !important;
  }

  /* Cada cuadro de zona */
  .grid > div {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    width: 48% !important; /* Intentar poner 2 por ancho (2x2 = 4 por hoja) */
    margin-bottom: 10px !important;
    border: 1px solid #000 !important; /* Borde negro simple para ahorrar tinta */
    box-shadow: none !important;
    border-radius: 8px !important;
  }

  /* 6. TEXTOS Y CABECERAS */
  h1, h2, h3, p {
    color: black !important; /* Texto negro puro */
  }
  
  /* Ocultar logo grande de "La Cautiva" del inicio si aparece */
  .relative.group.w-64.h-64 {
     display: none !important;
  }
  
  /* Ocultar el título gigante del club al imprimir, dejar solo el del torneo */
  h1.text-5xl.md\:text-7xl {
     display: none !important;
  }
  p.text-xl.text-slate-400 {
     display: none !important;
  }

  /* Ajustar cabecera de cada cuadro */
  .rounded-2xl.mb-8 {
     margin-bottom: 5px !important;
     padding: 5px !important;
     background: #eee !important; /* Gris claro en vez de naranja para ahorrar tinta */
     color: black !important;
  }
  
  /* Ocultar imágenes/iconos dentro de las cabeceras de zona para ahorrar espacio */
  .rounded-2xl.mb-8 img {
     display: none !important;
  }
}
`;