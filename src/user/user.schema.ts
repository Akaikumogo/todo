// src/user/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User {
  toObject(): { [x: string]: any; password: any; } {
    throw new Error('Method not implemented.');
  }
  @Prop({ unique: true, required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false })
  waterHeight: string;

  @Prop({ required: false })
  totalElectricity: string;

  @Prop({ required: false })
  waterVolume: string;

  @Prop({ required: false })
  motorState: 'off' | 'on';

  @Prop({ required: false })
  totalWater: string;

  @Prop({ required: false })
  timer: string;

  @Prop({ required: false })
  lastTimerTime: string;

  @Prop({ required: false })
  lastHeartbeat: string;

}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
