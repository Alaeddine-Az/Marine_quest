import React, { useState, useEffect } from 'react';
import { Team, TurnPhase, CardType, SyncState } from '../types';
import { socketService } from '../services/socketService';
import { PIRATE_AVATARS } from '../constants';

interface PlayerViewProps {
  roomId: string;
}

const PlayerView: React.FC<PlayerViewProps> = ({ roomId }) => {
  const [team, setTeam] = useState<Team | null>(null);
  const [inputName, setInputName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PIRATE_AVATARS[0]);
  const [gameState, setGameState] = useState<SyncState | null>(null);
  const [playerInput, setPlayerInput] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const socket = socketService.connect();

    socketService.onStateUpdate((state: SyncState) => {
      setGameState(state);
      // Reset local submission state on phase change to action
      if (state.phase === TurnPhase.ACTION || state.phase === TurnPhase.DRAW) {
        setHasSubmitted(false);
        setPlayerInput('');
      }
      if (state.phase === TurnPhase.VOTING) {
        setHasVoted(false);
      }
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleJoin = () => {
    if (!inputName.trim()) return;
    const newTeam: Team = {
      id: Date.now().toString(),
      name: inputName,
      score: 0,
      avatar: selectedAvatar
    };
    setTeam(newTeam);
    socketService.joinRoom(roomId, newTeam);
  };

  const handleSubmitAction = () => {
    if (!team || !playerInput.trim()) return;
    socketService.sendAction(roomId, playerInput, team.id);
    setHasSubmitted(true);
  };

  const handleVote = (direction: 'up' | 'down') => {
    if (hasVoted) return;
    socketService.sendVote(roomId, direction);
    setHasVoted(true);
  };

  if (!team) {
    return (
      <div className="min-h-screen ocean-bg flex flex-col items-center justify-center p-4 text-parchment">
         <div className="bg-wood-dark border-4 border-wood p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
            <h1 className="font-pirate text-3xl text-gold mb-6">Join Crew</h1>
            <div className="flex justify-center gap-4 mb-6 flex-wrap">
                {PIRATE_AVATARS.slice(0,5).map(av => (
                   <button 
                    key={av} 
                    onClick={() => setSelectedAvatar(av)}
                    className={`text-3xl p-2 rounded transition ${selectedAvatar === av ? 'bg-gold/20 scale-125' : 'opacity-50'}`}
                   >
                       {av}
                   </button>
                ))}
            </div>
            <input 
              type="text" 
              placeholder="Crew Name"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="w-full bg-black/30 border border-wood-light p-3 rounded text-center text-xl mb-6 text-white"
            />
            <button 
              onClick={handleJoin}
              className="w-full bg-rose-700 text-white font-pirate text-2xl py-3 rounded hover:bg-rose-600"
            >
                Board Ship
            </button>
            <p className="mt-4 text-xs text-gray-400">Room Code: {roomId}</p>
         </div>
      </div>
    );
  }

  if (!gameState) {
    return (
        <div className="min-h-screen ocean-bg flex items-center justify-center text-parchment">
            <div className="text-center animate-pulse">
                <i className="fa-solid fa-anchor text-4xl mb-4"></i>
                <p>Waiting for the Captain...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen ocean-bg flex flex-col p-4 text-parchment relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-wood-dark p-3 rounded-lg shadow-lg mb-6 relative z-10">
            <div className="flex items-center gap-2">
                <span className="text-2xl">{team.avatar}</span>
                <span className="font-bold">{team.name}</span>
            </div>
            <div className="text-xs bg-black/30 px-2 py-1 rounded">Room: {roomId}</div>
        </div>

        {/* Main Content */}
        <div className="flex-grow flex flex-col items-center justify-center relative z-10">
            
            {gameState.phase === TurnPhase.DRAW && (
                <div className="text-center opacity-80">
                    <p className="text-xl mb-2">Eyes on the main screen!</p>
                    <i className="fa-solid fa-eye text-4xl animate-bounce"></i>
                </div>
            )}

            {gameState.phase === TurnPhase.ACTION && (
                <div className="w-full max-w-md">
                     {gameState.currentCard?.type === CardType.ROSE ? (
                         <div className="text-center">
                             <i className="fa-solid fa-champagne-glasses text-5xl text-emerald-400 mb-4"></i>
                             <h2 className="text-2xl font-pirate text-emerald-200">Smooth Sailing!</h2>
                             <p>Celebrate the victory!</p>
                         </div>
                     ) : (
                         !hasSubmitted ? (
                            <div className="animate-slide-up">
                                <label className="block text-gold font-pirate text-xl mb-2">
                                    {gameState.currentCard?.type === CardType.THORN ? "Proposed Solution:" : "Buried Treasure Idea:"}
                                </label>
                                <textarea 
                                    value={playerInput}
                                    onChange={(e) => setPlayerInput(e.target.value)}
                                    className="w-full h-40 bg-parchment-texture text-black font-serif p-4 rounded border-4 border-wood mb-4 text-lg"
                                    placeholder="Write yer thoughts here..."
                                />
                                <button 
                                    onClick={handleSubmitAction}
                                    className="w-full bg-gold text-wood-dark font-bold py-4 rounded text-xl shadow-lg"
                                >
                                    Send to Captain
                                </button>
                            </div>
                         ) : (
                             <div className="text-center">
                                 <i className="fa-solid fa-paper-plane text-4xl text-gold mb-4 animate-pulse"></i>
                                 <p className="text-xl">Sent! Awaiting the crew...</p>
                             </div>
                         )
                     )}
                </div>
            )}

            {gameState.phase === TurnPhase.VOTING && (
                <div className="w-full max-w-md text-center">
                     <h3 className="text-2xl font-pirate mb-8">Vote on the proposal!</h3>
                     {!hasVoted ? (
                         <div className="flex justify-center gap-6">
                             <button onClick={() => handleVote('down')} className="flex-1 bg-rose-800 py-8 rounded-xl border-2 border-rose-500 active:scale-95 transition">
                                 <span className="text-5xl">👎</span>
                                 <span className="block mt-2 font-bold">Nay</span>
                             </button>
                             <button onClick={() => handleVote('up')} className="flex-1 bg-emerald-700 py-8 rounded-xl border-2 border-emerald-500 active:scale-95 transition">
                                 <span className="text-5xl">🔥</span>
                                 <span className="block mt-2 font-bold">Aye!</span>
                             </button>
                         </div>
                     ) : (
                         <div className="text-emerald-400 text-xl font-bold">
                             Vote Cast!
                         </div>
                     )}
                </div>
            )}

            {gameState.phase === TurnPhase.SCORING && (
                 <div className="text-center">
                     <h2 className="text-3xl font-pirate text-gold mb-4">Round Ended</h2>
                     <p>Check the scoreboard!</p>
                 </div>
            )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 wave-layer opacity-20"></div>
    </div>
  );
};

export default PlayerView;