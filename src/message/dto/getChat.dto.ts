import { IsNotEmpty, IsString } from "class-validator";

export class getChatDto{
    @IsString()
    @IsNotEmpty()
    chatId:string
}