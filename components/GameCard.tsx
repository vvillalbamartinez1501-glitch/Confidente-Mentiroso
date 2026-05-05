'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GameImage } from '../lib/imageLoader';

interface GameCardProps {
  image: GameImage | null;
  isHidden?: boolean;
}

export function GameCard({ image, isHidden = false }: GameCardProps) {
  if (!image) return (
    <div className="w-full aspect-[4/3] max-w-md mx-auto glass-panel rounded-2xl flex items-center justify-center animate-pulse">
      <div className="text-gray-400">Cargando...</div>
    </div>
  );

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, rotateY: 90 }}
      animate={{ scale: 1, opacity: 1, rotateY: isHidden ? 180 : 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
      className="relative w-full aspect-[4/3] max-w-md mx-auto perspective-1000"
    >
      <div className={`w-full h-full rounded-2xl overflow-hidden glass-panel shadow-[0_0_15px_rgba(255,255,255,0.1)] ${isHidden ? 'bg-gray-800' : ''}`}>
        {!isHidden ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={image.url} 
              alt={image.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-lg font-bold drop-shadow-md capitalize">
                {image.category === 'flags' ? 'Bandera' : image.category}
              </p>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1a1d2d]">
            <div className="text-4xl">❓</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
