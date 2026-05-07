import driveCatalog from './constants/drive-catalog.json';

export type Category = 'flags' | 'memes' | 'movies' | 'objects' | 'geek' | 'picsum' | string;

export interface GameImage {
  id: string;
  url: string;
  category: Category;
  title: string;
}

export const DRIVE_CATEGORIES = Object.keys(driveCatalog);
export const FALLBACK_IMAGE_URL = 'https://picsum.photos/seed/fallback/1080/1350';

export async function getPicsumUrl(seed?: string): Promise<string> {
  const finalSeed = seed || Math.random().toString(36).substring(7);
  return `https://picsum.photos/seed/${finalSeed}/1080/1350`;
}

export class ImageEngine {
  
  static async getRandomImage(categories: string[]): Promise<GameImage> {
    // If no categories provided or they are empty, default to picsum
    const validCategories = (categories && categories.length > 0) ? categories : ['picsum'];
    const category = validCategories[Math.floor(Math.random() * validCategories.length)];
    
    try {
      // Check if it's a Drive category
      if (DRIVE_CATEGORIES.includes(category)) {
        return await this.getDriveImage(category);
      }

      switch (category) {
        case 'picsum':
          return {
            id: crypto.randomUUID(),
            url: await getPicsumUrl(),
            category: 'picsum',
            title: 'Foto Aleatoria'
          };
        case 'flags':
          return await this.getFlag();
        case 'memes':
          return await this.getMeme();
        case 'movies':
          return await this.getMovie();
        case 'objects':
        case 'geek':
        default:
          return await this.getUnsplash(category as any);
      }
    } catch (error) {
      console.warn(`⚠️ Fallo al cargar categoría "${category}":`, error);
      return this.getFallbackImage('picsum');
    }
  }

  private static async getDriveImage(categoryName: string): Promise<GameImage> {
    const images = (driveCatalog as any)[categoryName];
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      console.warn(`⚠️ Catálogo de Drive para "${categoryName}" está vacío o no existe.`);
      throw new Error(`Category ${categoryName} empty`);
    }

    const random = images[Math.floor(Math.random() * images.length)];
    
    if (!random || !random.url) {
      console.warn(`⚠️ Imagen no válida encontrada en categoría Drive "${categoryName}".`);
      throw new Error('Invalid image data');
    }

    return {
      id: random.id,
      url: random.url,
      category: categoryName,
      title: random.name || 'Imagen de Drive'
    };
  }

  private static async getFlag(): Promise<GameImage> {
    try {
      const res = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,cca3');
      if (!res.ok) throw new Error('Countries API failed');
      const data = await res.json();
      const randomCountry = data[Math.floor(Math.random() * data.length)];
      return {
        id: randomCountry.cca3,
        url: randomCountry.flags.png,
        category: 'flags',
        title: randomCountry.name.common
      };
    } catch (e) {
      console.warn('⚠️ Error en API de banderas, usando fallback.');
      throw e;
    }
  }

  private static async getMeme(): Promise<GameImage> {
    const fallbackMemes = [
      { id: '1', url: 'https://media.giphy.com/media/3o7aD2saalEvTe2y9i/giphy.gif', title: 'Meme 1' },
      { id: '2', url: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', title: 'Meme 2' },
      { id: '3', url: 'https://media.giphy.com/media/l41YtZOb9EUABnuqA/giphy.gif', title: 'Meme 3' },
    ];
    const item = fallbackMemes[Math.floor(Math.random() * fallbackMemes.length)];
    return { ...item, category: 'memes' };
  }

  private static async getMovie(): Promise<GameImage> {
    const fallbackMovies = [
      { id: '1', url: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dENH1.jpg', title: 'Movie 1' },
      { id: '2', url: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg', title: 'Movie 2' },
    ];
    const item = fallbackMovies[Math.floor(Math.random() * fallbackMovies.length)];
    return { ...item, category: 'movies' };
  }

  private static async getUnsplash(category: Category): Promise<GameImage> {
    const randomId = Math.floor(Math.random() * 1000);
    return {
      id: `img_${randomId}`,
      url: `https://picsum.photos/seed/${randomId}/1080/1350`,
      category: category,
      title: `${category} image`
    };
  }

  public static getFallbackImage(category: Category): GameImage {
    return {
      id: 'fallback',
      url: FALLBACK_IMAGE_URL,
      category: category,
      title: 'Imagen de Respaldo'
    };
  }
}
