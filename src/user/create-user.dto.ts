import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  IsNumber,
  IsEnum,
  Matches,
  IsOptional,
  IsISO8601,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Unique username' })
  @IsString({ message: 'username matn bo‘lishi kerak' })
  readonly username: string;

  @ApiProperty({ description: 'Password' })
  @IsString({ message: 'password matn bo‘lishi kerak' })
  @MinLength(6, { message: 'password kamida 6 ta belgidan iborat bo‘lishi kerak' })
  readonly password: string;

  @ApiProperty({ description: 'Water depth in cm', type: Number, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'waterDepth son bo‘lishi kerak' })
  readonly waterDepth?: number;

  @ApiProperty({ description: 'Desired height in cm', type: Number, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'height son bo‘lishi kerak' })
  readonly height?: number;

  @ApiProperty({ description: 'Total litres of water used', type: Number, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'totalLitres son bo‘lishi kerak' })
  readonly totalLitres?: number;

  @ApiProperty({ description: 'Total electricity in kW', type: Number, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'totalElectricity son bo‘lishi kerak' })
  readonly totalElectricity?: number;

  @ApiProperty({
    description: 'Motor holati',
    enum: ['off', 'on'],
    required: false,
    default: 'off',
  })
  @IsOptional()
  @IsEnum(['off', 'on'], { message: 'motorState faqat "off" yoki "on" bo‘lishi kerak' })
  readonly motorState?: 'off' | 'on';

  @ApiProperty({
    description: 'Qolgan timer vaqti (MM:SS)',
    example: '00:30',
    required: false,
  })
  @IsOptional()
  @Matches(/^[0-5]\d:[0-5]\d$/, {
    message: 'timerRemaining format: MM:SS (00:00 dan 59:59 gacha)',
  })
  readonly timerRemaining?: string;

  @ApiProperty({
    description: 'ISO-formatdagi vaqt (timer oxirgi marta o‘rnatilgan payt)',
    example: '2025-06-01T12:34:56.000Z',
    required: false,
  })
  @IsOptional()
  @IsISO8601({}, { message: 'lastTimerTime ISO8601 formatida bo‘lishi kerak' })
  readonly lastTimerTime?: string;

  @ApiProperty({
    description: 'Oxirgi urinish serverga yuborilgan vaqt (ISO8601)',
    example: '2025-06-01T12:35:10.000Z',
    required: false,
  })
  @IsOptional()
  @IsISO8601({}, { message: 'lastHeartbeat ISO8601 formatida bo‘lishi kerak' })
  readonly lastHeartbeat?: string;
}
