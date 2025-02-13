import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { LocaltionDto } from './dto';
import { log } from 'console';


@Injectable()
export class UserService {
    constructor(
      private prisma:PrismaService,
      @InjectRedis() private readonly redisClient: Redis,
    ){}

    async getOnlineUsers() {
        return await this.prisma.user.findMany({
          where: {
            online: true,
          },
          select: {
            id: true,
            phoneNumber: true,
          },
        });
      }

      async getAllUsers() {
        return await this.prisma.user.findMany({
          select: {
            id: true,
            phoneNumber: true,
            currentLocationLat: true,
            currentLocationLong: true
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

      async getNearbyUsersToLocation({lat, long, distance}: LocaltionDto){
        // Find users nearby using GEORADIUS
        const nearbyUsers = await this.redisClient.georadius(
          'user-locations',
          long,
          lat,
          distance,
          'km',
          'WITHDIST',
          'ASC',
        );
    
        return nearbyUsers;
      }

      

}
