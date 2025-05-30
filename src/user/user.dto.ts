// src/user/user.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  waterHeight?: string;

  @ApiProperty({ required: false })
  totalElectricity?: string;

  @ApiProperty({ required: false })
  waterVolume?: string;

  @ApiProperty({ required: false, enum: ['off', 'on'] })
  motorState?: 'off' | 'on';

  @ApiProperty({ required: false })
  totalWater?: string;

  @ApiProperty({ required: false, description: 'Format: HH:MM' })
  timer?: string;

  @ApiProperty({ required: false, description: 'ISO date string of when the timer was last set' })
  lastTimerTime?: string;
}
