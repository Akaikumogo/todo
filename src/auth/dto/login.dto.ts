/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Foydalanuvchi nomi', example: 'test' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Parol', example: '123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}