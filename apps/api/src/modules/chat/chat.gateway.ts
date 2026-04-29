import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody, ConnectedSocket, OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>(); // userId -> socketId

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token as string;
      const payload = this.jwtService.verify(token, {
        secret: this.config.get('JWT_SECRET', 'secret'),
      });
      client.data.userId = payload.sub;
      this.userSockets.set(payload.sub, client.id);
      client.emit('connected', { userId: payload.sub });
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.userSockets.delete(client.data.userId);
    }
  }

  @SubscribeMessage('join_group')
  handleJoinGroup(@ConnectedSocket() client: Socket, @MessageBody() data: { groupId: string }) {
    client.join(`group:${data.groupId}`);
    client.emit('joined_group', { groupId: data.groupId });
  }

  @SubscribeMessage('leave_group')
  handleLeaveGroup(@ConnectedSocket() client: Socket, @MessageBody() data: { groupId: string }) {
    client.leave(`group:${data.groupId}`);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string; content: string; mediaUrl?: string },
  ) {
    const message = await this.chatService.sendMessage(data.groupId, client.data.userId, {
      content: data.content,
      mediaUrl: data.mediaUrl,
    });
    this.server.to(`group:${data.groupId}`).emit('new_message', message);
    return message;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string; isTyping: boolean },
  ) {
    client.to(`group:${data.groupId}`).emit('user_typing', {
      userId: client.data.userId,
      isTyping: data.isTyping,
    });
  }
}
