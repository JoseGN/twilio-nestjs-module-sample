import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class chatMessageNotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  receiverId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  text: string;
}

export class callNotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  receiverId: number;
}