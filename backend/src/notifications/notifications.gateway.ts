import { Inject, Logger, forwardRef } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';

type NotificationAudience = {
  userIds?: string[];
  roles?: string[];
  residentLocation?: {
    ward?: string | null;
    street?: string | null;
  };
  broadcast?: boolean;
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  private normalizeRoomPart(value?: string | null) {
    return (value || '').trim().toLowerCase().replace(/\s+/g, '-');
  }

  private getUserRoom(userId: string) {
    return `user:${userId}`;
  }

  private getRoleRoom(role: string) {
    return `role:${role}`;
  }

  private getLocationRoom(ward?: string | null, street?: string | null) {
    return `location:${this.normalizeRoomPart(ward)}:${this.normalizeRoomPart(street)}`;
  }

  private extractToken(client: Socket) {
    const authToken = typeof client.handshake.auth?.token === 'string' ? client.handshake.auth.token : null;
    if (authToken) {
      return authToken.replace(/^Bearer\s+/i, '').trim();
    }

    const authorizationHeader = client.handshake.headers.authorization;
    if (typeof authorizationHeader === 'string') {
      return authorizationHeader.replace(/^Bearer\s+/i, '').trim();
    }

    return null;
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        this.logger.warn(`Socket rejected without token: ${client.id}`);
        client.disconnect(true);
        return;
      }

      const identity = await this.authService.verifyAccessToken(token);
      const profile = await this.authService.getProfile(identity.userId);

      client.data.user = {
        userId: identity.userId,
        role: identity.role,
        ward: profile.ward,
        street: profile.street,
      };

      await client.join(this.getUserRoom(identity.userId));
      await client.join(this.getRoleRoom(identity.role));

      if (profile.ward || profile.street) {
        await client.join(this.getLocationRoom(profile.ward, profile.street));
      }

      this.logger.log(`Client connected: ${client.id} user=${identity.userId} role=${identity.role}`);
    } catch (error) {
      this.logger.warn(`Socket authentication failed for ${client.id}: ${(error as Error).message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitToAudience(event: string, payload: unknown, audience?: NotificationAudience) {
    const rooms = new Set<string>();

    for (const userId of audience?.userIds || []) {
      if (userId) {
        rooms.add(this.getUserRoom(userId));
      }
    }

    for (const role of audience?.roles || []) {
      if (role) {
        rooms.add(this.getRoleRoom(role));
      }
    }

    if (audience?.residentLocation?.ward || audience?.residentLocation?.street) {
      rooms.add(this.getLocationRoom(audience.residentLocation.ward, audience.residentLocation.street));
    }

    if (rooms.size > 0) {
      this.server?.to([...rooms]).emit(event, payload);
      return;
    }

    if (audience?.broadcast !== false) {
      this.server?.emit(event, payload);
    }
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() payload: unknown, @ConnectedSocket() client: Socket) {
    client.emit('pong', payload);
  }
}
