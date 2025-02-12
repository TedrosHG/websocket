import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class LocaltionDto{
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    lat:number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    long:number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    distance:number
}