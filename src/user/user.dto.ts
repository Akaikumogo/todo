import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsEnum,
  IsString,
  Matches,
  IsISO8601,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Username (unique identifier)' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'New password' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ description: 'Water depth in cm', type: Number })
  @IsOptional()
  @IsNumber({}, { message: 'waterDepth son bo‘lishi kerak' })
  waterDepth?: number;

  @ApiPropertyOptional({ description: 'Desired height in cm', type: Number })
  @IsOptional()
  @IsNumber({}, { message: 'height son bo‘lishi kerak' })
  height?: number;

  @ApiPropertyOptional({ description: 'Total litres of water used', type: Number })
  @IsOptional()
  @IsNumber({}, { message: 'totalLitres son bo‘lishi kerak' })
  totalLitres?: number;

  @ApiPropertyOptional({ description: 'Total electricity in kW', type: Number })
  @IsOptional()
  @IsNumber({}, { message: 'totalElectricity son bo‘lishi kerak' })
  totalElectricity?: number;

  @ApiPropertyOptional({
    description: 'Motor holati',
    enum: ['OFF', 'ON'],
    default: 'OFF',
  })
  @IsOptional()
  @IsEnum(['OFF', 'ON'], { message: 'motorState faqat "off" yoki "on" bo‘lishi kerak' })
  motorState?: 'OFF' | 'ON';

  @ApiPropertyOptional({
    description: 'Qolgan timer vaqti (MM:SS)',
    example: '00:30',
  })
  @IsOptional()
  @Matches(/^[0-5]\d:[0-5]\d$/, {
    message: 'timerRemaining format: MM:SS (00:00 dan 59:59 gacha)',
  })
  timerRemaining?: string;

  @ApiPropertyOptional({
    description: 'ISO-formatdagi vaqt (timer oxirgi marta o‘rnatilgan payt)',
    example: '2025-06-01T12:34:56.000Z',
  })
  @IsOptional()
  @IsISO8601({}, { message: 'lastTimerTime ISO8601 formatida bo‘lishi kerak' })
  lastTimerTime?: string;

  @ApiPropertyOptional({
    description: 'Oxirgi urinish serverga yuborilgan vaqt (ISO8601)',
    example: '2025-06-01T12:35:10.000Z',
  })
  @IsOptional()
  @IsISO8601({}, { message: 'lastHeartbeat ISO8601 formatida bo‘lishi kerak' })
  lastHeartbeat?: string;
}


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
    enum: ['OFF', 'ON'],
    required: false,
    default: 'OFF',
  })
  @IsOptional()
  @IsEnum(['OFF', 'ON'], { message: 'motorState faqat "off" yoki "on" bo‘lishi kerak' })
  readonly motorState?: 'OFF' | 'ON';

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
