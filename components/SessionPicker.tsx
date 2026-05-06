'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Session } from '../lib/types';
import { Plus, Trash2, Calendar, Users, ChevronRight, Play } from 'lucide-react';

interface SessionPickerProps {
  sessions: Session[];
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onDelete: (id: string) => void;
}

export function SessionPicker({ sessions, onSelect, onCreate, onDelete }: SessionPickerProps) {
  const [newSessionName, setNewSessionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const handleCreate = () => {
    if (newSessionName.trim()) {
      onCreate(newSessionName.trim());
      setNewSessionName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Sesiones</h2>
        <button 
          onClick={() => setIsCreating(true)}
          className="p-2 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-4"
          >
            <input 
              autoFocus
              placeholder="Nombre de la sesión (ej: Amigos Viernes)"
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setIsCreating(false)}
                className="flex-1 py-2 text-gray-500 font-bold uppercase text-xs"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreate}
                className="flex-[2] py-2 bg-blue-600 text-white rounded-xl font-bold uppercase text-xs shadow-lg"
              >
                Crear Sesión
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
        {sessions.length === 0 ? (
          <div className="text-center py-10 text-gray-500 italic">
            No tienes sesiones guardadas. ¡Crea una para empezar!
          </div>
        ) : (
          sessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer overflow-hidden min-h-[90px]"
              onClick={() => onSelect(session.id)}
            >
              <AnimatePresence mode="wait">
                {sessionToDelete === session.id ? (
                  <motion.div 
                    key="confirm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-red-950/90 backdrop-blur-md flex items-center justify-center gap-6 z-20 px-4"
                  >
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex-1">¿Borrar sesión permanentemente?</p>
                    <div className="flex gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSessionToDelete(null);
                        }}
                        className="px-4 py-2 text-gray-300 font-bold uppercase text-[9px] hover:text-white"
                      >
                        No
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(session.id);
                          setSessionToDelete(null);
                        }}
                        className="px-5 py-2 bg-white text-red-600 rounded-xl font-black uppercase text-[9px] shadow-xl"
                      >
                        Confirmar
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-5 flex items-center justify-between w-full h-full"
                  >
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">{session.name}</h3>
                      <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(session.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {session.players.length} Jugadores
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSessionToDelete(session.id);
                        }}
                        className="p-2 text-gray-600 hover:text-red-500 transition-colors opacity-50 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-500/20">
                        <Play className="w-5 h-5 fill-current" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
