import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { MessageService } from 'src/message/message.service';
import { OnEvent } from '@nestjs/event-emitter';
import { UserService } from 'src/user/user.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ApiOperation, ApiTags } from '@nestjs/swagger';


@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class Gateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly config: ConfigService,
    private userService: UserService,
    private MessageService: MessageService,
    @InjectRedis() private readonly redisClient: Redis,
  ) {}

  private readonly logger = new Logger(Gateway.name);
  private clientMap = new Map();

  @WebSocketServer() server: Server;

  // Clear Redis data when the server starts
  async onModuleInit() {
    this.logger.log('Clearing Redis data on server start...');
    const keys = await this.redisClient.keys('user:*:sockets'); // Find all keys related to user sockets
    if (keys.length > 0) {
      console.log('keys', keys);
      await this.redisClient.del(keys); // Delete all matching keys
      keys.map(async (key) => {
        let id = key.split(':')[1];
        await this.userService.updateUserOnlineStatus(id, false);
      });

      this.logger.log(`Cleared ${keys.length} Redis keys`);
    }
    await this.redisClient.del('online-users');
    await this.redisClient.del('user-locations');
  }

  afterInit() {
    this.logger.log('Initialized');
    // Add middleware to authenticate clients
    this.server.use(async (socket, next) => {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers['authorization']?.split(' ')[1];
      if (!token) {
        this.logger.warn('Connection attempt without a token');
        return next(new Error('Authentication error: No token provided'));
      }

      try {
        const payload = jwt.verify(
          token,
          this.config.get<string>('JWT_SECRET'),
        );
        await this.userService.getUser(payload['id']);
        socket.data.user = payload; // Attach user payload to the socket object
        next();
      } catch (error) {
        this.logger.error('Authentication error: Invalid or expired token');
        return next(
          new Error('Authentication error: Invalid or expired token'),
        );
      }
    });
  }

  async handleConnection(client: Socket) {
    const user = client.data.user; // Access authenticated user

    // Add the socket ID to Redis
    await this.redisClient.sadd(`user:${user.id}:sockets`, client.id);
    await this.redisClient.sadd(`online-users`, user.phoneNumber);

    // update online status of user to true
    await this.userService.updateUserOnlineStatus(user.id, true);
    // // Map clientId to userId
    // this.clientMap[user.id] = this.clientMap[user.id] || [];
    // this.clientMap[user.id].push(client.id);
    this.logger.log(`Client connected: ${client.id}, User ID: ${user.id}`);
    //client.broadcast.emit('room', client.id + ' joined!') //send all other connected users
    this.server.emit('message', { clientId: client.id });
    // get online users
    const onlineUsers = await this.redisClient.smembers('online-users');
    console.log('connected', onlineUsers);

    this.server.emit('online-users', { users: onlineUsers });
    const remainingSockets = await this.redisClient.smembers(
      `user:${user.id}:sockets`,
    );
    console.log('connected sockets', remainingSockets);
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user; // Access authenticated user
    // update online status of user to false
    //await this.userService.updateUserOnlineStatus(user.id, false);
    this.logger.log(`Cliend id:${client.id} disconnected`);

    // const clients = this.clientMap[user.id];
    // const index = clients.indexOf(client.id);
    // if (index != -1) {
    //   clients.splice(index, 1); // Remove the client from the array
    //   if (clients.length == 0) {
    //     delete this.clientMap[user.id];
    //   }
    // }
    // Remove the socket ID from Redis
    await this.redisClient.srem(`user:${user.id}:sockets`, client.id);
    const remainingSockets = await this.redisClient.smembers(
      `user:${user.id}:sockets`,
    );

    if (remainingSockets.length === 0) {
      await this.redisClient.srem('online-users', user.email);
      await this.userService.updateUserOnlineStatus(user.id, false);
    }
    this.server.emit('message', client.id + ' left!');
    // get online users
    const onlineUsers = await this.redisClient.smembers('online-users');
    this.server.emit('online-users', { users: onlineUsers });
    console.log('disconnected', remainingSockets);
  }

  
  @SubscribeMessage('update-location')
  async handleUpdateLocation(client: Socket, payload: any) {
    const user = client.data.user;
    console.log(payload);

    // Check if data is a string and parse it if necessary
    const location = typeof payload == 'string' ? JSON.parse(payload) : payload;
    console.log('location', location);

    // Store user location in Redis using GEOADD
    await this.redisClient.geoadd(
      'user-locations',
      location.long,
      location.lat,
      user.phoneNumber,
    );
    const members = await this.redisClient.zrange('user-locations', 0, -1);
    // const locations = await this.redisClient.smembers('user-locations');
    console.log('locations', members);
    let position = await this.redisClient.geopos('user-locations', members);
    console.log('position', position);

    this.logger.log(
      `Updated location for user ${user.phoneNumber}: (${location.lat}, ${location.long})`,
    );
    client.emit('update-location', { success: true });
  }

  // @SubscribeMessage('nearby-users')
  // async handleGetNearbyUsers(client: Socket, radius) {
  //   const { lat, long, distance } = JSON.parse(radius);

  //   // Find users nearby using GEORADIUS
  //   const nearbyUsers = await this.redisClient.georadius(
  //     'user-locations',
  //     long,
  //     lat,
  //     distance,
  //     'km',
  //     'WITHDIST',
  //     'ASC',
  //   );

  //   this.logger.log(`Nearby users for (${lat}, ${long}):`, nearbyUsers);
  //   client.emit('nearby-users', { users: nearbyUsers });
  // }

  // @SubscribeMessage('create-chat')
  // async handleCreateChat(client: Socket, payload) {
  //   const user = client.data.user; // Authenticated user (sender)
  //   const { email } = JSON.parse(payload);
  //   console.log(email);

  //   const chat = await this.MessageService.createChat(user.id,email).catch((error) => {
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  //   });
  //   console.log(chat);
  //   this.logger.log(`Chat created between User ID: ${user.id} and ${email}`);
  //   client.emit('chat-created', chat);
  // }

  // @SubscribeMessage('get-chats')
  // async handleGetChats(client: Socket) {
  //   const user = client.data.user; // Authenticated user (sender)

  //   const chat = await this.MessageService.getAllChats(user.id).catch((error) => {
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  //   });
  //   console.log(chat);
  //   client.emit('get-chats', chat);
  // }

  @SubscribeMessage('send-message')
  async handlePrivateMessage(client: Socket, payload) {
    const user = client.data.user;
    console.log(payload);
    const { chatId, msg } = JSON.parse(payload);

    const chat = await this.MessageService.sendMessage(
      user.id,
      chatId,
      msg,
    ).catch((error) => {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    });
    const { content, senderId, receiverId } = chat;
    const receiverSockets = await this.redisClient.smembers(
      `user:${receiverId}:sockets`,
    );
    console.log('receiverSockets', receiverSockets);

    if (receiverSockets.length > 0) {
      receiverSockets.map((socketId) => {
        const targetSocket = this.server.sockets.sockets.get(socketId);
        if (targetSocket) {
          targetSocket.emit('private-message', { content, senderId, chatId });
        }
      });
    }
  }

  @SubscribeMessage('send-group-message')
  async handleGroupMessage(client: Socket, payload) {
    const user = client.data.user;
    console.log(payload);
    const { chatId, msg } = JSON.parse(payload);

    const chat = await this.MessageService.sendGroupMessage(
      user.id,
      chatId,
      msg,
    ).catch((error) => {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    });
    const { content, senderId, receivers } = chat;

    receivers.map(async (receiverId) => {
      if (receiverId != senderId) {
        const receiverSockets = await this.redisClient.smembers(
          `user:${receiverId}:sockets`,
        );
        if (receiverSockets.length > 0) {
          receiverSockets.map((socketId) => {
            const targetSocket = this.server.sockets.sockets.get(socketId);
            if (targetSocket) {
              targetSocket.emit('group-message', {
                content,
                senderId,
                chatId,
              });
            }
          });
        }
      }
    });
  }

  @OnEvent('group.join')
  async handleGroupJoin(payload) {
    const { users, chat } = payload;
    users.map(async (receiverId) => {
      const receiverSockets = await this.redisClient.smembers(
        `user:${receiverId}:sockets`,
      );
      if (receiverSockets.length > 0) {
        receiverSockets.map((socketId) => {
          const targetSocket = this.server.sockets.sockets.get(socketId);
          if (targetSocket) {
            targetSocket.emit('group-join', {
              message: 'You have joined a group',
              chat,
            });
          }
        });
      }
    });
  }
}
