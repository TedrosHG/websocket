import { ApiProperty } from '@nestjs/swagger';

// DTO for updating location
export class UpdateLocationDto {
  @ApiProperty({ example: 40.7128, description: 'Latitude' })
  lat: number;

  @ApiProperty({ example: -74.006, description: 'Longitude' })
  long: number;
}

// DTO for sending a message
export class SendMessageDto {
  @ApiProperty({ example: 'chat123', description: 'Chat ID' })
  chatId: string;

  @ApiProperty({ example: 'Hello!', description: 'Message content' })
  msg: string;
}

// DTO for receiving a private message
export class PrivateMessageResponseDto {
  @ApiProperty({ example: 'Hello!', description: 'Message content' })
  content: string;

  @ApiProperty({ example: 'user123', description: 'Sender ID' })
  senderId: string;

  @ApiProperty({ example: 'chat678', description: 'Chat ID' })
  chatId: string;
}

// DTO for group message
export class GroupMessageResponseDto {
  @ApiProperty({ example: 'Hello Group!', description: 'Message content' })
  content: string;

  @ApiProperty({ example: 'user123', description: 'Sender ID' })
  senderId: string;

  @ApiProperty({ example: 'group456', description: 'Group Chat ID' })
  chatId: string;
}
