'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Layers, Settings, Home as HomeIcon, 
  ChevronRight, PlusCircle, RefreshCw 
} from 'lucide-react';
import Link from 'next/link';
import { useGlobalContext } from '../context/GlobalContext';
import { SessionPicker } from './SessionPicker';

interface SessionHeaderProps {
  gameTitle: string;
  gameColor?: string;
}

export function SessionHeader({ gameTitle, gameColor = 'text-blue-400' }: SessionHeaderProps) {
  const { activeSession, sessions, setActiveSessionId, createSession, deleteSession } = useGlobalContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-black/20 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-white/5 rounded-xl transition-colors group">
            <HomeIcon className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
          </Link>
          <div className="h-6 w-[1px] bg-white/10" />
          <div>
            <h1 className={`text-sm sm:text-base font-black italic tracking-tighter uppercase ${gameColor}`}>
              {gameTitle}
            </h1>
          </div>
        </div>
        
        {activeSession && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 p-1.5 pl-4 rounded-2xl transition-all group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest leading-none mb-1">Sesión Actual</p>
              <p className="text-xs font-bold text-white truncate max-w-[120px]">{activeSession.name}</p>
            </div>
            <div className="p-2 bg-white/5 rounded-xl group-hover:bg-blue-500/20 transition-colors">
              <Layers className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
            </div>
          </button>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              <SessionPicker 
                sessions={sessions}
                onSelect={(id) => {
                  setActiveSessionId(id);
                  setIsModalOpen(false);
                }}
                onCreate={(name) => {
                  createSession(name);
                  setIsModalOpen(false);
                }}
                onDelete={deleteSession}
              />
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full mt-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold uppercase text-xs tracking-widest text-gray-400 hover:text-white transition-colors"
              >
                Cerrar Gestión
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
