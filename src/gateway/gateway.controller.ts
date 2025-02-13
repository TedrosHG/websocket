import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { UpdateLocationDto, SendMessageDto, PrivateMessageResponseDto, GroupMessageResponseDto } from './dto/websocket.dto';

@ApiTags('WebSocket')
@Controller('gateway')
export class GatewayController {

  @Get('docs')
  @ApiOperation({
    summary: 'WebSocket API Documentation',
    description: `
      **WebSocket Connection:**  
      - URL: \`ws://localhost:3000\`  
      - Protocol: Socket.IO  

      **Available WebSocket Events:**  
      - **EMIT (Send events)**  
        - \`update-location\` → Update user location  
        - \`send-message\` → Send a private message  
        - \`send-group-message\` → Send a message to a group 
        - \`nearby-users\` → find nearby users 

      - **LISTEN (Receive events)**  
        - \`message\` → General message from server  
        - \`online-users\` → List of currently online users  
        - \`update-location\` → Confirmation of location update  
        - \`private-message\` → Receive a private message  
        - \`group-message\` → Receive a group message  

    `,
  })
  @ApiResponse({ status: 200, description: 'Returns WebSocket API documentation' })
  getDocs() {
    return { message: 'See the description for WebSocket documentation' };
  }

  @Get('emit-events')
  @ApiOperation({
    summary: 'List of WebSocket Emit Events',
    description: `
      **Events the frontend can send (emit):**
      
      - **update-location**  
        - Payload: \`{ lat: number, long: number }\`  
      - **send-message**  
        - Payload: \`{ chatId: string, msg: string }\`  
      - **send-group-message**  
        - Payload: \`{ chatId: string, msg: string }\`  
      - **nearby-users**  
        - Payload: \`{ distance: number }\`    
    `,
  })
  
  @ApiResponse({ status: 200, description: 'Returns list of WebSocket emit events' })
  getEmitEvents() {
    return [
      { event: 'update-location', payload: UpdateLocationDto },
      { event: 'send-message', payload: SendMessageDto },
      { event: 'send-group-message', payload: SendMessageDto },
      { event: 'nearby-users', payload: { distance: 5} },
    ];
  }

  @Get('listen-events')
  @ApiOperation({
    summary: 'List of WebSocket Listen Events',
    description: `
      **Events the frontend should listen for:**  
      
      - **message**  
        - Response: \`{ clientId: string }\`  
      - **online-users**  
        - Response: \`{ users: string[] }\`  
      - **update-location**  
        - Response: \`{ success: boolean }\`  
      - **private-message**  
        - Response: \`{ content: string, senderId: string, chatId: string }\`  
      - **group-message**  
        - Response: \`{ content: string, senderId: string, chatId: string }\`  
    `,
  })
  @ApiResponse({ status: 200, description: 'Returns list of WebSocket listen events' })
  getListenEvents() {
    return [
      { event: 'message', response: { clientId: 'string' } },
      { event: 'online-users', response: { users: ['string'] } },
      { event: 'update-location', response: { success: 'boolean' } },
      { event: 'private-message', response: PrivateMessageResponseDto },
      { event: 'group-message', response: GroupMessageResponseDto },
    ];
  }
}
