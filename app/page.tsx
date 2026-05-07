'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, Smartphone, ShieldCheck, Zap, 
  ArrowRight, Play, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useGlobalContext } from '../context/GlobalContext';
import { Footer } from '../components/Footer';

export default function LandingPage() {
  const { activeSession } = useGlobalContext();
  const [isExiting, setIsExiting] = React.useState(false);

  return (
    <AnimatePresence>
      {!isExiting && (
        <main className="relative flex flex-col items-center justify-center min-h-screen bg-[#0a0b14] text-white overflow-hidden">
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
                rotate: [0, 90, 0]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" 
            />
            <motion.div 
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.1, 0.15, 0.1],
                rotate: [0, -90, 0]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]" 
            />
          </div>

          {/* Content Wrapper */}
          <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-6 text-center">
            
            {/* Logo Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/10 mb-8 backdrop-blur-xl"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Next-Gen Party Gaming</span>
            </motion.div>

            {/* Hero Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-5xl sm:text-8xl font-black mb-6 tracking-tighter uppercase leading-[0.9]">
                PARTY<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600">GAMES</span> HUB
              </h1>
              <p className="text-gray-400 text-lg sm:text-xl font-medium max-w-lg mx-auto leading-relaxed mb-12">
                Risas, engaños y verdades en un solo lugar. Transforma cualquier reunión en una experiencia inolvidable.
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-full flex justify-center mb-16"
            >
              <Link 
                href="/hub"
                onClick={() => setIsExiting(true)}
                className="group relative flex items-center justify-center gap-4 px-12 py-6 bg-white text-black rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                <Play className="w-6 h-6 fill-current" />
                {activeSession ? 'Continuar Partida' : '¡Empezar a Jugar!'}
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-12">
              {[
                { icon: Smartphone, title: "Híbrido", desc: "Un móvil o cada uno con el suyo." },
                { icon: ShieldCheck, title: "Privacidad", desc: "Datos seguros y juego offline." },
                { icon: Zap, title: "Rápido", desc: "Listo para jugar en 30 segundos." }
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl backdrop-blur-sm flex flex-col items-center gap-3 group hover:bg-white/[0.05] transition-colors"
                >
                  <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors">
                    <f.icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="font-black uppercase text-xs tracking-widest text-white">{f.title}</h3>
                  <p className="text-gray-500 text-[10px] font-bold uppercase leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>

          </div>

          <Footer />

          {/* Exit Transition Overlay */}
          <AnimatePresence>
            {isExiting && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#0a0b14] z-[100] flex items-center justify-center"
              >
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <Gamepad2 className="w-12 h-12 text-blue-500 animate-bounce" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500">Cargando Catálogo...</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      )}
    </AnimatePresence>
  );
}
