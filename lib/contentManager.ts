import { ImageEngine, Category as ImageCategory } from './imageLoader';
import { WORD_CATEGORIES, WordCategory } from '../constants/words';
import { GameSecret } from './types';

export class ContentManager {
  static async getWordSecret(category: WordCategory): Promise<GameSecret> {
    const list = WORD_CATEGORIES[category].items;
    const word = list[Math.floor(Math.random() * list.length)];
    return {
      type: 'text',
      content: word,
      category: WORD_CATEGORIES[category].name
    };
  }

  static async getImageSecret(categories: ImageCategory[]): Promise<GameSecret> {
    const img = await ImageEngine.getRandomImage(categories);
    return {
      type: 'image',
      content: img
    };
  }

  static async getRandomSecret(mode: 'WORDS' | 'IMAGES', categories: string[]): Promise<GameSecret> {
    if (mode === 'WORDS') {
      const cat = categories[Math.floor(Math.random() * categories.length)] as WordCategory;
      return this.getWordSecret(cat);
    } else {
      return this.getImageSecret(categories as ImageCategory[]);
    }
  }
}
