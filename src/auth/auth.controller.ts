import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountDto } from './dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Post()
    @ApiOperation({ 
      summary: 'User Registration', 
      description: 'Registers a new user and returns an authentication token.' 
    })
    async auth(@Body() dto: AccountDto){
        return this.authService.userRegistration(dto);
      }
}
