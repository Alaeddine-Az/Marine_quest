
import React, { useState, useEffect, useRef } from 'react';
import { Team, CardData, CardType, LogEntry, TurnPhase, SyncState, InsightData } from '../types';
import gsap from 'gsap';
import Ship from './Ship';
import Card from './Card';
import TreasureMapReport from './TreasureMapReport';
import { generatePirateReaction, generateTreasureMapSummary, generateCaptainsOrders } from '../services/geminiService';
import { audioPlayer } from '../services/audioService';
import { socketService } from '../services/socketService';

interface GameProps {
  teams: Team[];
  cards: CardData[];
  onReset: () => void;
  roomId: string | null;
  clientName: string;
  clientLogo: string | null;
}

const Game: React.FC<GameProps> = ({ teams: initialTeams, cards, onReset, roomId, clientName, clientLogo }) => {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [deck, setDeck] = useState<CardData[]>([...cards].sort(() => Math.random() - 0.5));
  const [currentCard, setCurrentCard] = useState<CardData | null>(null);

  // Game State
  const [phase, setPhase] = useState<TurnPhase>(TurnPhase.DRAW);
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Inputs & Interactions
  const [userInput, setUserInput] = useState('');
  const [votes, setVotes] = useState<{ up: number, down: number }>({ up: 0, down: 0 });
  const [isThinking, setIsThinking] = useState(false);
  const [narratorText, setNarratorText] = useState<string | null>("Welcome aboard the S.S. Insight! Draw a card to begin our voyage.");
  const [victoryData, setVictoryData] = useState<string | null>(null);
  const [captainsOrders, setCaptainsOrders] = useState<string>('');
  const [particles, setParticles] = useState<{ id: number, x: number, y: number, char: string }[]>([]);

  // Refs for data collection
  // Refs for data collection
  const insights = useRef<InsightData[]>([]);

  // Refs for audio state
  const hasPlayedVictory = useRef(false);

  // --- Socket Listeners ---
  useEffect(() => {
    if (roomId) {
      const socket = socketService.connect();

      socketService.onPlayerAction((data: any) => {
        const { text, teamId } = data;
        // Only accept action if it is the active team's turn OR free-for-all (simplified to active team here)
        // For demo, we accept any input and treat it as the submission
        addLog(`Incoming transmission from crew!`, 'action');
        setUserInput(text);
        handleActionSubmit(text);
      });

      socketService.onPlayerVote((direction: 'up' | 'down') => {
        setVotes(prev => {
          const newVotes = { ...prev, [direction]: prev[direction] + 1 };
          // Trigger particles
          triggerParticles(direction === 'up' ? "🔥" : "🌧️", 2);
          return newVotes;
        });
      });
    }
  }, [roomId]);

  // --- Sync State to Players ---
  useEffect(() => {
    if (roomId) {
      const state: SyncState = {
        phase,
        currentCard,
        narratorText,
        teamName: teams[activeTeamIndex]?.name || "Unknown"
      };
      socketService.syncState(roomId, state);
    }
  }, [phase, currentCard, narratorText, activeTeamIndex, roomId]);

  // --- Helpers & Actions (Hoisted for usage) ---
  const addLog = (message: string, type: LogEntry['type']) => {
    setLogs(prev => [...prev, { id: Date.now().toString(), message, type, timestamp: Date.now() }]);
  };

  const triggerParticles = (char: string, count = 20) => {
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      char
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 2000);
  };

  const handleRestart = () => {
    if (window.confirm("Are you sure you want to abandon the current voyage and return to the harbor? All progress will be lost.")) {
      onReset();
    }
  };

  const drawCard = async () => {
    if (isThinking) return;

    if (deck.length === 0) {
      finishGame();
      return;
    }

    const card = deck[0];
    setDeck(prev => prev.slice(1));
    setCurrentCard(card);
    setPhase(TurnPhase.REVEALED);
    setUserInput('');
    setVotes({ up: 0, down: 0 });

    // Narrator reaction (Text only for cards now)
    setNarratorText(getNarratorTextForType(card.type));
    setIsThinking(false);

    // Auto-advance logic based on type
    if (card.type === CardType.ROSE) {
      setTimeout(() => {
        triggerParticles("🌹");
        insights.current.push({
          card,
          userInput: '',
          votes: { up: 0, down: 0 },
          submitter: teams[activeTeamIndex]?.name
        });
        updateScore(5);
        addLog(`Rose acknowledged! +5 Doubloons`, 'system');
        setPhase(TurnPhase.SCORING); // Skip action/voting
      }, 4000); // Wait for animation/audio
    } else {
      // Move to action phase after reveal animation
      setTimeout(() => setPhase(TurnPhase.ACTION), 2000);
    }
  };

  const getNarratorTextForType = (type: CardType) => {
    switch (type) {
      case CardType.ROSE: return "Ah, a fair wind fills our sails! Well done, mates!";
      case CardType.THORN: return "Batten down the hatches! A storm approaches. How do we survive?";
      case CardType.BUD: return "I spy gold on the horizon! What treasure awaits us?";
      default: return "The sea is mysterious today...";
    }
  };

  const updateScore = (points: number) => {
    const newTeams = [...teams];
    if (newTeams[activeTeamIndex]) {
      newTeams[activeTeamIndex].score += points;
      setTeams(newTeams);
    }
  };

  const finishGame = async () => {
    setPhase(TurnPhase.DRAW); // Hide cards
    setIsThinking(true);
    setNarratorText("The voyage ends! Compiling the ship's log...");

    try {
      // Prepare data for AI summary
      const roses = insights.current.filter(i => i.card.type === CardType.ROSE).map(i => i.card.content);
      const thorns = insights.current.filter(i => i.card.type === CardType.THORN).map(i => `${i.card.content} -> ${i.userInput}`);
      const buds = insights.current.filter(i => i.card.type === CardType.BUD).map(i => `${i.card.content} -> ${i.userInput}`);

      const summary = await generateTreasureMapSummary(roses, thorns, buds);

      // Generate Captain's Orders
      const winningTeam = [...teams].sort((a, b) => b.score - a.score)[0]?.name || "Unknown Crew";
      const topBud = insights.current.filter(i => i.card.type === CardType.BUD).sort((a, b) => b.votes.up - a.votes.up)[0]?.userInput || "Hidden Treasure";
      const orders = await generateCaptainsOrders(clientName || "The Crew", winningTeam, topBud);
      setCaptainsOrders(orders);

      setVictoryData("REPORT_READY");

      // Generate audio for the summary
      if (!hasPlayedVictory.current) {
        hasPlayedVictory.current = true;
        const audioBuffer = await generatePirateReaction(CardType.ROSE, "The voyage is complete! Here is your treasure map of insights: " + summary.substring(0, 100) + "...");
        if (audioBuffer) {
          audioPlayer.playBuffer(audioBuffer);
        }
      }
    } catch (e) {
      console.error("Error generating victory summary/audio", e);
    } finally {
      setIsThinking(false);
    }
  };

  const handleActionSubmit = (text: string = userInput) => {
    if (!text.trim()) return;
    if (phase !== TurnPhase.ACTION) return;
    setPhase(TurnPhase.VOTING);
    addLog(`Crew submitted proposal`, 'action');
  };

  const handleVote = (direction: 'up' | 'down') => {
    setVotes(prev => ({ ...prev, [direction]: prev[direction] + 1 }));
    triggerParticles(direction === 'up' ? "🔥" : "🌧️", 5);
  };

  const resolveTurn = () => {
    if (!currentCard) return;

    let points = 0;
    const totalVotes = votes.up + votes.down;
    const approvalRate = totalVotes > 0 ? votes.up / totalVotes : 0;

    if (currentCard.type === CardType.THORN) {
      points = 10;
      if (approvalRate > 0.5) points += 5;
      triggerParticles("⚔️");
    } else if (currentCard.type === CardType.BUD) {
      points = 15;
      if (votes.up > 5) points += 10;
      else if (votes.up > 2) points += 5;
      triggerParticles("💎");
    }

    // Record Insight
    insights.current.push({
      card: currentCard,
      userInput,
      votes: { ...votes },
      submitter: teams[activeTeamIndex]?.name
    });

    updateScore(points);
    addLog(`Turn resolved! +${points} Doubloons`, 'system');
    setPhase(TurnPhase.SCORING);
  };

  const endTurn = () => {
    setCurrentCard(null);
    setPhase(TurnPhase.DRAW);
    setActiveTeamIndex((prev) => (prev + 1) % teams.length);
  };

  const getProgress = () => {
    const totalCards = cards.length > 0 ? cards.length : 1;
    const completedCards = totalCards - deck.length;
    const pct = (completedCards / totalCards) * 100;
    return Math.min(100, Math.max(0, pct));
  };

  // --- Render ---
  if (victoryData) {
    return (
      <TreasureMapReport
        insights={insights.current}
        clientName={clientName}
        clientLogo={clientLogo}
        captainsOrders={captainsOrders}
        onReset={onReset}
      />
    );
  }

  return (
    <div className="relative min-h-screen ocean-bg text-parchment overflow-hidden flex flex-col">

      {/* Top HUD - Glass Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-start pointer-events-none">
        <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-6 pointer-events-auto shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black/30 rounded-full flex items-center justify-center text-2xl border border-gold/50 shadow-inner">
              {teams[activeTeamIndex].avatar}
            </div>
            <div>
              <p className="text-xs text-gold uppercase tracking-widest">Captain</p>
              <p className="font-bold text-white text-lg leading-none">{teams[activeTeamIndex].name}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10"></div>
          <div className="text-center">
            <p className="text-xs text-blue-200 uppercase tracking-widest">Cards Left</p>
            <p className="font-pirate text-2xl text-white leading-none">{deck.length}</p>
          </div>
        </div>

        <div className="glass-panel px-4 py-2 rounded-full pointer-events-auto flex gap-2">
          <button onClick={handleRestart} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition" title="Restart Voyage">
            <i className="fa-solid fa-rotate-right"></i>
          </button>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="flex-grow relative z-20 flex items-center justify-center p-4">

        {/* Phase: Draw */}
        {phase === TurnPhase.DRAW && (
          <div className="text-center animate-float">
            <button
              onClick={drawCard}
              disabled={isThinking}
              className={`group relative w-64 h-96 bg-wood-texture rounded-xl border-8 border-wood-light shadow-2xl transform transition ${isThinking ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:rotate-1'}`}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <i className={`fa-solid fa-dharmachakra text-6xl text-gold opacity-80 mb-4 ${isThinking ? 'animate-spin' : 'group-hover:animate-spin'}`}></i>
                <span className="font-pirate text-3xl text-parchment drop-shadow-md">{isThinking ? "FINISHING..." : "DRAW CARD"}</span>
              </div>
            </button>
            <p className="mt-4 text-gray-400 animate-pulse">The deck awaits...</p>
          </div>
        )}

        {/* Phase: Revealed/Action/Voting */}
        {phase !== TurnPhase.DRAW && currentCard && (
          <div className="flex flex-col md:flex-row items-center gap-12 max-w-6xl w-full">

            {/* The Card */}
            <div className={`flex-shrink-0 transition-all duration-500 ${phase === TurnPhase.REVEALED ? 'scale-110' : 'scale-100'}`}>
              <Card
                data={currentCard}
                isRevealed={true}
                onClick={() => { }}
              />
            </div>

            {/* Interaction Panel */}
            {phase !== TurnPhase.SCORING && currentCard.type !== CardType.ROSE && (
              <div className="flex-grow w-full max-w-xl animate-slide-up">
                <div className="glass-panel p-6 rounded-xl shadow-2xl relative overflow-hidden">
                  {/* Glow effect behind */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gold/5 blur-3xl -z-10"></div>

                  {/* Input Phase */}
                  {phase === TurnPhase.ACTION && (
                    <>
                      <h3 className="text-xl font-pirate text-gold mb-4 text-glow-gold">
                        {currentCard.type === CardType.THORN ? "Identify the solution, mates!" : "Pitch your idea for treasure!"}
                      </h3>
                      <textarea
                        className="w-full bg-black/30 text-white border border-white/10 rounded p-4 mb-4 focus:ring-2 focus:ring-gold outline-none resize-none h-32 backdrop-blur-sm font-serif text-lg italic"
                        placeholder={roomId ? "Waiting for crew submission from mobile..." : "Type here..."}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        readOnly={!!roomId}
                        onKeyDown={(e) => { if (!roomId && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleActionSubmit(); } }}
                      />
                      <button
                        onClick={() => handleActionSubmit()}
                        disabled={!userInput.trim()}
                        className="w-full glass-button text-gold font-bold py-3 rounded hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg border border-gold/30"
                      >
                        {roomId ? "LOCK IN CREW ANSWER" : "SUBMIT TO CREW"}
                      </button>
                    </>
                  )}

                  {/* Voting Phase */}
                  {phase === TurnPhase.VOTING && (
                    <div className="text-center relative z-10">
                      <div className="absolute inset-0 bg-black/40 rounded-xl -z-10 blur-sm"></div>

                      <h3 className="text-3xl font-pirate text-white mb-2 text-glow-gold drop-shadow-lg">Cast Yer Votes!</h3>
                      <div className="h-1 w-32 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6 opacity-50"></div>

                      <p className="text-gold italic mb-8 text-lg px-8">"{userInput}"</p>

                      <div className="flex justify-center gap-12">
                        <button
                          onClick={() => handleVote('down')}
                          className="flex flex-col items-center gap-3 group"
                        >
                          <div className="w-20 h-20 bg-gradient-to-br from-rose-900 to-rose-700 rounded-full flex items-center justify-center text-4xl border-4 border-rose-500/50 group-hover:border-rose-400 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(244,63,94,0.6)] transition-all duration-300 shadow-lg backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            👎
                          </div>
                          <span className="font-bold text-rose-200 text-lg group-hover:text-rose-100 transition">Nay ({votes.down})</span>
                        </button>

                        <button
                          onClick={() => handleVote('up')}
                          className="flex flex-col items-center gap-3 group"
                        >
                          <div className="w-20 h-20 bg-gradient-to-br from-emerald-800 to-emerald-600 rounded-full flex items-center justify-center text-4xl border-4 border-emerald-500/50 group-hover:border-emerald-400 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.6)] transition-all duration-300 shadow-lg backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            🔥
                          </div>
                          <span className="font-bold text-emerald-200 text-lg group-hover:text-emerald-100 transition">Aye ({votes.up})</span>
                        </button>
                      </div>

                      <button
                        onClick={resolveTurn}
                        className="mt-10 text-sm text-gray-400 hover:text-gold transition-colors border-b border-transparent hover:border-gold pb-1"
                      >
                        Close Voting & Score
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Scoring/Transition Phase */}
            {phase === TurnPhase.SCORING && (
              <div className="flex-grow flex flex-col items-center justify-center animate-pulse">
                <h2 className="text-4xl font-pirate text-gold mb-4 drop-shadow-md text-glow-gold">Round Complete!</h2>
                <button
                  onClick={endTurn}
                  className="px-8 py-3 glass-button text-white text-xl font-bold rounded hover:bg-white/10 shadow-lg transform transition hover:scale-105 border border-gold/50"
                >
                  Next Card <i className="fa-solid fa-arrow-right ml-2"></i>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar: Leaderboard (Absolute Right) */}
      {roomId && (
        <div className="absolute right-4 top-48 w-64 z-20 hidden lg:block leaderboard-panel">
          <div className="glass-panel rounded-lg p-4 shadow-high-contrast">
            <h3 className="font-pirate text-gold text-center mb-4 border-b border-white/10 pb-2 text-glow-gold">Crew Standings</h3>
            <ul className="space-y-2">
              {[...teams].sort((a, b) => b.score - a.score).map((team, idx) => (
                <li key={team.id} className="flex justify-between items-center text-sm p-2 rounded hover:bg-white/5 transition border-b border-white/5 last:border-0">
                  <span className="flex items-center gap-2 text-gray-300">
                    <span className="text-xs w-4 text-gray-500">#{idx + 1}</span>
                    {team.name}
                  </span>
                  <span className="font-bold text-gold">{team.score}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Bottom: Ocean & Ship Progress */}
      <div className="relative h-32 z-10 mt-auto">
        <Ship progress={getProgress()} />
        <div className="absolute bottom-0 w-full h-24 wave-layer opacity-60 animate-wave"></div>
        <div className="absolute -bottom-4 w-full h-32 wave-layer opacity-40 animate-wave-slow bg-left-bottom"></div>
      </div>

      {/* Particle Layer */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute text-4xl pointer-events-none animate-float"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animationDuration: '2s'
          }}
        >
          {p.char}
        </div>
      ))}

    </div>
  );
};

export default Game;
