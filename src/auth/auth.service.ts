import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AccountDto } from './dto';

@Injectable()
export class AuthService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
        private readonly config: ConfigService,
      ) {}

    async userRegistration(dto: AccountDto) {
        try {

          // create or update user with its phoneNumber only
          const user = await this.prisma.user.upsert({
            where: { phoneNumber: dto.phoneNumber },
            create: {
              phoneNumber: dto.phoneNumber,
              password:dto.password
            },
            update:{}
          });
          if(dto.password!=user.password){
            throw new BadRequestException('Wrong pin');
          }

          const token = await this.signToken({
            id: user.id,
            phoneNumber: user.phoneNumber,
            role: 'user',
            deviceId:''
          });
          console.log();

          return token;
        } catch (error) {
          // Handle any errors
          const statusCode = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
          throw new HttpException(error.message, statusCode);
        }
      }

      async signToken(payload: { id: string; phoneNumber: string, role: string ,deviceId:string}): Promise<string> {
        try {
          const expireAT = this.config.get('JWT_EXPIRATION');
          const secret = this.config.get('JWT_SECRET');

          return await this.jwt.signAsync(payload, {
            expiresIn: expireAT,
            secret,
          });
        } catch (error) {
          // Handle any errors
          const statusCode = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
          throw new HttpException(error.message, statusCode);
        }
      }
}
