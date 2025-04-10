import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateTodoDto {
  @ApiProperty({ description: 'Vazifa sarlavhasi', example: 'Yangi vazifa' })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Vazifa tavsifi',
    required: false,
    example: 'Bu test vazifa',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
