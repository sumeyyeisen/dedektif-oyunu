import { useState } from 'react';

export const useGameState = () => {
  const [gameState, setGameState] = useState('menu');
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [currentStory, setCurrentStory] = useState(null);
  const [messages, setMessages] = useState([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [showAnswer, setShowAnswer] = useState(false);

  const resetGame = () => {
    setGameState('menu');
    setGameMode(null);
    setDifficulty(null);
    setCurrentStory(null);
    setMessages([]);
    setHintsUsed(0);
    setStartTime(null);
    setShowAnswer(false);
  };

  return {
    gameState,
    setGameState,
    gameMode,
    setGameMode,
    difficulty,
    setDifficulty,
    currentStory,
    setCurrentStory,
    messages,
    setMessages,
    hintsUsed,
    setHintsUsed,
    startTime,
    setStartTime,
    now,
    setNow,
    showAnswer,
    setShowAnswer,
    resetGame,
  };
};
