import React from 'react';

export default function SponsorsBanner() {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full max-w-[850px] mx-auto p-4 box-border font-sans">
      
      {/* --- BANNER FIANCOR --- */}
      <div className="flex-1 bg-white rounded-lg p-4 pr-[140px] relative flex flex-col justify-center min-h-[110px] border-2 border-[#F37021] items-start shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        
        {/* Botón de Cotización */}
        <div className="absolute top-5 right-4">
          <a 
            href="https://fiancor.com.ar/nuevaweb/pagina-de-calculos/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#F37021] text-white px-4 py-2 rounded-full font-semibold text-sm no-underline transition-all duration-200 hover:scale-105 hover:shadow-md inline-block"
          >
            Cotizá ahora <span className="font-black">acá!</span>
          </a>
        </div>

        {/* Logo Fiancor */}
        <img 
          src="logofiancor.png" 
          alt="Logo FIANCOR" 
          className="max-w-[80%] max-h-[85px] object-contain"
        />
        
        {/* Redes Sociales Fiancor */}
        <div className="absolute bottom-3 right-4 flex gap-3">
          <a href="https://www.instagram.com/fiancorgarantias?igsh=MWo0d2t5Y2RoaXExYQ%3D%3D" target="_blank" rel="noopener noreferrer" className="text-gray-400 text-lg transition-all duration-200 hover:scale-110 hover:text-[#F37021]" title="Instagram">
            <i className="fa-brands fa-instagram"></i>
          </a>
          <a href="https://www.facebook.com/profile.php?id=100090528423369" target="_blank" rel="noopener noreferrer" className="text-gray-400 text-lg transition-all duration-200 hover:scale-110 hover:text-[#F37021]" title="Facebook">
            <i className="fa-brands fa-facebook"></i>
          </a>
          <a href="https://api.whatsapp.com/send/?phone=5491133344799&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" className="text-gray-400 text-lg transition-all duration-200 hover:scale-110 hover:text-[#F37021]" title="WhatsApp">
            <i className="fa-brands fa-whatsapp"></i>
          </a>
        </div>
      </div>

      {/* --- BANNER VITALE --- */}
      <div className="flex-1 bg-white rounded-lg p-4 pr-[140px] relative flex flex-col justify-center min-h-[110px] border-2 border-[#2B4E8C] items-start shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        
        {/* Lista de Servicios */}
        <ul className="absolute top-4 right-4 text-right list-none m-0 p-0 text-[#2B4E8C] font-['Montserrat',sans-serif] font-extrabold text-sm leading-[2.2]">
          <li>Venta de Propiedades</li>
          <li>Alquileres</li>
          <li>Tasaciones</li>
        </ul>

        {/* Logo Vitale */}
        <img 
          src="logovitale.png" 
          alt="Logo Vitale Negocios Inmobiliarios" 
          className="max-w-[80%] max-h-[85px] object-contain mb-2"
        />
        
        {/* Dirección Vitale */}
        <div className="text-[#2B4E8C] font-['Montserrat',sans-serif] text-[13px] font-extrabold text-left mb-1">
        Gaucho Cruz 5476 – Villa Bosch
        </div>

        {/* Redes Sociales Vitale */}
        <div className="absolute bottom-3 right-4 flex gap-3">
          <a href="https://www.instagram.com/inmobiliariavitale/" target="_blank" rel="noopener noreferrer" className="text-gray-400 text-lg transition-all duration-200 hover:scale-110 hover:text-[#2B4E8C]" title="Instagram">
            <i className="fa-brands fa-instagram"></i>
          </a>
          <a href="https://www.facebook.com/GuillermoHVitaleNegociosInmobiliarios" target="_blank" rel="noopener noreferrer" className="text-gray-400 text-lg transition-all duration-200 hover:scale-110 hover:text-[#2B4E8C]" title="Facebook">
            <i className="fa-brands fa-facebook"></i>
          </a>
          <a href="https://www.vitaleinmobiliaria.com.ar/" target="_blank" rel="noopener noreferrer" className="text-gray-400 text-lg transition-all duration-200 hover:scale-110 hover:text-[#2B4E8C]" title="Sitio Web">
            <i className="fa-solid fa-globe"></i>
          </a>
        </div>
      </div>

    </div>
  );
}