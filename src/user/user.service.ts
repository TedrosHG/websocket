import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma:PrismaService){}

    async getOnlineUsers() {
        return await this.prisma.user.findMany({
          where: {
            online: true,
          },
          select: {
            id: true,
            email: true,
          },
        });
      }

      async getUser(id: string) {
        const existUser = await this.prisma.user.findUnique({
            where:{id}
        })
        if(!existUser){
            throw new BadRequestException('no user with this id')
        }
        return existUser
      }

      async updateUserOnlineStatus(id: string, online: boolean) {
        const existUser = await this.prisma.user.findUnique({
            where:{id}
        })
        if(!existUser){
            throw new BadRequestException('no user with this id')
        }
        return await this.prisma.user.update({
          where: {
            id,
          },
          data: {
            online,
          },
        });
      }

}
