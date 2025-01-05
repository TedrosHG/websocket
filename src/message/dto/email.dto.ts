import { IsArray, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class EmailDto{
    @IsEmail()
    @IsNotEmpty()
    email:string
}