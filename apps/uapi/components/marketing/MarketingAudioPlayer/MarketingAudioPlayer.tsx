"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioPlayerProps {
  src: string;
  songName: string;
}

export default function MarketingAudioPlayer({ src, songName }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  return (
    <button
      type="button"
      onClick={togglePlay}
      className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors duration-200 dark:text-gray-400 dark:hover:text-gray-200"
    >
      <div className="flex-shrink-0">
        <AnimatePresence initial={false} mode="wait">
          {isPlaying ? (
            <motion.svg
              key="pause"
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              initial={{ opacity: 0, rotateX: -90 }}
              animate={{ opacity: 1, rotateX: 0 }}
              exit={{ opacity: 0, rotateX: 90 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </motion.svg>
          ) : (
            <motion.svg
              key="play"
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              initial={{ opacity: 0, rotateX: -90 }}
              animate={{ opacity: 1, rotateX: 0 }}
              exit={{ opacity: 0, rotateX: 90 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <polygon points="5,3 19,12 5,21" />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>
      <motion.span
        className="text-xs font-light tracking-tight"
        initial={false}
        animate={{ opacity: isPlaying ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {songName}
      </motion.span>
      <audio ref={audioRef} src={src} className="hidden" />
    </button>
  );
}