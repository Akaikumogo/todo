
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsEnum,
  IsString,
  Matches,
  IsISO8601,
} from 'class-validator';

export class UpdateUserDto {
  /** Username — yagona identifikator, o‘zgartirilishi kerak bo‘lsa, shu maydon yuboriladi */
  @ApiPropertyOptional({ description: 'Unique username' })
  @IsOptional()
  @IsString({ message: 'username matn bo‘lishi kerak' })
  username?: string;

  /** Parolni yangilash uchun */
  @ApiPropertyOptional({ description: 'New password' })
  @IsOptional()
  @IsString({ message: 'password matn bo‘lishi kerak' })
  password?: string;

  /** Suv chuqurligi (cm) */
  @ApiPropertyOptional({ description: 'Water depth in cm', type: Number })
  @IsOptional()
  @IsNumber({}, { message: 'waterDepth son bo‘lishi kerak' })
  waterDepth?: number;

  /** O‘rnatilgan balandlik (cm) */
  @ApiPropertyOptional({ description: 'Desired height in cm', type: Number })
  @IsOptional()
  @IsNumber({}, { message: 'height son bo‘lishi kerak' })
  height?: number;

  /** Sarflangan suv miqdori (L) */
  @ApiPropertyOptional({ description: 'Total litres of water used', type: Number })
  @IsOptional()
  @IsNumber({}, { message: 'totalLitres son bo‘lishi kerak' })
  totalLitres?: number;

  /** Elektr iste’moli (kW) */
  @ApiPropertyOptional({ description: 'Total electricity in kW', type: Number })
  @IsOptional()
  @IsNumber({}, { message: 'totalElectricity son bo‘lishi kerak' })
  totalElectricity?: number;

  /** Motor holati: `off` yoki `on` */
  @ApiPropertyOptional({
    description: 'Motor holati',
    enum: ['OFF', 'ON'],
    default: 'OFF',
  })
  @IsOptional()
  @IsEnum(['OFF', 'ON'], { message: 'motorState faqat "off" yoki "on" bo‘lishi kerak' })
  motorState?: 'OFF' | 'ON';

  /** Qolgan timer vaqti (MM:SS formatda, masalan “00:45”) */
  @ApiPropertyOptional({
    description: 'Qolgan timer vaqti (MM:SS)',
    example: '00:30',
  })
  @IsOptional()
  @Matches(/^[0-5]\d:[0-5]\d$/, {
    message: 'timerRemaining format: MM:SS (00:00 dan 59:59 gacha)',
  })
  timerRemaining?: string;

  /** Timer oxirgi marta o‘rnatilgan vaqt (ISO 8601 format) */
  @ApiPropertyOptional({
    description: 'ISO-formatdagi vaqt (timer oxirgi marta o‘rnatilgan payt)',
    example: '2025-06-01T12:34:56.000Z',
  })
  @IsOptional()
  @IsISO8601({}, { message: 'lastTimerTime ISO8601 formatida bo‘lishi kerak' })
  lastTimerTime?: string;

  /** So‘ngi heartbeat vaqti (ISO 8601 format) */
  @ApiPropertyOptional({
    description: 'Oxirgi urinish serverga yuborilgan vaqt (ISO8601)',
    example: '2025-06-01T12:35:10.000Z',
  })
  @IsOptional()
  @IsISO8601({}, { message: 'lastHeartbeat ISO8601 formatida bo‘lishi kerak' })
  lastHeartbeat?: string;
}
