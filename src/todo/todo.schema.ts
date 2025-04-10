/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
// src/todo/todo.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Types } from 'mongoose';
import { User } from '../user/user.schema';

@Schema()
export class Todo {
  save(): Todo | PromiseLike<Todo> {
    throw new Error('Method not implemented.');
  }
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User;
  _id: unknown | ObjectId;
}

export type TodoDocument = Todo & Document;
export const TodoSchema = SchemaFactory.createForClass(Todo);
