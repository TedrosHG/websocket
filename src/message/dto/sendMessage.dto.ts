import { IsNotEmpty, IsString } from "class-validator";

export class sendMessageDto{
    @IsString()
    @IsNotEmpty()
    chatId:string

    @IsString()
    @IsNotEmpty()
    content:string
}