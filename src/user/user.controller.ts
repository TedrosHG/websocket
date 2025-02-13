import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocaltionDto } from './dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('user')
export class UserController {
    constructor(private userService:UserService){}

    @Get('onlineUsers')
    @ApiOperation({ 
        summary: 'Get online users', 
        description: 'Returns a list of online users.' 
      })
    async getOnlineUsers(){
        return await this.userService.getOnlineUsers()
    }

    @Get('allUsers')
    @ApiOperation({ 
        summary: 'Get all users', 
        description: 'Returns a list of all users.' 
      })
    async getAllUsers(){
        return await this.userService.getAllUsers()
    }

    @Post('nearbyUsersToLocation')
    @ApiOperation({ 
        summary: 'Get nearby users to location', 
        description: 'Returns a list of nearby users with in some distance from longitude and latitude.' 
      })
    async getNearbyUsersToLocation(@Body() dto:LocaltionDto){
        return await this.userService.getNearbyUsersToLocation(dto)
    }

    
}
