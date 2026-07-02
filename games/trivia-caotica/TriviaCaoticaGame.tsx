'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Timer, Check, X, Flame, EyeOff, Eye, 
  Trophy, User, Sparkles, Play, ArrowLeft, AlertCircle, 
  Dices, RotateCcw, Award, CheckCircle2, XCircle
} from 'lucide-react';
import { Player, ScoringMode } from '../../lib/types';
import { supabase, PLAYERS_TABLE } from '../../lib/supabase';
import { TriviaQuestion, ChaosModifier, TriviaPhase, PlayerAnswer } from './types';
import { TRIVIA_CATEGORIES, CHAOS_MODIFIERS } from './constants';
import { useTriviaFetcher } from '../../hooks/useTriviaFetcher';

interface TriviaCaoticaGameProps {
  isOnline: boolean;
  isHost: boolean;
  players: Player[];
  playerId: string | null;
  gameState: any; // from supabase room game_state
  onUpdateGameState: (updates: any) => void;
  onUpdatePlayers: (players: Player[]) => void;
  onBackToMenu: () => void;
  scoringMode: ScoringMode;
}

export default function TriviaCaoticaGame({
  isOnline,
  isHost,
  players,
  playerId,
  gameState: onlineGameState,
  onUpdateGameState,
  onUpdatePlayers,
  onBackToMenu,
  scoringMode
}: TriviaCaoticaGameProps) {
  
  const { fetchCategory, isLoading: isFetching } = useTriviaFetcher();

  // Local authority states (only relevant/writeable by Host or in Local Mode)
  const [localQuestions, setLocalQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [categorySelected, setCategorySelected] = useState<string | null>(null);

  // States synchronized between players (either updated locally or synced from onlineGameState)
  const [phase, setPhase] = useState<TriviaPhase>('CATEGORY_SELECT');
  const [currentQuestion, setCurrentQuestion] = useState<Omit<TriviaQuestion, 'correct_answer'> | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [currentModifier, setCurrentModifier] = useState<ChaosModifier | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [playerAnswers, setPlayerAnswers] = useState<Record<string, string>>({});
  const [rolledModifierId, setRolledModifierId] = useState<string | null>(null);

  // Guest inputs
  const [myAnswer, setMyAnswer] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [inputAnswerText, setInputAnswerText] = useState<string>('');

  // Modifier visual state
  const [visualModifierIndex, setVisualModifierIndex] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [revealedBlindOptions, setRevealedBlindOptions] = useState<Record<string, boolean>>({});

  // References
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to verify if we are playing local or as host
  const isAuthority = !isOnline || isHost;

  // -------------------------------------------------------------
  // ONLINE SYNC: Read updates from onlineGameState (For Guests & Host)
  // -------------------------------------------------------------
  useEffect(() => {
    if (isOnline && onlineGameState) {
      if (onlineGameState.phase) setPhase(onlineGameState.phase);
      if (onlineGameState.currentQuestionIndex !== undefined) setCurrentQuestionIndex(onlineGameState.currentQuestionIndex);
      if (onlineGameState.categorySelected !== undefined) setCategorySelected(onlineGameState.categorySelected);
      if (onlineGameState.currentQuestion !== undefined) setCurrentQuestion(onlineGameState.currentQuestion);
      if (onlineGameState.correctAnswer !== undefined) setCorrectAnswer(onlineGameState.correctAnswer);
      if (onlineGameState.currentModifier !== undefined) setCurrentModifier(onlineGameState.currentModifier);
      if (onlineGameState.timeLeft !== undefined) setTimeLeft(onlineGameState.timeLeft);
      if (onlineGameState.playerAnswers !== undefined) setPlayerAnswers(onlineGameState.playerAnswers);
      if (onlineGameState.rolledModifierId !== undefined) setRolledModifierId(onlineGameState.rolledModifierId);
    }
  }, [isOnline, onlineGameState]);

  // Reset my personal answer state when the question phase resets
  useEffect(() => {
    if (phase === 'CHAOS_ROLL' || phase === 'CATEGORY_SELECT') {
      setMyAnswer('');
      setHasSubmitted(false);
      setInputAnswerText('');
      setRevealedBlindOptions({});
    }
  }, [phase]);

  // -------------------------------------------------------------
  // SPINNING WHEEL ANIMATION (Chaos Roll)
  // -------------------------------------------------------------
  useEffect(() => {
    if (phase === 'CHAOS_ROLL' && rolledModifierId) {
      setIsSpinning(true);
      let count = 0;
      const totalTicks = 20;
      let delay = 60;

      const runSpin = () => {
        setVisualModifierIndex(prev => (prev + 1) % CHAOS_MODIFIERS.length);
        count++;

        if (count < totalTicks) {
          delay += 10;
          setTimeout(runSpin, delay);
        } else {
          // Find the index of the rolledModifierId
          const finalIndex = CHAOS_MODIFIERS.findIndex(m => m.id === rolledModifierId);
          if (finalIndex !== -1) {
            setVisualModifierIndex(finalIndex);
          }
          setIsSpinning(false);

          // Spin completed! Host or Local player can now advance manually
        }
      };

      setTimeout(runSpin, delay);
    }
  }, [phase, rolledModifierId]);

  // -------------------------------------------------------------
  // HOST AUTHORITY TIMER LOOP
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isAuthority) return;

    if (phase === 'READING_QUESTION' || phase === 'ANSWERING') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const nextVal = prev - 1;
          
          if (nextVal <= 0) {
            clearInterval(timerRef.current!);
            handleTimeExpired();
            return 0;
          }

          // Propagate timer to Supabase
          pushState({ timeLeft: nextVal });
          return nextVal;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, isAuthority, localQuestions, currentQuestionIndex, currentModifier]);

  // Check if everyone has submitted their answers to auto-advance
  useEffect(() => {
    if (!isAuthority || phase !== 'ANSWERING') return;

    const activePlayers = players.filter(p => !p.isManualSpectator && !p.isEliminated);
    if (activePlayers.length === 0) return;

    let submittedCount = 0;
    if (isOnline) {
      // Check player status in Supabase
      submittedCount = activePlayers.filter(p => p.status?.startsWith('answer:')).length;
    } else {
      // Check local answers
      submittedCount = Object.keys(playerAnswers).length;
    }

    if (submittedCount >= activePlayers.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      handleTimeExpired();
    }
  }, [players, playerAnswers, phase, isAuthority]);

  // -------------------------------------------------------------
  // GAME FLOW ACTIONS (Host / Local Authority Only)
  // -------------------------------------------------------------
  const pushState = (updates: any) => {
    if (isOnline && isHost) {
      onUpdateGameState(updates);
    }
  };

  const handleStartGame = async (categoryId: string) => {
    try {
      const questions = await fetchCategory(categoryId);
      if (questions.length === 0) {
        alert('Esta categoría no tiene preguntas.');
        return;
      }

      setLocalQuestions(questions);
      setCurrentQuestionIndex(0);
      setCategorySelected(categoryId);
      setPlayerAnswers({});

      // Choose Chaos modifier for the first round
      const selectedModifier = CHAOS_MODIFIERS[Math.floor(Math.random() * CHAOS_MODIFIERS.length)];
      
      setRolledModifierId(selectedModifier.id);
      setPhase('CHAOS_ROLL');

      if (isOnline) {
        // Reset player status first
        for (const p of players) {
          await supabase.from(PLAYERS_TABLE).update({ status: 'online' }).eq('id', p.id);
        }
      }

      pushState({
        phase: 'CHAOS_ROLL',
        currentQuestionIndex: 0,
        categorySelected: categoryId,
        rolledModifierId: selectedModifier.id,
        playerAnswers: {},
        correctAnswer: ''
      });

    } catch (err) {
      alert('Error al inicializar el juego. Por favor intenta de nuevo.');
    }
  };

  const handleStartTriviaRound = () => {
    if (!isAuthority || !rolledModifierId) return;

    const activeQuestion = localQuestions[currentQuestionIndex];
    const modifier = CHAOS_MODIFIERS.find(m => m.id === rolledModifierId)!;

    // Strip correct answer for Guests
    const strippedQuestion: Omit<TriviaQuestion, 'correct_answer'> = {
      id: activeQuestion.id,
      text: activeQuestion.text,
      type: activeQuestion.type,
      options: activeQuestion.options,
      mediaUrl: activeQuestion.mediaUrl
    };

    const nextPhase: TriviaPhase = 'READING_QUESTION';
    setCurrentQuestion(strippedQuestion);
    setCurrentModifier(modifier);
    setTimeLeft(4); // 4 seconds to read

    setPhase(nextPhase);
    pushState({
      phase: nextPhase,
      currentQuestion: strippedQuestion,
      currentModifier: modifier,
      timeLeft: 4,
      correctAnswer: '' // clear correct answer
    });
  };

  const handleTimeExpired = async () => {
    if (!isAuthority) return;

    const activeQuestion = localQuestions[currentQuestionIndex];
    
    // Compile answers
    const answersMap: Record<string, string> = {};
    if (isOnline) {
      players.forEach(p => {
        if (p.status?.startsWith('answer:')) {
          answersMap[p.id] = p.status.substring(7);
        } else {
          answersMap[p.id] = ''; // No answer
        }
      });
    } else {
      // Local answers are already populated in playerAnswers
      players.forEach(p => {
        answersMap[p.id] = playerAnswers[p.id] || '';
      });
    }

    setCorrectAnswer(activeQuestion.correct_answer);
    setPlayerAnswers(answersMap);
    setPhase('REVEALING_ANSWER');

    pushState({
      phase: 'REVEALING_ANSWER',
      correctAnswer: activeQuestion.correct_answer,
      playerAnswers: answersMap,
      timeLeft: 0
    });
  };

  const handleTransitionToScoreUpdate = () => {
    if (!isAuthority) return;

    // Calculate score updates based on scoringMode
    const activeQuestion = localQuestions[currentQuestionIndex];
    const isPointsDoubled = currentModifier?.effectType === 'points_doubled';
    const scoreGain = isPointsDoubled ? 20 : 10;

    const updatedPlayers = players.map(p => {
      if (p.isManualSpectator || p.isEliminated) return p;

      const playerAns = playerAnswers[p.id] || '';
      const isCorrect = verifyAnswer(playerAns, activeQuestion.correct_answer, activeQuestion.type);

      if (scoringMode === 'MUERTE') {
        if (!isCorrect) {
          const newHp = Math.max(0, p.hp - 1);
          return {
            ...p,
            hp: newHp,
            isEliminated: newHp === 0
          };
        }
        return p;
      } else {
        // ORIGINAL or MANSALVA
        if (isCorrect) {
          return {
            ...p,
            score: p.score + scoreGain
          };
        }
        return p;
      }
    });

    onUpdatePlayers(updatedPlayers);
    setPhase('SCORE_UPDATE');
    pushState({ phase: 'SCORE_UPDATE' });

    // Sync database scores if online
    if (isOnline && isHost) {
      updatedPlayers.forEach(async (p) => {
        await supabase
          .from(PLAYERS_TABLE)
          .update({ score: p.score, hp: p.hp })
          .eq('id', p.id);
      });
    }
  };

  const handleNextRound = async () => {
    if (!isAuthority) return;

    // Check if game is over
    const alivePlayers = players.filter(p => !p.isEliminated && !p.isManualSpectator);
    const hasMoreQuestions = currentQuestionIndex + 1 < localQuestions.length;
    const isMuerteGameOver = scoringMode === 'MUERTE' && alivePlayers.length < 2;

    if (!hasMoreQuestions || isMuerteGameOver) {
      setPhase('CATEGORY_SELECT');
      pushState({ phase: 'CATEGORY_SELECT', categorySelected: null });
      return;
    }

    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    setPlayerAnswers({});
    
    // Select new modifier
    const selectedModifier = CHAOS_MODIFIERS[Math.floor(Math.random() * CHAOS_MODIFIERS.length)];
    
    setRolledModifierId(selectedModifier.id);
    setPhase('CHAOS_ROLL');

    if (isOnline && isHost) {
      // Reset player statuses in Supabase
      for (const p of players) {
        await supabase.from(PLAYERS_TABLE).update({ status: 'online' }).eq('id', p.id);
      }
    }

    pushState({
      phase: 'CHAOS_ROLL',
      currentQuestionIndex: nextIndex,
      rolledModifierId: selectedModifier.id,
      playerAnswers: {},
      correctAnswer: ''
    });
  };

  // -------------------------------------------------------------
  // CLIENT ACTIONS (Guests and Host inputting answers)
  // -------------------------------------------------------------
  const handleSelectAnswer = async (ans: string) => {
    if (hasSubmitted || phase !== 'ANSWERING') return;

    setMyAnswer(ans);
    setHasSubmitted(true);

    if (isOnline) {
      // Write to Supabase status
      await supabase
        .from(PLAYERS_TABLE)
        .update({ status: `answer:${ans}` })
        .eq('id', playerId);
    } else {
      // Local mode: Host saves directly
      const activePlayerId = playerId || players[0]?.id; // Fallback
      if (activePlayerId) {
        setPlayerAnswers(prev => ({
          ...prev,
          [activePlayerId]: ans
        }));
      }
    }
  };

  const handleInputSubmit = () => {
    if (!inputAnswerText.trim()) return;
    handleSelectAnswer(inputAnswerText.trim());
  };

  const verifyAnswer = (playerAns: string, correctAns: string, type: string): boolean => {
    if (!playerAns) return false;
    
    if (type === 'input') {
      const cleanPlayer = playerAns.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const cleanCorrect = correctAns.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return cleanPlayer === cleanCorrect;
    }
    
    return playerAns === correctAns;
  };

  // Timer values based on modifiers
  const handleStartTimerForAnswering = () => {
    if (!isAuthority) return;
    const maxTime = currentModifier?.effectType === 'time_halved' ? 5 : 10;
    setTimeLeft(maxTime);
    pushState({ phase: 'ANSWERING', timeLeft: maxTime });
    setPhase('ANSWERING');
  };

  // -------------------------------------------------------------
  // RENDERING COMPONENTS
  // -------------------------------------------------------------

  // Category selection layout
  const renderCategorySelect = () => {
    return (
      <div className="w-full max-w-2xl flex flex-col gap-6 relative z-10 p-6 rounded-3xl bg-gray-900/60 border border-white/10 backdrop-blur-xl">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 mb-4 animate-pulse">
            <Brain className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 uppercase tracking-tight">Trivia Caótica</h2>
          <p className="text-gray-400 text-sm mt-1">Selecciona una categoría para desatar el caos de preguntas</p>
        </div>

        {isFetching ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Cargando preguntas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
            {TRIVIA_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => isAuthority && handleStartGame(cat.id)}
                disabled={!isAuthority}
                className={`group flex flex-col items-center gap-4 p-6 bg-gradient-to-br ${cat.color} rounded-[2rem] border border-white/10 hover:scale-[1.05] transition-all duration-300 shadow-xl ${
                  !isAuthority ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-sm font-bold uppercase tracking-widest text-white">{cat.name}</span>
              </button>
            ))}
          </div>
        )}

        {!isAuthority && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider animate-pulse">
            Esperando a que el Host seleccione una categoría...
          </div>
        )}

        <button
          onClick={onBackToMenu}
          className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-gray-400 hover:text-white font-bold uppercase tracking-widest text-xs transition-all"
        >
          Volver al Menú
        </button>
      </div>
    );
  };

  // Chaos modifier slot-machine roll layout
  const renderChaosRoll = () => {
    const activeMod = CHAOS_MODIFIERS[visualModifierIndex];
    return (
      <div className="w-full max-w-md flex flex-col gap-6 relative z-10 p-8 rounded-3xl bg-gray-900/60 border border-white/10 backdrop-blur-xl text-center">
        <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-2 animate-bounce">
          SELECCIONANDO MODIFICADOR
        </div>

        <div className="h-44 flex items-center justify-center border-y-2 border-dashed border-white/10 py-6 relative overflow-hidden bg-black/40 rounded-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMod.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex flex-col items-center gap-2 px-4"
            >
              <div className="text-5xl mb-2">{activeMod.name.split(' ')[0]}</div>
              <h3 className="text-2xl font-black uppercase text-white tracking-tight">{activeMod.name.slice(activeMod.name.indexOf(' ') + 1)}</h3>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 min-h-[80px] flex items-center justify-center">
          {!isSpinning ? (
            <p className="text-gray-300 text-xs font-medium leading-relaxed">{activeMod.description}</p>
          ) : (
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-wider animate-pulse">Girando la Ruleta del Caos...</p>
          )}
        </div>

        {!isSpinning && (
          <div className="mt-4">
            {isAuthority ? (
              <button
                onClick={handleStartTriviaRound}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-white text-white" />
                Comenzar Pregunta
              </button>
            ) : (
              <div className="py-3 px-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider text-[10px] rounded-2xl animate-pulse">
                Esperando a que el Host inicie la pregunta...
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Reading question phase layout
  const renderReadingQuestion = () => {
    return (
      <div className="w-full max-w-xl flex flex-col gap-8 relative z-10 p-8 rounded-3xl bg-gray-900/60 border border-white/10 backdrop-blur-xl text-center">
        <div className="flex justify-between items-center px-2">
          <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
            Pregunta {currentQuestionIndex + 1}
          </span>
          {currentModifier && (
            <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 uppercase tracking-widest">
              {currentModifier.name}
            </span>
          )}
        </div>

        <div className="py-8">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-4">Prepárate para responder...</p>
          <h2 className="text-3xl font-black text-white leading-tight uppercase tracking-tight">{currentQuestion?.text}</h2>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 flex items-center justify-center animate-spin">
            <span className="text-lg font-black text-emerald-400 select-none animate-none" style={{ transform: 'rotate(0deg)' }}>{timeLeft}</span>
          </div>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-2">La trivia comienza en breve</span>
        </div>

        {isAuthority && timeLeft <= 0 && (
          <button
            onClick={handleStartTimerForAnswering}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 rounded-2xl font-black uppercase text-xs tracking-widest text-white shadow-lg transition-all"
          >
            Comenzar Respuestas
          </button>
        )}
      </div>
    );
  };

  // Answering phase layout
  const renderAnswering = () => {
    const isBlind = currentModifier?.effectType === 'blind_mode';
    const isInputType = currentQuestion?.type === 'input';
    const isBooleanType = currentQuestion?.type === 'boolean';

    return (
      <div className="w-full max-w-xl flex flex-col gap-6 relative z-10 p-8 rounded-[2.5rem] bg-gray-900/60 border border-white/10 backdrop-blur-xl">
        {/* Header HUD */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 bg-black/30 border border-white/10 px-4 py-1.5 rounded-full">
            <Timer className={`w-4 h-4 ${timeLeft <= 3 ? 'text-rose-500 animate-ping' : 'text-emerald-400'}`} />
            <span className={`text-sm font-black ${timeLeft <= 3 ? 'text-rose-500 font-extrabold' : 'text-white'}`}>{timeLeft}s</span>
          </div>

          {currentModifier && (
            <div className="px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase tracking-wider">
              {currentModifier.name}
            </div>
          )}
        </div>

        {/* Question Text */}
        <div className="text-center py-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight uppercase tracking-tight">{currentQuestion?.text}</h2>
        </div>

        {/* Option Selectors / Text input */}
        <div className="flex flex-col gap-3 my-4">
          {hasSubmitted ? (
            <div className="flex flex-col items-center justify-center p-12 bg-black/40 rounded-3xl border border-white/5 gap-3 text-center">
              <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center animate-bounce">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white uppercase tracking-wider">¡Respuesta Enviada!</p>
              <p className="text-gray-500 text-xs font-semibold">Tú respondiste: <span className="text-emerald-400 font-bold">{myAnswer}</span></p>
              <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mt-4">Esperando a que termine el tiempo...</p>
            </div>
          ) : isInputType ? (
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={inputAnswerText}
                onChange={(e) => setInputAnswerText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
                placeholder="Escribe tu respuesta aquí..."
                className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-emerald-500/50 focus:border-emerald-500 focus:outline-none text-white text-center font-bold text-lg transition-all"
                autoFocus
              />
              <button
                onClick={handleInputSubmit}
                disabled={!inputAnswerText.trim()}
                className="py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-800 disabled:text-gray-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg transition-all"
              >
                Enviar Respuesta
              </button>
            </div>
          ) : (
            <div className={`grid ${isBooleanType ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'} gap-4`}>
              {currentQuestion?.options?.map((option, idx) => {
                const isOptionRevealed = revealedBlindOptions[idx];
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(option)}
                    onMouseEnter={() => isBlind && setRevealedBlindOptions(prev => ({ ...prev, [idx]: true }))}
                    onMouseLeave={() => isBlind && setRevealedBlindOptions(prev => ({ ...prev, [idx]: false }))}
                    className={`relative p-6 bg-white/5 hover:bg-emerald-500/10 border-2 border-white/10 hover:border-emerald-500/30 rounded-3xl text-center font-bold text-white text-sm transition-all duration-300 overflow-hidden group`}
                  >
                    {isBlind && !isOptionRevealed ? (
                      <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-md flex items-center justify-center gap-2 group-hover:opacity-0 transition-opacity duration-300">
                        <EyeOff className="w-5 h-5 text-rose-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">???</span>
                      </div>
                    ) : null}
                    <span className="relative z-10 group-hover:scale-105 transition-transform inline-block">{option}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Players submitting responses feedback */}
        <div className="border-t border-white/5 pt-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Estado de los jugadores</span>
            <span className="text-[10px] font-bold text-gray-400">
              {players.filter(p => !p.isManualSpectator && !p.isEliminated).filter(p => isOnline ? p.status?.startsWith('answer:') : playerAnswers[p.id]).length} / {players.filter(p => !p.isManualSpectator && !p.isEliminated).length} Listos
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {players.map(p => {
              if (p.isManualSpectator) return null;
              const hasAns = isOnline ? p.status?.startsWith('answer:') : !!playerAnswers[p.id];
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    p.isEliminated 
                      ? 'bg-rose-950/20 border-rose-900/30 text-rose-500 opacity-50 line-through'
                      : hasAns
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-md shadow-emerald-500/5'
                        : 'bg-white/5 border-white/5 text-gray-400'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{p.name}</span>
                  {hasAns && <Check className="w-3 h-3 ml-0.5 animate-pulse" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Host action if time fails or manually ending */}
        {isAuthority && (
          <button
            onClick={handleTimeExpired}
            className="w-full mt-4 py-3 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 hover:text-rose-300 font-bold uppercase tracking-widest text-[10px] rounded-2xl transition-all"
          >
            Forzar Fin de Pregunta (Host)
          </button>
        )}
      </div>
    );
  };

  // Revealing correct answer layout
  const renderRevealingAnswer = () => {
    return (
      <div className="w-full max-w-xl flex flex-col gap-6 relative z-10 p-8 rounded-[2.5rem] bg-gray-900/60 border border-white/10 backdrop-blur-xl">
        <div className="text-center">
          <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 uppercase tracking-widest mb-3 inline-block">
            RESPUESTA CORRECTA
          </span>
          
          <div className="py-6 px-4 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-3xl shadow-xl shadow-emerald-500/5 mb-6">
            <h2 className="text-4xl font-black text-emerald-300 uppercase tracking-tight">{correctAnswer}</h2>
          </div>
        </div>

        {/* Answers list */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2 mb-1">Resultados de los Jugadores</h3>
          
          <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
            {players.map(p => {
              if (p.isManualSpectator) return null;
              
              const pAns = playerAnswers[p.id] || '';
              const isCorrect = verifyAnswer(pAns, correctAnswer, currentQuestion?.type || 'multiple');

              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border ${
                    p.isEliminated
                      ? 'bg-rose-950/10 border-rose-950/20 text-rose-600/50 opacity-40 line-through'
                      : isCorrect
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    <div>
                      <span className="text-sm font-bold block">{p.name}</span>
                      <span className={`text-[10px] block opacity-85 ${isCorrect ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
                        {pAns ? `Respondió: "${pAns}"` : 'Sin respuesta'}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-black uppercase tracking-wider">
                    {p.isEliminated 
                      ? 'Eliminado' 
                      : isCorrect 
                        ? (currentModifier?.effectType === 'points_doubled' ? '+20 PTS' : '+10 PTS')
                        : (scoringMode === 'MUERTE' ? '-1 HP' : '+0 PTS')
                    }
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {isAuthority && (
          <button
            onClick={handleTransitionToScoreUpdate}
            className="w-full mt-4 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-2xl font-black uppercase text-xs tracking-widest text-white shadow-lg transition-all"
          >
            Ver Tabla de Puntos
          </button>
        )}
      </div>
    );
  };

  // Scoreboard Update layout
  const renderScoreUpdate = () => {
    // Sort players by score (descending)
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    return (
      <div className="w-full max-w-md flex flex-col gap-6 relative z-10 p-8 rounded-[2.5rem] bg-gray-900/60 border border-white/10 backdrop-blur-xl">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30 mb-3">
            <Trophy className="w-6 h-6 text-amber-400 animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Tabla de Posiciones</h2>
          <p className="text-gray-400 text-xs mt-1">
            Modo de Juego: <span className="font-bold text-gray-300 uppercase tracking-widest">{scoringMode}</span>
          </p>
        </div>

        {/* Players List */}
        <div className="flex flex-col gap-2.5 my-4">
          {sortedPlayers.map((p, idx) => {
            if (p.isManualSpectator) return null;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl ${
                  p.isEliminated ? 'opacity-40 border-dashed bg-black/20' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-xs font-black text-gray-400">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">{p.name}</span>
                    {scoringMode === 'MUERTE' && (
                      <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block mt-0.5">
                        HP: {p.hp}/5
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-amber-400 block">{p.score}</span>
                  <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest leading-none">Puntos</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {isAuthority && (
          <button
            onClick={handleNextRound}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg transition-all"
          >
            Siguiente Ronda
          </button>
        )}
      </div>
    );
  };

  // State Selector
  switch (phase) {
    case 'CATEGORY_SELECT':
      return renderCategorySelect();
    case 'CHAOS_ROLL':
      return renderChaosRoll();
    case 'READING_QUESTION':
      return renderReadingQuestion();
    case 'ANSWERING':
      return renderAnswering();
    case 'REVEALING_ANSWER':
      return renderRevealingAnswer();
    case 'SCORE_UPDATE':
      return renderScoreUpdate();
    default:
      return renderCategorySelect();
  }
}
