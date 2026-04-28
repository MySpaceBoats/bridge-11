import { io, Socket } from 'socket.io-client';

let chatSocket: Socket | null = null;

export function getChatSocket(): Socket {
  if (!chatSocket) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    chatSocket = io(`${WS_URL}/chat`, {
      auth: { token },
      autoConnect: false,
    });
  }
  return chatSocket;
}

export function connectChatSocket(): void {
  const socket = getChatSocket();
  if (!socket.connected) socket.connect();
}

export function disconnectChatSocket(): void {
  if (chatSocket?.connected) {
    chatSocket.disconnect();
    chatSocket = null;
  }
}
