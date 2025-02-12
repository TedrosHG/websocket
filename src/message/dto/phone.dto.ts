import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class PhoneNumberDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    phoneNumber:string
}