import { Module, forwardRef } from '@nestjs/common';
import { Gateway } from './gateway';
import { MessageModule } from 'src/message/message.module';
import { UserModule } from 'src/user/user.module';
import { GatewayController } from './gateway.controller';

@Module({
    imports:[UserModule,MessageModule],
    providers:[Gateway],
    exports:[Gateway],
    controllers: [GatewayController]
})
export class GatewayModule {}
