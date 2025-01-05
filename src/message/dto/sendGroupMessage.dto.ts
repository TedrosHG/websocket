import { IsNotEmpty, IsString } from "class-validator";

export class sendGroupMessageDto{
    @IsString()
    @IsNotEmpty()
    groupId:string

    @IsString()
    @IsNotEmpty()
    content:string
}