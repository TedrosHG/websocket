import { Module, forwardRef } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { GatewayModule } from 'src/gateway/gateway.module';

@Module({
  // imports:[forwardRef(() => GatewayModule)],
  providers: [MessageService],
  controllers: [MessageController],
  exports:[MessageService]
})
export class MessageModule {}
