import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class getChatDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    chatId:string
}