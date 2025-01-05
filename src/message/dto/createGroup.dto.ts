import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class CreateGroupDto{
    @IsString()
    @IsNotEmpty()
    name:string

    @IsArray()
    @IsNotEmpty()
    users:string[]
}