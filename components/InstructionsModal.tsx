'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, UserCheck, Ghost, Swords, Zap, Target, HelpCircle } from 'lucide-react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstructionsModal({ isOpen, onClose }: InstructionsModalProps) {
  const [activeTab, setActiveTab] = useState<'concepto' | 'roles' | 'modos'>('concepto');

  // Block scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const tabs = [
    { id: 'concepto', label: 'Concepto', icon: HelpCircle },
    { id: 'roles', label: 'Roles', icon: UserCheck },
    { id: 'modos', label: 'Modos', icon: Swords },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] cursor-pointer"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl bg-gray-900/90 border border-white/10 rounded-3xl shadow-2xl z-[101] overflow-hidden backdrop-blur-xl"
          >
            <div className="relative p-6 md:p-8">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Cómo Jugar</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-8 bg-black/20 p-1 rounded-2xl border border-white/5">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                        activeTab === tab.id 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Content */}
              <div className="min-h-[300px] flex flex-col">
                <AnimatePresence mode="wait">
                  {activeTab === 'concepto' && (
                    <motion.div
                      key="concepto"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-6"
                    >
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                        <h3 className="text-blue-400 font-black text-lg mb-2 flex items-center gap-2 uppercase">
                          <Target className="w-5 h-5" /> El Secreto
                        </h3>
                        <p className="text-gray-300 leading-relaxed font-medium">
                          En cada ronda, el sistema revela un <span className="text-white font-bold">Secreto</span> (una foto o una palabra) que solo dos personas pueden ver: el <span className="text-emerald-400 font-bold">Confidente</span> y el <span className="text-rose-400 font-bold">Mentiroso</span>.
                        </p>
                      </div>
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                        <h3 className="text-purple-400 font-black text-lg mb-2 flex items-center gap-2 uppercase">
                          <HelpCircle className="w-5 h-5" /> La Misión
                        </h3>
                        <p className="text-gray-300 leading-relaxed font-medium">
                          El <span className="text-blue-400 font-bold">Adivino</span> no sabe qué es el secreto. Su objetivo es interrogar a los otros dos jugadores para identificar quién está diciendo la verdad y quién está inventando.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'roles' && (
                    <motion.div
                      key="roles"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-4"
                    >
                      <div className="flex gap-4 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                        <div className="p-3 bg-emerald-500/20 rounded-xl h-fit">
                          <UserCheck className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="text-emerald-400 font-black uppercase tracking-widest text-sm mb-1">El Confidente</h4>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            Conoce el secreto y debe ayudar al Adivino diciendo <span className="text-white font-bold">siempre la verdad</span>. Sus pistas deben ser sutiles para no darle la respuesta fácil al Mentiroso.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                        <div className="p-3 bg-rose-500/20 rounded-xl h-fit">
                          <Ghost className="w-6 h-6 text-rose-400" />
                        </div>
                        <div>
                          <h4 className="text-rose-400 font-black uppercase tracking-widest text-sm mb-1">El Mentiroso</h4>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            ¡También conoce el secreto! Su misión es <span className="text-white font-bold">engañar al Adivino</span> para que crea que él es el confidente. Debe imitar el estilo de las pistas del otro jugador.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                        <div className="p-3 bg-blue-500/20 rounded-xl h-fit">
                          <Target className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-blue-400 font-black uppercase tracking-widest text-sm mb-1">El Adivino</h4>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            No conoce el secreto. Debe hacer preguntas inteligentes y analizar las respuestas para detectar inconsistencias. Al final, señala a quien cree que es el <span className="text-white font-bold">Mentiroso</span>.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'modos' && (
                    <motion.div
                      key="modos"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="grid grid-cols-1 gap-3"
                    >
                      {[
                        { title: 'Original', desc: 'Puntos por descubrir al mentiroso o lograr engañar al adivino.', icon: Target, color: 'text-blue-400' },
                        { title: 'Puntos a Mansalva', desc: 'El jugador elegido por el adivino siempre suma puntos.', icon: Zap, color: 'text-yellow-400' },
                        { title: 'Muerte por Puntos', desc: 'Los jugadores pierden HP. El que llegue a cero queda eliminado.', icon: Swords, color: 'text-rose-400' }
                      ].map((m, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                          <m.icon className={`w-8 h-8 ${m.color}`} />
                          <div>
                            <h4 className="text-white font-bold text-sm uppercase">{m.title}</h4>
                            <p className="text-gray-500 text-xs">{m.desc}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <button
                onClick={onClose}
                className="mt-8 w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-transform active:scale-95"
              >
                ¡A Jugar!
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
