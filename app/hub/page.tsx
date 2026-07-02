'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Gamepad2, Users, LayoutGrid, Plus, 
  ArrowRight, Star, Zap, Ghost, EyeOff,
  Crown, LogIn, LogOut, Globe, Smartphone,
  Search, Loader2, Dices
} from 'lucide-react';
import Link from 'next/link';
import { useGlobalContext } from '../../context/GlobalContext';
import { GameInfo, ConnectionMode } from '../../lib/types';
import { Footer } from '../../components/Footer';

const GAMES: GameInfo[] = [
  {
    id: 'confidente-mentiroso',
    title: 'Confidente y Mentiroso',
    description: 'Descubre quién dice la verdad en este juego de deducción social.',
    icon: '🕵️',
    color: 'from-blue-600 to-indigo-700',
    multiplayer: true
  },
  {
    id: 'impostor',
    title: 'El Impostor',
    description: 'Todos tienen la palabra secreta... ¡excepto uno!',
    icon: '🎭',
    color: 'from-rose-600 to-red-700',
    isNew: true,
    multiplayer: true
  },
  {
    id: 'trivia-caotica',
    title: 'Trivia Caótica',
    description: 'Preguntas locas donde la rapidez es lo más importante.',
    icon: '🧠',
    color: 'from-emerald-600 to-teal-700',
    isNew: true,
    multiplayer: true
  },
  {
    id: 'truth-or-dare',
    title: 'Verdad o Reto',
    description: 'El clásico juego de compromisos y secretos para romper el hielo.',
    icon: '🔥',
    color: 'from-orange-600 to-red-700',
    multiplayer: true
  },
  {
    id: 'random-number',
    title: 'Números Aleatorios',
    description: 'Generador de números con ajustes personalizables. Ideal para sorteos o pruebas.',
    icon: <Dices className="w-8 h-8 text-white" />,
    color: 'from-amber-500 to-orange-600',
    multiplayer: true
  }
];

export default function GameHub() {
  const { 
    activeSession, createSession, 
    onlineRoomCode, createRoom, joinRoom, onlineError
  } = useGlobalContext();

  const [mode, setMode] = React.useState<ConnectionMode>('LOCAL');
  const [showJoinInput, setShowJoinInput] = React.useState(false);
  const [roomCodeInput, setRoomCodeInput] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleCreateOnline = async () => {
    setIsProcessing(true);
    const res = await createRoom('Host');
    if (res) {
      createSession(`Sala ${res.code}`, 'ONLINE', res.code, true);
    }
    setIsProcessing(false);
  };

  const handleJoinOnline = async () => {
    if (!roomCodeInput) return;
    setIsProcessing(true);
    const res = await joinRoom(roomCodeInput, 'Jugador');
    if (res) {
      createSession(`Sala ${roomCodeInput}`, 'ONLINE', roomCodeInput.toUpperCase(), false);
    }
    setIsProcessing(false);
  };

  const filteredGames = mode === 'ONLINE' ? GAMES.filter(g => g.multiplayer) : GAMES;

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-[#0a0b14] text-white overflow-hidden relative">
      
      {/* Background Effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header / Top Bar */}
      <header className="p-6 flex justify-between items-center z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-white/5 rounded-xl border border-white/10 group-hover:bg-white/10 transition-colors">
            <Gamepad2 className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">Gamer<span className="text-blue-500">Hub</span></h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Plataforma Social</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {/* Mode Selector */}
          <div className="bg-white/5 p-1 rounded-2xl border border-white/10 flex gap-1">
            <button 
              onClick={() => setMode('LOCAL')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${mode === 'LOCAL' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              <Smartphone className="w-3 h-3" />
              Local
            </button>
            <button 
              onClick={() => setMode('ONLINE')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${mode === 'ONLINE' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              <Globe className="w-3 h-3" />
              Online
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-10 flex flex-col items-center text-center z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-6xl font-black mb-4 tracking-tighter uppercase"
        >
          {mode === 'LOCAL' ? (
            <>Juega en <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Local</span></>
          ) : (
            <>Batalla <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Online</span></>
          )}
        </motion.h2>
        <p className="text-gray-400 max-w-lg font-medium leading-relaxed">
          {mode === 'LOCAL' 
            ? 'Perfecto para jugar en un solo dispositivo pasando el móvil entre amigos.' 
            : 'Cada uno con su dispositivo. Crea una sala o únete a una existente.'}
        </p>

        {/* Online Controls */}
        {mode === 'ONLINE' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex flex-col sm:flex-row gap-4"
          >
            <button 
              onClick={handleCreateOnline}
              disabled={isProcessing}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Crear Partida
            </button>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Código Sala"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest focus:outline-none focus:border-purple-500 transition-all w-40"
              />
              <button 
                onClick={handleJoinOnline}
                disabled={isProcessing || !roomCodeInput}
                className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-3"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Unirse
              </button>
            </div>
          </motion.div>
        )}
        
        {onlineError && <p className="mt-4 text-red-400 text-xs font-bold uppercase tracking-widest">{onlineError}</p>}
      </section>

      {/* Game Catalog */}
      <section className="px-6 py-10 flex-1 z-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-8">
           <LayoutGrid className="w-5 h-5 text-gray-500" />
           <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-500">
             {mode === 'ONLINE' ? 'Juegos Multijugador' : 'Todos los Juegos'}
           </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link 
                href={game.id === 'confidente-mentiroso' || game.id === 'impostor' || game.id === 'truth-or-dare' || game.id === 'random-number' || game.id === 'trivia-caotica' ? `/juego/${game.id}` : '#'}
                className={`group relative flex flex-col h-full bg-gradient-to-br ${game.color} rounded-[2.5rem] p-8 overflow-hidden shadow-2xl hover:scale-[1.03] transition-all duration-500 border border-white/10`}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                  <Gamepad2 className="w-32 h-32" />
                </div>

                <div className="flex justify-between items-start mb-12 relative z-10">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-3xl shadow-xl">
                    {game.icon}
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {game.multiplayer && <div className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg"><Users className="w-4 h-4 text-white" /></div>}
                    {game.isNew && (
                      <span className="px-3 py-1 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Nuevo</span>
                    )}
                  </div>
                </div>

                <div className="mt-auto relative z-10">
                  <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{game.title}</h4>
                  <p className="text-white/70 text-sm font-medium leading-relaxed mb-6">
                    {game.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-[10px]">
                    Jugar Ahora
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>

                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
