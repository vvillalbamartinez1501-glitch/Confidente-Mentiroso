'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, UserCheck, LayoutGrid, Ghost, Swords, Zap, Target, HelpCircle } from 'lucide-react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstructionsModal({ isOpen, onClose }: InstructionsModalProps) {
  const [activeTab, setActiveTab] = useState<'concepto' | 'roles' | 'pasos' | 'modos'>('concepto');

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
    { id: 'pasos', label: 'Paso a Paso', icon: LayoutGrid },
    { id: 'modos', label: 'Modos', icon: Swords },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-gray-900/95 border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-2xl flex flex-col max-h-[90vh]"
          >
            <div className="relative p-6 md:p-10 overflow-y-auto custom-scrollbar">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Manual de Juego</h2>
                    <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mt-1">Confidente y Mentiroso</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-3 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-8 bg-black/40 p-1.5 rounded-[1.25rem] border border-white/5 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-shrink-0 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                        activeTab === tab.id 
                          ? 'bg-white text-black shadow-xl scale-[1.02]' 
                          : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Content */}
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  {activeTab === 'concepto' && (
                    <motion.div
                      key="concepto"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="bg-gradient-to-br from-white/5 to-transparent p-8 rounded-3xl border border-white/10">
                        <h3 className="text-blue-400 font-black text-xl mb-4 flex items-center gap-3 uppercase italic">
                          <Target className="w-6 h-6" /> El Corazón del Juego
                        </h3>
                        <p className="text-gray-300 text-lg leading-relaxed">
                          Este es un juego de <span className="text-white font-bold">deducción social, engaño y astucia</span>. 
                          La premisa es simple: hay un secreto que casi todos conocen, excepto una persona. 
                          <br /><br />
                          ¿Podrás convencer al Adivino de que eres tú quien dice la verdad, o serás capaz de detectar las grietas en la historia del Mentiroso?
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                          <h4 className="text-white font-bold mb-2 flex items-center gap-2 uppercase text-sm">
                            <ImageIcon className="w-4 h-4 text-indigo-400" /> Modo Fotos
                          </h4>
                          <p className="text-gray-400 text-sm">El secreto es una imagen aleatoria. Las pistas deben describir colores, formas o sensaciones.</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                          <h4 className="text-white font-bold mb-2 flex items-center gap-2 uppercase text-sm">
                            <Type className="w-4 h-4 text-purple-400" /> Modo Palabras
                          </h4>
                          <p className="text-gray-400 text-sm">El secreto es un concepto o categoría. Las pistas deben ser abstractas pero veraces.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'roles' && (
                    <motion.div
                      key="roles"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className="group p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors">
                        <div className="flex gap-5">
                          <div className="p-4 bg-emerald-500/20 rounded-2xl h-fit">
                            <ShieldCheck className="w-8 h-8 text-emerald-400" />
                          </div>
                          <div>
                            <h4 className="text-emerald-400 font-black uppercase tracking-[0.2em] text-sm mb-2">El Confidente (La Verdad)</h4>
                            <p className="text-gray-300 leading-relaxed text-sm">
                              Tú conoces el secreto real. Tu misión es dar pistas que el <span className="text-white font-bold">Adivino</span> pueda entender, pero sin ser demasiado obvio, para que el Mentiroso no te robe la información.
                            </p>
                            <div className="mt-3 text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest">Estrategia: Usa detalles específicos pero sutiles.</div>
                          </div>
                        </div>
                      </div>

                      <div className="group p-6 bg-rose-500/5 rounded-3xl border border-rose-500/20 hover:bg-rose-500/10 transition-colors">
                        <div className="flex gap-5">
                          <div className="p-4 bg-rose-500/20 rounded-2xl h-fit">
                            <Ghost className="w-8 h-8 text-rose-400" />
                          </div>
                          <div>
                            <h4 className="text-rose-400 font-black uppercase tracking-[0.2em] text-sm mb-2">El Mentiroso (El Engaño)</h4>
                            <p className="text-gray-300 leading-relaxed text-sm">
                              ¡Sorpresa! Tú también conoces el secreto. Tu objetivo es <span className="text-white font-bold">suplantar al Confidente</span>. Debes actuar como si estuvieras ayudando, pero tu meta final es que el Adivino te señale a ti como el "bueno".
                            </p>
                            <div className="mt-3 text-[10px] text-rose-500/60 font-bold uppercase tracking-widest">Estrategia: Observa las reacciones del confidente y adapta tu historia.</div>
                          </div>
                        </div>
                      </div>

                      <div className="group p-6 bg-blue-500/5 rounded-3xl border border-blue-500/20 hover:bg-blue-500/10 transition-colors">
                        <div className="flex gap-5">
                          <div className="p-4 bg-blue-500/20 rounded-2xl h-fit">
                            <Target className="w-8 h-8 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="text-blue-400 font-black uppercase tracking-[0.2em] text-sm mb-2">El Adivino (La Intuición)</h4>
                            <p className="text-gray-300 leading-relaxed text-sm">
                              Tú <span className="text-white font-bold">no sabes nada</span>. Debes interrogar a los otros dos jugadores y decidir quién miente. Al final de la ronda, deberás señalar a quien creas que es el Mentiroso.
                            </p>
                            <div className="mt-3 text-[10px] text-blue-500/60 font-bold uppercase tracking-widest">Estrategia: Haz preguntas comparativas y busca contradicciones.</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'pasos' && (
                    <motion.div
                      key="pasos"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      {[
                        { step: '01', title: 'Asignación Segura', text: 'El Adivino debe dejar de mirar la pantalla. El Confidente y el Mentiroso ven el secreto y sus roles.' },
                        { step: '02', title: 'Interrogatorio', text: 'El Adivino hace preguntas a ambos. "El Confidente" dirá la verdad, "El Mentiroso" intentará parecer que dice la verdad.' },
                        { step: '03', title: 'Votación', text: 'Al acabarse el tiempo, el Adivino debe señalar formalmente a quien cree que es el Mentiroso.' },
                        { step: '04', title: 'Revelación', text: 'Se descubre la verdad. Dependiendo del modo elegido, se suman puntos o se pierden vidas.' }
                      ].map((item, i) => (
                        <div key={i} className="flex gap-6 items-start p-5 bg-white/5 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all">
                          <span className="text-3xl font-black text-blue-500/30 font-mono leading-none">{item.step}</span>
                          <div>
                            <h4 className="text-white font-black uppercase tracking-tight text-sm mb-1">{item.title}</h4>
                            <p className="text-gray-400 text-xs leading-relaxed">{item.text}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === 'modos' && (
                    <motion.div
                      key="modos"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-1 gap-4"
                    >
                      <div className="p-6 bg-gradient-to-br from-blue-500/10 to-transparent rounded-3xl border border-blue-500/20">
                        <div className="flex items-center gap-4 mb-3">
                          <Target className="w-8 h-8 text-blue-400" />
                          <h4 className="text-white font-black uppercase tracking-widest text-sm">Modo Original</h4>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed">
                          Si el Adivino <span className="text-blue-400 font-bold">acierta</span> y señala al Mentiroso, el Adivino suma +1. <br />
                          Si el Adivino <span className="text-rose-400 font-bold">falla</span> y señala al Confidente, el Mentiroso suma +1 por su gran actuación.
                        </p>
                      </div>

                      <div className="p-6 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-3xl border border-yellow-500/20">
                        <div className="flex items-center gap-4 mb-3">
                          <Zap className="w-8 h-8 text-yellow-400" />
                          <h4 className="text-white font-black uppercase tracking-widest text-sm">Puntos a Mansalva</h4>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed">
                          ¡Aquí nadie pierde! El jugador que sea señalado por el Adivino (sea el que sea) suma +1 punto. Es un modo ideal para partidas rápidas y casuales.
                        </p>
                      </div>

                      <div className="p-6 bg-gradient-to-br from-rose-500/10 to-transparent rounded-3xl border border-rose-500/20">
                        <div className="flex items-center gap-4 mb-3">
                          <Swords className="w-8 h-8 text-rose-500" />
                          <h4 className="text-white font-black uppercase tracking-widest text-sm">Muerte por Puntos</h4>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed">
                          Cada jugador empieza con vidas (HP). Si el Adivino descubre al Mentiroso, el Mentiroso pierde 1 HP. Si el Mentiroso engaña al grupo, el Adivino y el Confidente pierden 1 HP.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="mt-10 flex flex-col items-center gap-4">
                <button
                  onClick={onClose}
                  className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/20 hover:scale-[1.02] transition-transform active:scale-95 text-lg"
                >
                  ¡Entendido!
                </button>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.4em]">¿Listo para el desafío?</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
