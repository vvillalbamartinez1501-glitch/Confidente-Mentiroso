'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings, X, AlertCircle } from 'lucide-react';

interface RandomNumberGameProps {
  isOnline: boolean;
  isHost: boolean;
  gameState: {
    min: number;
    max: number;
    count: number;
    numbers: number[];
    rollId: string;
  };
  onGenerate: (newNumbers: number[]) => void;
  onUpdateSettings: (min: number, max: number, count: number) => void;
  onBackToMenu: () => void;
}

export default function RandomNumberGame({
  isOnline,
  isHost,
  gameState,
  onGenerate,
  onUpdateSettings,
  onBackToMenu,
}: RandomNumberGameProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [displayNumbers, setDisplayNumbers] = useState<number[]>(gameState.numbers);
  const [isAnimating, setIsAnimating] = useState(false);

  // Settings inputs
  const [inputMin, setInputMin] = useState(gameState.min);
  const [inputMax, setInputMax] = useState(gameState.max);
  const [inputCount, setInputCount] = useState(gameState.count);
  const [uniqueNumbers, setUniqueNumbers] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Track if it's the first mount
  const isFirstMount = useRef(true);

  // Sync inputs with gameState if changed externally
  useEffect(() => {
    setInputMin(gameState.min);
    setInputMax(gameState.max);
    setInputCount(gameState.count);
  }, [gameState.min, gameState.max, gameState.count]);

  // Roll animation logic
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      setDisplayNumbers(gameState.numbers);
      return;
    }

    if (gameState.numbers && gameState.numbers.length > 0) {
      setIsAnimating(true);
      const duration = 300; // total animation time in ms
      const intervalTime = 50; // interval in ms
      const steps = duration / intervalTime;
      let currentStep = 0;

      const interval = setInterval(() => {
        // Generate random numbers within range [min, max] for visualization
        const tempNumbers = Array.from({ length: gameState.count }, () =>
          Math.floor(Math.random() * (gameState.max - gameState.min + 1)) + gameState.min
        );
        setDisplayNumbers(tempNumbers);
        currentStep++;

        if (currentStep >= steps) {
          clearInterval(interval);
          setDisplayNumbers(gameState.numbers);
          setIsAnimating(false);
        }
      }, intervalTime);

      return () => clearInterval(interval);
    } else {
      setDisplayNumbers([]);
    }
  }, [gameState.rollId, gameState.numbers, gameState.count, gameState.min, gameState.max]);

  // Generate numbers array on click
  const handleRollClick = () => {
    if (isOnline && !isHost) return;

    const range = gameState.max - gameState.min + 1;
    const generated: number[] = [];

    if (uniqueNumbers && range >= gameState.count) {
      const pool = Array.from({ length: range }, (_, i) => gameState.min + i);
      for (let i = 0; i < gameState.count; i++) {
        const randIdx = Math.floor(Math.random() * pool.length);
        generated.push(pool[randIdx]);
        pool.splice(randIdx, 1);
      }
    } else {
      for (let i = 0; i < gameState.count; i++) {
        generated.push(
          Math.floor(Math.random() * range) + gameState.min
        );
      }
    }

    onGenerate(generated);
  };

  // Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError(null);

    const minVal = parseInt(inputMin.toString());
    const maxVal = parseInt(inputMax.toString());
    const countVal = parseInt(inputCount.toString());

    if (isNaN(minVal) || isNaN(maxVal) || isNaN(countVal)) {
      setSettingsError('Todos los campos deben ser valores numéricos.');
      return;
    }

    if (minVal >= maxVal) {
      setSettingsError('El valor mínimo debe ser menor que el máximo.');
      return;
    }

    if (countVal < 1) {
      setSettingsError('La cantidad de números a mostrar debe ser al menos 1.');
      return;
    }

    if (countVal > 100) {
      setSettingsError('La cantidad máxima de números permitida es 100.');
      return;
    }

    if (uniqueNumbers && (maxVal - minVal + 1) < countVal) {
      setSettingsError(
        `Rango insuficiente para números únicos. Para mostrar ${countVal} números únicos, la diferencia Máximo - Mínimo debe ser de al menos ${countVal - 1}.`
      );
      return;
    }

    onUpdateSettings(minVal, maxVal, countVal);
    setIsSettingsOpen(false);
  };

  // Responsive font sizes for numbers based on the count using native inline styles
  const getNumberStyle = (qty: number): React.CSSProperties => {
    if (qty <= 1) {
      return { fontSize: 'min(95vw, 70vh)' };
    }
    if (qty <= 2) {
      return { fontSize: 'min(45vw, 55vh)' };
    }
    if (qty <= 4) {
      return { fontSize: 'min(35vw, 40vh)' };
    }
    if (qty <= 9) {
      return { fontSize: 'min(22vw, 30vh)' };
    }
    return { fontSize: 'min(14vw, 18vh)' };
  };

  const showSettingsButton = !isOnline || isHost;
  const showGenerateButton = !isOnline || isHost;

  return (
    <div className="w-full max-w-6xl flex flex-col justify-between flex-1 min-h-[80vh] gap-6 relative z-10 px-4">
      {/* Top Header Controls */}
      <div className="flex justify-between items-center w-full">
        <button
          onClick={onBackToMenu}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-gray-400 hover:text-white transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="text-center">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">
            Números Aleatorios
          </p>
          <p className="text-xs font-bold text-gray-500">
            Rango: {gameState.min} - {gameState.max} | Cantidad: {gameState.count}
          </p>
        </div>

        {showSettingsButton ? (
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-gray-400 hover:text-white transition-all hover:rotate-45"
          >
            <Settings className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-11 h-11" /> // Spacer
        )}
      </div>

      {/* Main Large Display Area */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[350px]">
        <AnimatePresence mode="wait">
          {displayNumbers.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center gap-4 text-center cursor-pointer"
              onClick={showGenerateButton ? handleRollClick : undefined}
            >
              <div className="w-40 h-40 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-[2.5rem] flex items-center justify-center border-2 border-amber-500/30 animate-pulse">
                <span className="text-7xl font-black text-amber-500 font-mono">?</span>
              </div>
              <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em]">
                {showGenerateButton ? 'Pulsa GENERAR o toca aquí para iniciar' : 'Esperando tirada del Host...'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="numbers-grid"
              className="w-full flex flex-wrap justify-center items-center gap-4 sm:gap-6 p-4"
            >
              {displayNumbers.map((num, i) => (
                <motion.div
                  key={`${i}-${num}`}
                  initial={{ opacity: 0, scale: 0.5, y: 15 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: 0,
                    filter: isAnimating ? 'blur(4px)' : 'blur(0px)'
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20, 
                    delay: isAnimating ? 0 : i * 0.05 
                  }}
                  style={getNumberStyle(gameState.count)}
                  className="font-black text-white leading-none drop-shadow-[0_0_35px_rgba(255,255,255,0.2)] font-mono select-none px-2"
                >
                  {num}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Call To Action Controls */}
      <div className="w-full flex flex-col items-center gap-4">
        {showGenerateButton ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRollClick}
            disabled={isAnimating}
            className="w-full py-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-[2rem] font-black text-2xl uppercase tracking-widest shadow-2xl shadow-orange-500/20 hover:from-amber-400 hover:to-orange-500 transition-all duration-300 border border-amber-400/20"
          >
            {isAnimating ? 'SORTEANDO...' : 'GENERAR'}
          </motion.button>
        ) : (
          <div className="text-center py-4 bg-white/5 border border-white/5 rounded-2xl w-full">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">
              Modo Invitado (Solo Lectura)
            </p>
            <p className="text-xs text-amber-500 font-bold uppercase tracking-wider mt-1">
              El Host controla la generación
            </p>
          </div>
        )}
      </div>

      {/* Settings Modal (Host Only) */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl overflow-hidden z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-gray-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">
                Ajustes del Sorteo
              </h3>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                {settingsError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-red-400 leading-normal">
                      {settingsError}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {/* Min Input */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">
                      Mínimo
                    </label>
                    <input
                      type="number"
                      value={inputMin}
                      onChange={(e) => setInputMin(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-black text-lg focus:outline-none focus:border-amber-500 transition-all font-mono"
                      required
                    />
                  </div>

                  {/* Max Input */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">
                      Máximo
                    </label>
                    <input
                      type="number"
                      value={inputMax}
                      onChange={(e) => setInputMax(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-black text-lg focus:outline-none focus:border-amber-500 transition-all font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Count Input */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">
                    Cantidad de Números
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={inputCount}
                    onChange={(e) => setInputCount(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-black text-lg focus:outline-none focus:border-amber-500 transition-all font-mono"
                    required
                  />
                </div>

                {/* Unique Switch */}
                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="space-y-1 pr-4">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest block">
                      Números Únicos
                    </span>
                    <span className="text-[9px] text-gray-500 font-bold uppercase block">
                      No repetir números en el mismo sorteo
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uniqueNumbers}
                      onChange={() => setUniqueNumbers(!uniqueNumbers)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-white peer-checked:after:border-white"></div>
                  </label>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs tracking-[0.2em] rounded-2xl transition-all shadow-xl"
                >
                  Guardar Ajustes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
