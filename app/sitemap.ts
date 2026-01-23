import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  // Aquí pones la URL base de tu sitio real
  const baseUrl = 'https://www.lacautivatenisypadel.com.ar'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    // Si tienes otras páginas estáticas (ej: "Torneos"), agrégalas así:
    /*
    {
      url: `${baseUrl}/torneos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    */
  ]
}