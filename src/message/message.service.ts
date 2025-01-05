import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGroupDto } from './dto';

@Injectable()
export class MessageService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async createGroup(id: string, dto: CreateGroupDto) {
    const { name, users } = dto;
    // Include the creator in the list of participants
    if (!users.includes(id)) {
      users.push(id);
    }
    const existChat = await this.prisma.chat.findUnique({
      where: {
        name,
      },
    });
    if (existChat) {
      throw new BadRequestException('name already exist');
    }
    const chat = await this.prisma.chat.create({
      data: {
        name,
        isGroup: true,
        ChatParticipant: {
          create: users.map((userId) => ({
            userId,
          })),
        },
      },
    });
    return chat;
  }

  async getGroup() {
    const chats = await this.prisma.chat.findMany({
      where: {
        isGroup: true,
      },
      select: {
        id: true,
        name: true,
        ChatParticipant: {
          select: {
            userId: true,
          },
        },
        createdAt: true,
      },
    });
    return chats;
  }

  async addUsersToGroup(id: string, groupId: string, users: string[]) {
    const existChat = await this.prisma.chat.findUnique({
      where: {
        id: groupId,
        ChatParticipant: {
          some: {
            userId: id,
          },
        },
      },
    });
    if (!existChat) {
      throw new BadRequestException("you can't add users to this group");
    }
    const chat = await this.prisma.chatParticipant.createMany({
      data: users.map((userId) => ({
        userId,
        chatId: existChat.id,
      })),
      skipDuplicates: true, // Avoid adding the same user multiple times
    });

    return { message: 'user added to group' };
  }

  // async getUserChats(id: string, receiverId:string) {
  //   console.log(id,receiverId);
  //   let users = []
  //   users.push(id)
  //   if(id!=receiverId){
  //       users.push(receiverId)
  //   }

  //   const allChats = await this.prisma.chat.findMany({
  //     where:{
  //       isGroup:false,
  //       ChatParticipant:{
  //         some:{
  //           userId:id
  //         }
  //       },
  //     },
  //     select:{
  //       id:true,
  //       ChatParticipant:{
  //         select:{
  //           userId:true
  //         }
  //       },
  //       message:{
  //         select:{
  //           senderId:true,
  //           content:true,
  //           createdAt:true
  //         }
  //       }
  //     }
  //   })

  //   const chat = await this.prisma.chat.findFirst({
  //       where: {
  //         isGroup: false,
  //         ChatParticipant: {
  //           every: {
  //             userId: {
  //               in: users,
  //             },
  //           },
  //         },
  //       },
  //     });
  //   if(!chat){
  //       return []
  //   }

  //   const chats = await this.prisma.message.findMany({
  //     where: {
  //       receiverId:chat.id
  //     },
  //     select:{
  //       sender:true,
  //       content:true,
  //       createdAt:true,
  //       reciever:{
  //           select:{
  //               ChatParticipant:{
  //                   where:{
  //                       userId:{
  //                           not:id
  //                       }
  //                   },
  //                   select:{
  //                       users:{
  //                           select:{
  //                               id:true,
  //                               phoneNumber:true
  //                           }
  //                       }
  //                   }
  //               }
  //           }
  //       }
  //     }
  //   });
  //   console.log(chats);

  //   const updatedMessage = chats.map((chat)=>({
  //       sender:{
  //           id:chat.sender.id,
  //           phone:chat.sender.phoneNumber
  //       },
  //       receiver:{
  //           id:chat.reciever.ChatParticipant[0].users.id,
  //           phone:chat.reciever.ChatParticipant[0].users.phoneNumber
  //       },
  //       content:chat.content,
  //       createdAt:chat.createdAt
  //   }))

  //   return updatedMessage;
  // }

  async getAllChats(id: string) {
    const allChats = await this.prisma.chat.findMany({
      where: {
        isGroup: false,
        ChatParticipant: {
          some: {
            userId: id,
          },
        },
      },
      select: {
        id: true,
        ChatParticipant: {
          select: {
            userId: true,
          },
        },
        message: {
          select: {
            senderId: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    return allChats;
  }

  async getMessagesForChat(id: string, chatId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: {
        id: chatId,
        isGroup: false,
        ChatParticipant: {
          some: {
            userId: id,
          },
        },
      },
      select: {
        id: true,
        ChatParticipant: {
          select: {
            userId: true,
          },
        },
        message: {
          select: {
            senderId: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });
    if (!chat) {
      throw new BadRequestException('No chat with this id');
    }

    return chat;
  }

  async getAllGroupChats(id: string) {
    const allChats = await this.prisma.chat.findMany({
      where: {
        isGroup: true,
        ChatParticipant: {
          some: {
            userId: id,
          },
        },
      },
      select: {
        id: true,
        ChatParticipant: {
          select: {
            userId: true,
          },
        },
        message: {
          select: {
            senderId: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    return allChats;
  }

  async getGroupMessageForChat(id: string, chatId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: {
        id: chatId,
        isGroup: true,
        ChatParticipant: {
          some: {
            userId: id,
          },
        },
      },
      select: {
        id: true,
        ChatParticipant: {
          select: {
            userId: true,
          },
        },
        message: {
          select: {
            senderId: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });
    if (!chat) {
      throw new BadRequestException('No chat with this id');
    }

    return chat;
  }

  async createChat(senderId: string, receiverEmail: string) {
    const receiver = await this.prisma.user.findUnique({
      where: {
        email: receiverEmail,
      },
    });
    if (!receiver) {
      throw new BadRequestException('No user with this email');
    }
    let receiverId = receiver.id;

    console.log(senderId, receiverId);
    let chat;
    let users = [];
    users.push(senderId);
    if (senderId != receiverId) {
      users.push(receiverId);
    }
    if (senderId == receiverId) {
      console.log('equal');

      chat = await this.prisma.chat.findFirst({
        where: {
          isGroup: false,
          ChatParticipant: {
            every: {
              userId: senderId,
            },
          },
        },
      });
    } else {
      console.log('different');

      chat = await this.prisma.chat.findFirst({
        where: {
          isGroup: false,
          ChatParticipant: {
            some: {
              userId: senderId,
            },
          },
          AND: {
            ChatParticipant: {
              some: {
                userId: receiverId,
              },
            },
          },
        },
      });
    }

    console.log('chat', chat);

    if (!chat) {
      const newChat = await this.prisma.chat.create({
        data: {
          isGroup: false,
          ChatParticipant: {
            create: users.map((user) => ({
              userId: user,
            })),
          },
        },
      });

      return { chat: newChat.id };
    }
    return { chat: chat.id };
  }

  async sendMessage(senderId: string, chatId: string, content: string) {
    console.log(senderId, chatId, content);

    const existChat = await this.prisma.chat.findUnique({
      where: {
        id: chatId,
        isGroup: false,
        ChatParticipant: {
          some: {
            userId: senderId,
          },
        },
      },
      select: {
        id: true,
        ChatParticipant: {
          select: {
            userId: true,
          },
        },
      },
    });
    if (!existChat) {
      throw new BadRequestException('No group with this id');
    }

    const message = await this.prisma.message.create({
      data: {
        senderId,
        receiverId: existChat.id,
        content,
      },
    });
    console.log('messages', message);
    let receiverId = existChat.ChatParticipant.filter(
      (user) => user.userId != senderId,
    )[0].userId;

    // // Emit event
    // this.eventEmitter.emit('message.created', {
    //   receiverId,
    //   data: {
    //     sender: senderId,
    //     content: content,
    //   },
    // });
    return {
      message: 'message created',
      senderId,
      receiverId,
      content,
    };
  }

  async sendGroupMessage(senderId: string, groupId: string, content: string) {
    const existChat = await this.prisma.chat.findUnique({
      where: {
        id: groupId,
        isGroup: true,
        ChatParticipant: {
          some: {
            userId: senderId,
          },
        },
      },
      select: {
        id: true,
        ChatParticipant: {
          select: {
            userId: true,
          },
        },
      },
    });
    if (!existChat) {
      throw new BadRequestException('No group with this id');
    }
    console.log(existChat.ChatParticipant);
    const users = existChat.ChatParticipant.map((user) => {
      return user.userId;
    });
    console.log(users);

    const chat = await this.prisma.message.create({
      data: {
        senderId,
        content,
        receiverId: groupId,
      },
    });
    console.log('chat with message', chat);

    // // Emit event
    // this.eventEmitter.emit('group-message.created', {
    //   targetUsers: users,
    //   data: {
    //     senderId,
    //     groupId,
    //     content,
    //   },
    // });

    return {
      message: 'message created',
      content,
      senderId,
      chatId: groupId,
      receivers: users,
    };
  }
}
