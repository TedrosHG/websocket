import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class AddUserToGroupDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    groupId:string

    @ApiProperty(
        {
            type:[String]
        }
    )
    @IsArray()
    @IsNotEmpty()
    users:string[]
}