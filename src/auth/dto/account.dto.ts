// import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsEmail } from 'class-validator';

export class AccountDto {
  // @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
