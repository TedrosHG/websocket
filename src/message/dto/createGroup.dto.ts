import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class CreateGroupDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name:string

    @ApiProperty({
        type:[String]
    })
    @IsArray()
    @IsNotEmpty()
    users:string[]
}