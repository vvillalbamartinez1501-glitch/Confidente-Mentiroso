'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Settings, Info, Clock, Check, X, 
  ShieldCheck, AlertTriangle, Type, LayoutGrid, 
  Target, Swords, UserCheck, Home as HomeIcon, Ghost, 
  ArrowRight, Search, Trophy, RotateCcw
} from 'lucide-react';
import { useGlobalContext } from '../../../context/GlobalContext';
import { getRandomSecret } from '../../../lib/contentManager';
import { WordCategory, WORD_CATEGORIES } from '../../../constants/words';
import { SessionHeader } from '../../../components/SessionHeader';
import { InstructionsModal } from '../../../components/InstructionsModal';
import { PlayerLobby } from '../../../components/PlayerLobby';
import Link from 'next/link';

type ImpostorState = 'home' | 'group_manage' | 'setup' | 'playing' | 'result' | 'repesca' | 'final_result';

export default function ImpostorPage() {
  const { activeSession, updateActiveSessionPlayers } = useGlobalContext();
  const [gameState, setGameState] = useState<ImpostorState>('home');
  const [category, setCategory] = useState<WordCategory | 'random'>('random');
  const [secretWord, setSecretWord] = useState('');
  const [roles, setRoles] = useState<{ playerId: string, playerName: string, isImpostor: boolean }[]>([]);
  const [showRole, setShowRole] = useState(false);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [impostorGuess, setImpostorGuess] = useState('');
  const [didImpostorWin, setDidImpostorWin] = useState(false);

  const startSetup = () => setGameState('group_manage');

  const handleReorder = (index: number, direction: 'up' | 'down') => {
    const players = [...(activeSession?.players || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= players.length) return;
    const [movedPlayer] = players.splice(index, 1);
    players.splice(newIndex, 0, movedPlayer);
    updateActiveSessionPlayers(players);
  };

  const handleToggleSpectator = (id: string) => {
    updateActiveSessionPlayers(
      (activeSession?.players || []).map(p => 
        p.id === id ? { ...p, isManualSpectator: !p.isManualSpectator } : p
      )
    );
  };

  const startGame = async () => {
    const categoriesToUse = category === 'random' 
      ? (Object.keys(WORD_CATEGORIES) as WordCategory[]) 
      : [category];
      
    const secret = await getRandomSecret('WORDS', categoriesToUse);
    setSecretWord(secret.content);
    
    const allPlayers = activeSession?.players || [];
    const activePlayers = allPlayers.filter(p => !p.isManualSpectator && !p.isEliminated);
    
    if (activePlayers.length < 3) {
      alert("Necesitas al menos 3 jugadores activos.");
      return;
    }

    // Assign roles respecting the CURRENT order in the list
    // We pick one random impostor from the active players
    const impostorIndex = Math.floor(Math.random() * activePlayers.length);
    const impostorId = activePlayers[impostorIndex].id;

    const assignedRoles = activePlayers.map(p => ({
      playerId: p.id,
      playerName: p.name,
      isImpostor: p.id === impostorId
    }));

    setRoles(assignedRoles);
    setCurrentPlayerIdx(0);
    setGameState('playing');
    setShowRole(false);
    setImpostorGuess('');
    setDidImpostorWin(false);
  };

  const nextPlayer = () => {
    if (currentPlayerIdx < roles.length - 1) {
      setCurrentPlayerIdx(prev => prev + 1);
      setShowRole(false);
    } else {
      setGameState('result');
    }
  };

  const resolveGame = (impostorDiscovered: boolean) => {
    if (impostorDiscovered) {
      setGameState('repesca');
    } else {
      // Impostor wins directly
      applyScores(true);
      setDidImpostorWin(true);
      setGameState('final_result');
    }
  };

  const handleRepescaSubmit = () => {
    const isCorrect = impostorGuess.toLowerCase().trim() === secretWord.toLowerCase().trim();
    applyScores(isCorrect);
    setDidImpostorWin(isCorrect);
    setGameState('final_result');
  };

  const applyScores = (impostorWins: boolean) => {
    if (!activeSession) return;
    
    const impostor = roles.find(r => r.isImpostor)!;
    const citizens = roles.filter(r => !r.isImpostor);

    const updatedPlayers = activeSession.players.map(p => {
      if (impostorWins && p.id === impostor.playerId) {
        return { ...p, score: p.score + 2 };
      } else if (!impostorWins && citizens.some(c => c.playerId === p.id)) {
        return { ...p, score: p.score + 1 };
      }
      return p;
    });

    updateActiveSessionPlayers(updatedPlayers);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-[#1a0f11] to-black min-h-screen">
      
      <SessionHeader gameTitle="El Impostor" gameColor="text-rose-500" />

      <InstructionsModal 
        isOpen={isInstructionsOpen} 
        onClose={() => setIsInstructionsOpen(false)} 
        gameId="impostor"
      />

      <AnimatePresence mode="wait">
        {gameState === 'home' && (
          <motion.div key="home" className="flex flex-col items-center gap-8 z-10 text-center">
            <div className="p-6 bg-rose-500/20 rounded-full animate-pulse">
              <Ghost className="w-20 h-20 text-rose-500" />
            </div>
            <div>
              <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-2">El Impostor</h2>
              <p className="text-gray-400 max-w-xs mx-auto">Uno de vosotros no conoce la palabra. ¿Quién será?</p>
            </div>
            <div className="flex flex-col gap-4 w-full">
              <button 
                onClick={startSetup}
                className="px-10 py-5 bg-rose-600 rounded-2xl font-black text-lg uppercase tracking-[0.2em] shadow-2xl shadow-rose-500/20 hover:bg-rose-500 transition-all"
              >
                Comenzar
              </button>
              <button 
                onClick={() => setIsInstructionsOpen(true)}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Info className="w-4 h-4" />
                Cómo Jugar
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'group_manage' && (
          <motion.div key="group" className="w-full max-w-md z-10">
             <PlayerLobby 
                players={activeSession?.players || []}
                onAdd={(name) => updateActiveSessionPlayers([...(activeSession?.players || []), { id: crypto.randomUUID(), name, score: 0, hp: 5, isEliminated: false, isManualSpectator: false }])}
                onRemove={(id) => updateActiveSessionPlayers((activeSession?.players || []).filter(p => p.id !== id))}
                onUpdate={(id, name) => updateActiveSessionPlayers((activeSession?.players || []).map(p => p.id === id ? { ...p, name } : p))}
                onToggleSpectator={handleToggleSpectator}
                onReorder={handleReorder}
                onContinue={() => setGameState('setup')}
             />
          </motion.div>
        )}

        {gameState === 'setup' && (
          <motion.div key="setup" className="w-full max-w-md flex flex-col gap-6 z-10">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight text-center">Configuración</h3>
            <div className="glass-panel p-6 rounded-3xl bg-white/5 border border-white/10">
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 block text-center">Selecciona Categoría</label>
               <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-white font-bold"
               >
                 <option value="random">Cualquier Categoría</option>
                 {Object.entries(WORD_CATEGORIES).map(([key, cat]) => (
                   <option key={key} value={key}>{cat.name}</option>
                 ))}
               </select>
            </div>
            <button 
              onClick={startGame}
              className="w-full py-5 bg-rose-600 rounded-2xl font-black text-lg uppercase tracking-widest"
            >
              ¡Repartir Palabra!
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div key="playing" className="w-full max-w-md flex flex-col items-center gap-8 z-10">
            <div className="text-center">
              <p className="text-rose-500 font-black uppercase tracking-[0.3em] text-xs mb-2">Turno de</p>
              <h3 className="text-4xl font-black text-white uppercase tracking-tighter">{roles[currentPlayerIdx].playerName}</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase mt-2">Jugador {currentPlayerIdx + 1} de {roles.length}</p>
            </div>

            <div className="w-full aspect-square max-w-[300px]">
              <button 
                onClick={() => setShowRole(!showRole)}
                className={`w-full h-full rounded-[3rem] border-4 flex flex-col items-center justify-center gap-4 transition-all duration-500 ${
                  showRole ? 'bg-rose-500/10 border-rose-500/50' : 'bg-white/5 border-white/10'
                }`}
              >
                {!showRole ? (
                  <>
                    <div className="p-6 bg-white/5 rounded-full">
                      <Target className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Pulsa para revelar tu rol</p>
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
                    {roles[currentPlayerIdx].isImpostor ? (
                      <>
                        <Ghost className="w-16 h-16 text-rose-500" />
                        <h4 className="text-2xl font-black text-rose-500 uppercase italic tracking-tighter">ERES EL IMPOSTOR</h4>
                        <p className="text-xs text-gray-400 font-medium px-8 text-center italic">"No conoces la palabra. ¡Finge que sí y engaña a todos!"</p>
                      </>
                    ) : (
                      <>
                        <div className="p-4 bg-emerald-500/20 rounded-2xl">
                          <Type className="w-16 h-16 text-emerald-400" />
                        </div>
                        <p className="text-[10px] font-black uppercase text-emerald-500/60 tracking-widest">La palabra secreta es:</p>
                        <h4 className="text-4xl font-black text-white uppercase tracking-tighter shadow-emerald-500/20 drop-shadow-xl">{secretWord}</h4>
                      </>
                    )}
                  </motion.div>
                )}
              </button>
            </div>

            {showRole && (
              <button 
                onClick={nextPlayer}
                className="w-full py-6 bg-white text-black rounded-3xl font-black text-xl uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                {currentPlayerIdx < roles.length - 1 ? 'Siguiente Jugador' : 'Terminar Reparto'}
              </button>
            )}
          </motion.div>
        )}

        {gameState === 'result' && (
          <motion.div key="result" className="flex flex-col items-center gap-8 z-10 text-center w-full max-w-md">
            <div className="space-y-2">
              <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic">Fase de Debate</h3>
              <p className="text-gray-400 font-medium">Hablad y votad a quién creéis que es el Impostor.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 w-full">
              <button 
                onClick={() => resolveGame(true)}
                className="group p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-between hover:bg-emerald-500/20 transition-all"
              >
                <div className="text-left">
                  <h4 className="text-white font-black uppercase text-lg">Descubierto</h4>
                  <p className="text-emerald-400/60 text-[10px] font-bold uppercase tracking-widest">El grupo acertó</p>
                </div>
                <Check className="w-8 h-8 text-emerald-400" />
              </button>

              <button 
                onClick={() => resolveGame(false)}
                className="group p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center justify-between hover:bg-rose-500/20 transition-all"
              >
                <div className="text-left">
                  <h4 className="text-white font-black uppercase text-lg">Se Escapó</h4>
                  <p className="text-rose-400/60 text-[10px] font-bold uppercase tracking-widest">El impostor ganó</p>
                </div>
                <Ghost className="w-8 h-8 text-rose-400" />
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'repesca' && (
          <motion.div key="repesca" className="flex flex-col items-center gap-6 z-10 text-center w-full max-w-md">
            <div className="p-4 bg-orange-500/20 rounded-full">
               <RotateCcw className="w-12 h-12 text-orange-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Última Oportunidad</h3>
              <p className="text-gray-400 text-sm">El Impostor puede robar la victoria si adivina la palabra secreta.</p>
            </div>

            <div className="w-full space-y-4">
              <input 
                value={impostorGuess}
                onChange={(e) => setImpostorGuess(e.target.value)}
                placeholder="Escribe la palabra secreta..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-black uppercase text-center text-xl outline-none focus:border-orange-500 transition-all"
              />
              <button 
                onClick={handleRepescaSubmit}
                className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-lg"
              >
                Confirmar Adivinanza
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'final_result' && (
          <motion.div key="final" className="flex flex-col items-center gap-8 z-10 text-center w-full max-w-md">
            <div className={`p-8 rounded-full ${didImpostorWin ? 'bg-rose-500/20' : 'bg-emerald-500/20'}`}>
              {didImpostorWin ? <Ghost className="w-20 h-20 text-rose-500" /> : <ShieldCheck className="w-20 h-20 text-emerald-500" />}
            </div>
            
            <div>
              <h3 className="text-5xl font-black text-white uppercase tracking-tighter">
                {didImpostorWin ? 'Gana el Impostor' : 'Ganan los Ciudadanos'}
              </h3>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-2">
                La palabra era: <span className="text-white">{secretWord}</span>
              </p>
            </div>

            <div className="w-full p-6 bg-white/5 rounded-3xl border border-white/10">
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                 <Trophy className="w-4 h-4" /> Marcador de Sesión
               </p>
               <div className="space-y-2">
                 {(activeSession?.players || []).map(p => (
                   <div key={p.id} className="flex justify-between items-center px-4 py-2 bg-black/20 rounded-xl">
                     <span className="font-bold text-gray-300">{p.name}</span>
                     <span className="font-black text-white">{p.score} pts</span>
                   </div>
                 ))}
               </div>
            </div>

            <div className="flex gap-4 w-full">
               <button onClick={() => setGameState('setup')} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-xs tracking-widest text-gray-400 hover:text-white">
                  Nueva Ronda
               </button>
               <Link href="/" className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">
                  Salir al Hub
               </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
