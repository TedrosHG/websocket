import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import Redis from 'ioredis';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CronService {
    constructor(
        private prisma: PrismaService,
        @InjectRedis() private redisClient: Redis,
      ) {}

      // Cron job runs every minute (adjust the interval as needed)
  @Cron(CronExpression.EVERY_MINUTE)
  async syncLocationsToDb() {
    console.log('Syncing user locations to PostgreSQL...');

    // Get all user IDs with their latest location from Redis
    const keys = await this.redisClient.keys('user:*:location');

    // Process each user to update their location in the database
    for (const key of keys) {
      const userId = key.split(':')[1];  // Extract the user ID
      const location = await this.redisClient.get(key);  // Get the stored location
        console.log('locationCron', location, "userIdCron", userId);
        
      if (location) {
        const { lat, long } = JSON.parse(location);

        // Update the user's location in PostgreSQL
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            currentLocationLat: lat,
            currentLocationLong: long,
          },
        });

        console.log(`Updated location for user ${userId} in PostgreSQL`);
        
        // Optionally, delete the key after updating the database
        await this.redisClient.del(key);
      }
    }

    console.log('Location syncing completed!');
  }
}
