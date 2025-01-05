import { Body, Controller, Get, UseGuards, Post, Query } from '@nestjs/common';
import { MessageService } from './message.service';
import { CurrentUserId } from 'src/auth/decorators';
import { JwtGuard } from 'src/auth/guards';
import { AddUserToGroupDto, sendMessageDto, CreateGroupDto, sendGroupMessageDto, EmailDto, getChatDto } from './dto';


@UseGuards(JwtGuard)
@Controller('message')
export class MessageController {
    constructor(private messageService:MessageService){}


    @Post('addUserToGroup')
    async addUserToGroup(
        @CurrentUserId() userId:string,
        @Body() dto:AddUserToGroupDto
        ){
            console.log("query",dto);

        return await this.messageService.addUsersToGroup(userId,dto.groupId,dto.users)
    }

    @Get('getGroups')
    async getGroup(
        @CurrentUserId() userId:string,
        ){
        return await this.messageService.getGroup()
    }

    @Post('createGroup')
    async createGroup(
        @CurrentUserId() userId:string,
        @Body() dto:CreateGroupDto
        ){
        return await this.messageService.createGroup(userId,dto)
    }

    @Get('getChat')
    async getMessagesForChat(
        @CurrentUserId() userId:string,
        @Query() dto:getChatDto
        ){
        return await this.messageService.getMessagesForChat(userId,dto.chatId)
    }

    @Get('getAllChats')
    async getAllChats(
        @CurrentUserId() userId:string,
        ){
        return await this.messageService.getAllChats(userId)
    }

    @Post('createChat')
    async createChat(
        @CurrentUserId() userId:string,
        @Body() dto: EmailDto
        ){
        return await this.messageService.createChat(userId,dto.email)
    }
    @Post('sendMessage')
    async sendMessage(
        @CurrentUserId() userId:string,
        @Body() dto: sendMessageDto
        ){
        return await this.messageService.sendMessage(userId,dto.chatId,dto.content)
    }

    @Post('sendGroupMessage')
    async sendGroupMessage(
        @CurrentUserId() userId:string,
        @Body() dto: sendGroupMessageDto
        ){
        return await this.messageService.sendGroupMessage(userId,dto.groupId,dto.content)
    }
}
