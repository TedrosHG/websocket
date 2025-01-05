import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class AddUserToGroupDto{
    @IsString()
    @IsNotEmpty()
    groupId:string

    @IsArray()
    @IsNotEmpty()
    users:string[]
}