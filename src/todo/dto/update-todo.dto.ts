import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateTodoDto {
  @ApiProperty({
    description: 'Vazifa sarlavhasi',
    example: 'Yangilangan vazifa',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Vazifa tavsifi',
    required: false,
    example: 'Yangilangan tavsif',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Vazifa holati', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
