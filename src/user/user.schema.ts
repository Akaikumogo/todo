import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  // ----------------------------------------------------
  // ESP32’dan keladigan maydonlar
  // ----------------------------------------------------

  /** 
   * Suv chuqurligi (cm). ESP kodi “waterDepth” kaliti bilan butun son (Number) sifatida yuboradi. 
   */
  @Prop({ type: Number, required: false, default: 0 })
  waterDepth?: number;

  /**
   * O‘rnatilgan balandlik (cm). ESP kodi “height” kaliti bilan butun son (Number) keladi. 
   */
  @Prop({ type: Number, required: false, default: 0 })
  height?: number;

  /**
   * Sarflangan suv miqdori (L). ESP kodi “totalLitres” bilan float/tub son keltiradi. 
   */
  @Prop({ type: Number, required: false, default: 0 })
  totalLitres?: number;

  /**
   * Elektr iste’moli (kW). ESP kodi “totalElectricity” kaliti bilan float/tub son keltiradi. 
   */
  @Prop({ type: Number, required: false, default: 0 })
  totalElectricity?: number;

  /**
   * Motor holati: `"off"` yoki `"on"`. ESP kodi “motorState” bilan string (enum) sifatida yuboradi. 
   */
  @Prop({ type: String, enum: ['off', 'on'], required: false, default: 'off' })
  motorState?: 'off' | 'on';

  /**
   * Qolgan timer vaqti MM:SS formatida (masalan: "01:23"). 
   * ESP kodi “timerRemaining” kaliti bilan shu formatda string yuboradi. 
   */
  @Prop({ type: String, required: false, default: '00:00' })
  timerRemaining?: string;

  /**
   * Timer oxirgi marta o‘rnatilgan vaqt (ISO-formatdagi sana/soat). 
   * ESP kodi “lastTimerTime” kaliti bilan, misol uchun: "2025-06-01T12:34:56.000Z".
   */
  @Prop({ type: Date, required: false })
  lastTimerTime?: Date;

  /**
   * Oxirgi “heartbeat” (ESP dan serverga berilgan so‘ngi signal) vaqti (ISO 8601 format). 
   * Har PATCH so‘rovi kelganda, ESP kodi har doim hozirgi vaqtni “lastHeartbeat” kaliti bilan yuborsa,
   * bu maydonni yangilash mumkin. 
   */
  @Prop({ type: Date, required: false })
  lastHeartbeat?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
