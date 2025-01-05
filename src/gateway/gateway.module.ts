import { Module, forwardRef } from '@nestjs/common';
import { Gateway } from './gateway';
import { MessageModule } from 'src/message/message.module';
import { UserModule } from 'src/user/user.module';

@Module({
    imports:[UserModule,MessageModule],
    providers:[Gateway],
    exports:[Gateway]
})
export class GatewayModule {}
