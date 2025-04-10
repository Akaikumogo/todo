// src/user/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Todo } from 'src/todo/todo.schema';

@Schema()
export class User {
  [x: string]: any;
  toObject(): { [x: string]: any; password: any } {
    throw new Error('Method not implemented.');
  }
  @Prop({ unique: true, required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop([{ type: Types.ObjectId, ref: 'Todo' }])
  todos: Todo[];
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
