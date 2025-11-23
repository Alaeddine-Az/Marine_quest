
import React, { useState, useEffect, useRef } from 'react';
import { Team, CardData, CardType } from '../types';
import { PIRATE_AVATARS, DEFAULT_CARDS, SAMPLE_TEAMS } from '../constants';
import { socketService } from '../services/socketService';
import { generatePirateReaction } from '../services/geminiService';
import { audioPlayer } from '../services/audioService';
import gsap from 'gsap';

interface LobbyProps {
    onStartGame: (teams: Team[], cards: CardData[], roomId: string | null, clientName: string, clientLogo: string | null) => void;
}

const Lobby: React.FC<LobbyProps> = ({ onStartGame }) => {
    const [teams, setTeams] = useState<Team[]>(SAMPLE_TEAMS);
    const [newTeamName, setNewTeamName] = useState('');
    const [clientName, setClientName] = useState('');
    const [clientLogo, setClientLogo] = useState<string | null>(null);
    const [cardsJson, setCardsJson] = useState(JSON.stringify(DEFAULT_CARDS, null, 2));
    const [isMapEditorOpen, setIsMapEditorOpen] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(PIRATE_AVATARS[0]);

    // Multiplayer State
    const [roomId, setRoomId] = useState<string | null>(null);
    const [isMultiplayer, setIsMultiplayer] = useState(false);

    useEffect(() => {
        if (isMultiplayer && !roomId) {
            // Generate a random 4-char room ID
            const newId = Math.random().toString(36).substring(2, 6).toUpperCase();
            setRoomId(newId);
            socketService.connect();
            socketService.createRoom(newId);

            // Listen for players joining
            socketService.onPlayerJoined((team) => {
                setTeams(prev => {
                    // Avoid duplicates
                    if (prev.find(t => t.id === team.id)) return prev;
                    return [...prev, team];
                });
            });
            // Clear sample teams when entering multiplayer mode properly
            setTeams([]);
        }
    }, [isMultiplayer, roomId]);

    // --- Welcome Audio ---
    const hasPlayedWelcome = useRef(false);

    useEffect(() => {
        const playWelcome = async () => {
            if (teams.length === 0) {
                hasPlayedWelcome.current = false;
                return;
            }

            if (hasPlayedWelcome.current) return;

            hasPlayedWelcome.current = true;
            try {
                const welcomeText = "Ahoy! Welcome aboard the S.S. Insight! I am Captain Morgana. Assemble your crew, for we set sail shortly!";
                const audioBuffer = await generatePirateReaction(CardType.ROSE, welcomeText);
                if (audioBuffer) {
                    audioPlayer.playBuffer(audioBuffer);
                }
            } catch (e) {
                console.error("Failed to play welcome audio", e);
            }
        };

        playWelcome();
    }, [teams]);

    const addTeam = () => {
        if (!newTeamName.trim()) return;
        const newTeam: Team = {
            id: Date.now().toString(),
            name: newTeamName,
            score: 0,
            avatar: selectedAvatar,
        };
        setTeams([...teams, newTeam]);
        setNewTeamName('');
        setSelectedAvatar(PIRATE_AVATARS[Math.floor(Math.random() * PIRATE_AVATARS.length)]);
    };

    const removeTeam = (id: string) => {
        setTeams(teams.filter(t => t.id !== id));
    };

    const handleStart = () => {
        try {
            const parsedCards = JSON.parse(cardsJson);
            onStartGame(teams, parsedCards, roomId, clientName, clientLogo);
        } catch (e) {
            alert("Invalid JSON for map data! Check your syntax.");
        }
    };

    const triggerEasterEgg = () => {
        const rose = DEFAULT_CARDS.find(c => c.type === CardType.ROSE);
        const thorn = DEFAULT_CARDS.find(c => c.type === CardType.THORN);
        const bud = DEFAULT_CARDS.find(c => c.type === CardType.BUD);

        const miniDeck = [rose, thorn, bud].filter(Boolean) as CardData[];

        // If teams are empty (e.g. just switched to host but no one joined), use sample
        // or current state. 
        let gameTeams = teams;
        if (gameTeams.length === 0 && !roomId) gameTeams = SAMPLE_TEAMS;

        onStartGame(gameTeams, miniDeck, roomId, "Dev Mode Client", null);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setClientLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const joinUrl = roomId ? `${window.location.origin}?room=${roomId}` : '';

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden text-parchment">
            {/* Hero / Header */}
            <header className="relative z-10 py-8 text-center space-y-2 bg-gradient-to-b from-sea-900 to-transparent">
                <div className="inline-block animate-float-slow cursor-pointer" onClick={triggerEasterEgg} title="Quick Start (Dev Mode)">
                    <i className="fa-solid fa-anchor text-gold text-5xl drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] hover:text-white transition-colors"></i>
                </div>
                <h1 className="text-6xl md:text-7xl font-pirate text-transparent bg-clip-text bg-gradient-to-b from-gold to-wood-light drop-shadow-xl">
                    Maritime Quest
                </h1>
                <p className="text-xl font-serif italic text-blue-200 max-w-2xl mx-auto">
                    "Turn your retrospective into a legendary voyage on the S.S. Insight!"
                </p>
            </header>

            {/* Main Content Grid */}
            <main className="relative z-10 container mx-auto px-4 flex-grow grid grid-cols-1 md:grid-cols-12 gap-8 pb-12">

                {/* Left Col: Join Info */}
                <div className="md:col-span-4 flex flex-col gap-6">

                    {/* Mode Toggle */}
                    <div className="flex glass-panel p-1 rounded-lg mb-2">
                        <button
                            onClick={() => { setIsMultiplayer(false); setTeams(SAMPLE_TEAMS); }}
                            className={`flex-1 py-2 rounded transition-all ${!isMultiplayer ? 'bg-wood text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Simulation
                        </button>
                        <button
                            onClick={() => setIsMultiplayer(true)}
                            className={`flex-1 py-2 rounded transition-all ${isMultiplayer ? 'bg-wood text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Multiplayer Host
                        </button>
                    </div>

                    <div className="glass-panel rounded-xl p-6 transform rotate-1 hover:rotate-0 transition duration-300 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                        <h3 className="text-2xl font-pirate text-gold mb-4 text-center border-b border-white/10 pb-2 text-glow-gold">Recruit Crew</h3>
                        <div className="flex flex-col items-center justify-center space-y-4 bg-black/20 p-6 rounded-lg border border-white/5">
                            {isMultiplayer && roomId ? (
                                <>
                                    <div className="bg-white p-2 rounded-lg shadow-lg">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(joinUrl)}`}
                                            alt="Join QR"
                                            className="w-32 h-32"
                                        />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-300">Join at:</p>
                                        <a href={joinUrl} target="_blank" className="font-mono text-gold text-xs block mb-2 hover:underline truncate w-48">{joinUrl}</a>
                                        <p className="font-mono text-white bg-sea-700/50 px-4 py-2 rounded text-2xl font-bold tracking-widest border border-gold/30">{roomId}</p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-gray-400 italic py-8">
                                    <p>Enable Multiplayer Host to generate Room Code.</p>
                                    <p className="text-xs mt-2">(Requires server.js running)</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Map Data Config */}
                    <div className="glass-panel rounded-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-pirate text-blue-200 text-glow-gold"><i className="fa-solid fa-map-location-dot mr-2"></i> Voyage Data</h3>
                            <button onClick={() => setIsMapEditorOpen(true)} className="text-sm text-gold hover:underline">Edit Map</button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400 uppercase tracking-wider">Client / Ship Name</label>
                                <input
                                    type="text"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    placeholder="e.g. Acme Corp"
                                    className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white focus:border-gold focus:outline-none text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400 uppercase tracking-wider">Client Logo</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-wood file:text-white hover:file:bg-wood-light"
                                />
                                {clientLogo && <p className="text-xs text-emerald-400"><i className="fa-solid fa-check"></i> Logo uploaded</p>}
                            </div>
                            <div className="text-sm text-gray-300 space-y-2 pt-2 border-t border-white/10">
                                <p><i className="fa-solid fa-layer-group text-emerald-400 w-6"></i> {JSON.parse(cardsJson).length} cards loaded</p>
                                <p><i className="fa-solid fa-infinity text-rose-400 w-6"></i> Untimed</p>
                                <p><i className="fa-solid fa-trophy text-gold w-6"></i> Goal: Treasure Island</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: Crew Registry */}
                <div className="md:col-span-8 flex flex-col gap-6">
                    <div className="glass-panel rounded-xl p-6 flex-grow relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <i className="fa-solid fa-scroll text-9xl text-white"></i>
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-white/10 pb-4 gap-4 relative z-10">
                            <h2 className="text-3xl font-pirate text-parchment text-glow-gold">Ship's Manifest</h2>

                            {/* Quick Add Crew Form (Local) */}
                            <div className="flex glass-button p-1 rounded-lg">
                                <button className="px-3 py-2 text-2xl hover:scale-110 transition" title="Change Avatar" onClick={() => setSelectedAvatar(PIRATE_AVATARS[Math.floor(Math.random() * PIRATE_AVATARS.length)])}>
                                    {selectedAvatar}
                                </button>
                                <input
                                    type="text"
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addTeam()}
                                    placeholder="Add Local Bot..."
                                    className="bg-transparent border-none focus:ring-0 text-white placeholder-gray-400 w-48"
                                />
                                <button onClick={addTeam} className="bg-wood-light hover:bg-wood text-white px-4 rounded-md font-bold transition shadow-lg">
                                    <i className="fa-solid fa-plus"></i>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-2 relative z-10">
                            {teams.map((team) => (
                                <div key={team.id} className="glass-button rounded-lg p-4 flex items-center justify-between group hover:bg-white/10 transition border-l-4 border-l-gold">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-black/30 rounded-full flex items-center justify-center text-2xl shadow-inner border border-white/10">
                                            {team.avatar}
                                        </div>
                                        <div className="font-bold text-lg truncate max-w-[120px] text-white">{team.name}</div>
                                    </div>
                                    <button
                                        onClick={() => removeTeam(team.id)}
                                        className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <i className="fa-solid fa-times-circle text-xl"></i>
                                    </button>
                                </div>
                            ))}
                            {teams.length === 0 && (
                                <div className="col-span-full text-center py-12 text-gray-500 italic border-2 border-dashed border-gray-700/50 rounded-lg bg-black/10">
                                    {isMultiplayer ? "Waiting for crew to join via QR Code..." : "No crews registered yet. Add bots manually."}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={handleStart}
                            disabled={teams.length < 1}
                            onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.05, boxShadow: "0 0 30px rgba(255, 215, 0, 0.6)", duration: 0.3 })}
                            onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, boxShadow: "0 0 20px rgba(190,18,60,0.6)", duration: 0.3 })}
                            className="group relative px-16 py-6 bg-rose-700 text-white font-pirate text-3xl rounded-lg shadow-[0_0_20px_rgba(190,18,60,0.6)] overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-transform duration-300 lantern-glow"
                        >
                            <span className="relative z-10 flex items-center gap-4 text-shadow-sm">
                                <i className="fa-solid fa-skull-crossbones"></i> SET SAIL! <i className="fa-solid fa-skull-crossbones"></i>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        </button>
                    </div>
                </div>
            </main>

            {/* Editor Modal */}
            {isMapEditorOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-sea-900 border-2 border-wood-light rounded-lg w-full max-w-2xl p-6 shadow-2xl">
                        <h3 className="text-2xl font-pirate text-gold mb-4">Map Cartography (JSON)</h3>
                        <textarea
                            value={cardsJson}
                            onChange={(e) => setCardsJson(e.target.value)}
                            className="w-full h-64 bg-black/50 border border-sea-600 rounded p-4 font-mono text-xs text-green-400 focus:outline-none focus:border-gold resize-none"
                        />
                        <div className="flex justify-end gap-4 mt-4">
                            <button onClick={() => setCardsJson(JSON.stringify(DEFAULT_CARDS, null, 2))} className="text-sm text-gray-400 hover:text-white underline mr-auto">Reset to Default</button>
                            <button onClick={() => setIsMapEditorOpen(false)} className="px-6 py-2 bg-wood hover:bg-wood-light rounded text-white font-bold">Save & Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Decorative Background Elements */}
            <div className="absolute bottom-0 left-0 right-0 h-32 wave-layer opacity-30 animate-wave"></div>
            <div className="absolute bottom-0 left-0 right-0 h-48 wave-layer opacity-20 animate-wave-slow bg-bottom"></div>
        </div>
    );
};

export default Lobby;
