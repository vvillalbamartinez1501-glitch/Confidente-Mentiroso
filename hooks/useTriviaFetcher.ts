import { useState, useCallback } from 'react';
import { TriviaQuestion } from '../games/trivia-caotica/types';

/**
 * Fisher-Yates Shuffle Algorithm
 */
function shuffleQuestions(questions: TriviaQuestion[]): TriviaQuestion[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function useTriviaFetcher() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = useCallback(async (categoryId: string): Promise<TriviaQuestion[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/content/trivia/${categoryId}.json`);
      if (!response.ok) {
        throw new Error(`Error al descargar la categoría "${categoryId}"`);
      }
      const data: TriviaQuestion[] = await response.json();
      const shuffled = shuffleQuestions(data);
      setIsLoading(false);
      return shuffled;
    } catch (err: any) {
      console.error('Error fetching trivia category:', err);
      setError(err?.message || 'Error desconocido al cargar preguntas');
      setIsLoading(false);
      throw err;
    }
  }, []);

  return {
    fetchCategory,
    isLoading,
    error
  };
}
