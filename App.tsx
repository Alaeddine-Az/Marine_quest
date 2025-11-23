
import React, { useState, useEffect } from 'react';
import Lobby from './components/Lobby';
import Game from './components/Game';
import PlayerView from './components/PlayerView';
import { Team, CardData, GamePhase } from './types';
import { socketService } from './services/socketService';

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.LOBBY);
  const [teams, setTeams] = useState<Team[]>([]);
  const [cards, setCards] = useState<CardData[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isPlayerMode, setIsPlayerMode] = useState(false);

  const [gameKey, setGameKey] = useState(0);
  const [clientName, setClientName] = useState('');
  const [clientLogo, setClientLogo] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) {
      setRoomId(room);
      setIsPlayerMode(true);
    }
  }, []);

  const startGame = (gameTeams: Team[], gameCards: CardData[], gameRoomId: string | null, name: string, logo: string | null) => {
    setTeams(gameTeams);
    setCards(gameCards);
    setRoomId(gameRoomId);
    setClientName(name);
    setClientLogo(logo);
    setPhase(GamePhase.PLAYING);
    setGameKey(prev => prev + 1); // Force remount
  };

  const resetGame = () => {
    // Disconnect socket to ensure fresh start
    socketService.disconnect();

    setPhase(GamePhase.LOBBY);
    setTeams([]);
    setCards([]);
    setRoomId(null);
    setClientName('');
    setClientLogo(null);

    // Clean URL params for host so they are truly back at "home"
    if (!isPlayerMode) {
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        // Ignore security errors in sandboxed environments (e.g. blob URLs)
        console.warn("Navigation update suppressed in sandbox.");
      }
    }
  };

  if (isPlayerMode && roomId) {
    return <PlayerView roomId={roomId} />;
  }

  return (
    <>
      {phase === GamePhase.LOBBY && <Lobby onStartGame={startGame} />}
      {(phase === GamePhase.PLAYING || phase === GamePhase.VICTORY) && (
        <Game key={gameKey} teams={teams} cards={cards} onReset={resetGame} roomId={roomId} clientName={clientName} clientLogo={clientLogo} />
      )}
    </>
  );
};

export default App;
