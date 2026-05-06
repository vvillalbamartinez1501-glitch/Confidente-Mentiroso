export type Category = 'flags' | 'memes' | 'movies' | 'objects' | 'geek' | 'picsum';

export interface GameImage {
  id: string;
  url: string;
  category: Category;
  title: string;
}

export async function getPicsumUrl(): Promise<string> {
  return `https://picsum.photos/seed/${Math.random()}/1080/1350`;
}

// Estructura modular para que Antigravity la entienda
export const CATEGORIES = {
  // ... existing code
};

export class ImageEngine {
  
  static async getRandomImage(categories: Category[]): Promise<GameImage> {
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    try {
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
          return await this.getUnsplash(category);
      }
    } catch (error) {
      console.error(`Error fetching from ${category}, falling back...`, error);
      return this.getFallbackImage(category);
    }
  }
// ... rest of the file

  private static async getFlag(): Promise<GameImage> {
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,cca3');
    const data = await res.json();
    const randomCountry = data[Math.floor(Math.random() * data.length)];
    return {
      id: randomCountry.cca3,
      url: randomCountry.flags.png,
      category: 'flags',
      title: randomCountry.name.common
    };
  }

  private static async getMeme(): Promise<GameImage> {
    // In a real app, use Giphy API with process.env.NEXT_PUBLIC_GIPHY_API_KEY
    // Using a curated fallback list of memes for demonstration
    const fallbackMemes = [
      { id: '1', url: 'https://media.giphy.com/media/3o7aD2saalEvTe2y9i/giphy.gif', title: 'Meme 1' },
      { id: '2', url: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', title: 'Meme 2' },
      { id: '3', url: 'https://media.giphy.com/media/l41YtZOb9EUABnuqA/giphy.gif', title: 'Meme 3' },
    ];
    const item = fallbackMemes[Math.floor(Math.random() * fallbackMemes.length)];
    return { ...item, category: 'memes' };
  }

  private static async getMovie(): Promise<GameImage> {
    // In a real app, use TMDB API
    // Using TMDB image domain with some hardcoded popular posters if no API
    const fallbackMovies = [
      { id: '1', url: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dENH1.jpg', title: 'Movie 1' },
      { id: '2', url: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg', title: 'Movie 2' },
    ];
    const item = fallbackMovies[Math.floor(Math.random() * fallbackMovies.length)];
    return { ...item, category: 'movies' };
  }

  private static async getUnsplash(category: Category): Promise<GameImage> {
    // Unsplash/Pixabay simulation
    // Unsplash Source API was deprecated, using Picsum for mock images
    const randomId = Math.floor(Math.random() * 1000);
    return {
      id: `img_${randomId}`,
      url: `https://picsum.photos/seed/${randomId}/800/600`,
      category: category,
      title: `${category} image`
    };
  }

  private static getFallbackImage(category: Category): GameImage {
    return {
      id: 'fallback',
      url: 'https://picsum.photos/800/600',
      category: category,
      title: 'Imagen de Respaldo'
    };
  }
}
