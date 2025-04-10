import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TodoDocument, Todo } from './todo.schema';
import { UserDocument } from '../user/user.schema';

@Injectable()
export class TodoService {
  constructor(@InjectModel(Todo.name) private todoModel: Model<TodoDocument>) {}

  async findAll(user: UserDocument): Promise<TodoDocument[]> {
    // TodoDocument[]
    return this.todoModel.find({ user: user._id }).exec();
  }

  async findOne(id: string, user: UserDocument): Promise<TodoDocument> {
    // TodoDocument
    const todo = await this.todoModel
      .findOne({ _id: id, user: user._id })
      .exec();
    if (!todo)
      throw new UnauthorizedException('Todo not found or not authorized');
    return todo;
  }

  async create(
    title: string,
    description: string | undefined,
    user: UserDocument,
  ): Promise<TodoDocument> {
    // TodoDocument
    const todo = new this.todoModel({ title, description, user: user._id });
    return todo.save() as unknown as TodoDocument;
  }

  async update(
    id: string,
    title: string | undefined,
    description: string | undefined,
    completed: boolean | undefined,
    user: UserDocument,
  ): Promise<TodoDocument> {
    // TodoDocument
    const todo = await this.findOne(id, user);
    if (title !== undefined) todo.title = title; // undefined tekshiruvi
    if (description !== undefined) todo.description = description; // undefined tekshiruvi
    if (completed !== undefined) todo.completed = completed;
    return todo.save() as unknown as TodoDocument;
  }

  async delete(id: string, user: UserDocument): Promise<void> {
    const todo = await this.findOne(id, user);
    await this.todoModel.deleteOne({ _id: todo._id }).exec();
  }
}
