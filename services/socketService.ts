import { io, Socket } from 'socket.io-client';
import { Team } from '../types';

// Change this to your deployed server URL. For local dev, use 'http://localhost:3001'
const SERVER_URL = 'http://localhost:3001';

class SocketService {
  socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SERVER_URL);
      this.socket.on('connect', () => {
        console.log('Connected to socket server');
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Host Methods
  createRoom(roomId: string) {
    this.socket?.emit('create-room', roomId);
  }

  syncState(roomId: string, state: any) {
    this.socket?.emit('sync-game-state', { roomId, state });
  }

  onPlayerJoined(callback: (team: Team) => void) {
    this.socket?.on('player-joined', callback);
  }

  onPlayerAction(callback: (action: any) => void) {
    this.socket?.on('player-action-received', callback);
  }

  onPlayerVote(callback: (vote: any) => void) {
    this.socket?.on('player-vote-received', callback);
  }

  // Player Methods
  joinRoom(roomId: string, team: Team) {
    this.socket?.emit('join-room', { roomId, team });
  }

  sendAction(roomId: string, text: string, teamId: string) {
    this.socket?.emit('player-action', { roomId, action: { text, teamId } });
  }

  sendVote(roomId: string, direction: 'up' | 'down') {
    this.socket?.emit('player-vote', { roomId, vote: direction });
  }

  onStateUpdate(callback: (state: any) => void) {
    this.socket?.on('game-state-updated', callback);
  }
}

export const socketService = new SocketService();