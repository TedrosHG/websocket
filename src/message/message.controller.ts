import { Body, Controller, Get, UseGuards, Post, Query } from '@nestjs/common';
import { MessageService } from './message.service';
import { CurrentUserId } from 'src/auth/decorators';
import { JwtGuard } from 'src/auth/guards';
import {
  AddUserToGroupDto,
  sendMessageDto,
  CreateGroupDto,
  sendGroupMessageDto,
  getChatDto,
  PhoneNumberDto,
} from './dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Message')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post('addUserToGroup')
  @ApiOperation({
    summary: 'Add users to group',
    description: 'Add users to group',
  })
  async addUserToGroup(
    @CurrentUserId() userId: string,
    @Body() dto: AddUserToGroupDto,
  ) {
    return await this.messageService.addUsersToGroup(
      userId,
      dto.groupId,
      dto.users,
    );
  }

  @Get('getGroups')
  @ApiOperation({
    summary: 'Get groups',
    description: 'Get groups with its members and messages',
  })
  async getGroup(@CurrentUserId() userId: string) {
    return await this.messageService.getGroup();
  }

  @Post('createGroup')
  @ApiOperation({
    summary: 'Create group',
    description: 'Create group with its members',
  })
  async createGroup(
    @CurrentUserId() userId: string,
    @Body() dto: CreateGroupDto,
  ) {
    return await this.messageService.createGroup(userId, dto);
  }

  @Get('getChat')
    @ApiOperation({
        summary: 'Get chat for user',
        description: 'Get chat with its members and messages',
    })
  async getMessagesForChat(
    @CurrentUserId() userId: string,
    @Query() dto: getChatDto,
  ) {
    return await this.messageService.getMessagesForChat(userId, dto.chatId);
  }

  @Get('getAllChats')
    @ApiOperation({
        summary: 'Get all chats',
        description: 'Get all chats with its members and messages',
    })
  async getAllChats(@CurrentUserId() userId: string) {
    return await this.messageService.getAllChats(userId);
  }

  @Post('createChat')
  @ApiOperation({
    summary: 'Create chat',
    description: 'Create chat for new user by phone number',
  })
  async createChat(
    @CurrentUserId() userId: string,
    @Body() dto: PhoneNumberDto,
  ) {
    return await this.messageService.createChat(userId, dto.phoneNumber);
  }

  // @Post('sendMessage')
  // async sendMessage(
  //     @CurrentUserId() userId:string,
  //     @Body() dto: sendMessageDto
  //     ){
  //     return await this.messageService.sendMessage(userId,dto.chatId,dto.content)
  // }

  // @Post('sendGroupMessage')
  // async sendGroupMessage(
  //     @CurrentUserId() userId:string,
  //     @Body() dto: sendGroupMessageDto
  //     ){
  //     return await this.messageService.sendGroupMessage(userId,dto.groupId,dto.content)
  // }
}
