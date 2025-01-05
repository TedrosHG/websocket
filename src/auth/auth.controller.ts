import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountDto } from './dto';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Post()
    async auth(@Body() dto: AccountDto){
        return this.authService.userRegistration(dto);
      }
}
