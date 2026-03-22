import { useEffect, useRef } from 'react';
import { createGame, destroyGame } from './game';

function App() {
  const gameInitialized = useRef(false);

  useEffect(() => {
    // Prevent double-initialization in React StrictMode
    if (gameInitialized.current) return;
    gameInitialized.current = true;

    createGame();

    return () => {
      destroyGame();
      gameInitialized.current = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">
        🎮 Tanks
      </h1>
      <div 
        id="game-container" 
        className="rounded-lg overflow-hidden shadow-2xl border-2 border-slate-700"
      />
      <div className="mt-4 flex gap-4 flex-wrap justify-center">
        <div className="px-3 py-1 bg-slate-700 rounded text-slate-300 text-xs">
          WASD/Arrows: Move
        </div>
        <div className="px-3 py-1 bg-slate-700 rounded text-slate-300 text-xs">
          Mouse: Aim
        </div>
        <div className="px-3 py-1 bg-slate-700 rounded text-slate-300 text-xs">
          Click: Fire
        </div>
      </div>
    </div>
  );
}

export default App;
