import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoDocument } from './todo.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@ApiTags('todos')
@ApiBearerAuth('JWT-auth')
@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha vazifalarni olish' })
  @ApiResponse({ status: 200, description: "Vazifalar ro'yxati" })
  findAll(@Request() req): Promise<TodoDocument[]> {
    return this.todoService.findAll(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta vazifani olish' })
  @ApiResponse({ status: 200, description: 'Vazifa topildi' })
  @ApiResponse({ status: 401, description: "Ruxsat yo'q yoki topilmadi" })
  findOne(@Param('id') id: string, @Request() req): Promise<TodoDocument> {
    return this.todoService.findOne(id, req.user);
  }

  @Post()
  @ApiOperation({ summary: "Yangi vazifa qo'shish" })
  @ApiResponse({ status: 201, description: "Vazifa qo'shildi" })
  create(
    @Body() createTodoDto: CreateTodoDto,
    @Request() req,
  ): Promise<TodoDocument> {
    return this.todoService.create(
      createTodoDto.title,
      createTodoDto.description,
      req.user,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Vazifani yangilash' })
  @ApiResponse({ status: 200, description: 'Vazifa yangilandi' })
  update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @Request() req,
  ): Promise<TodoDocument> {
    return this.todoService.update(
      id,
      updateTodoDto.title,
      updateTodoDto.description,
      updateTodoDto.completed,
      req.user,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: "Vazifani o'chirish" })
  @ApiResponse({ status: 200, description: "Vazifa o'chirildi" })
  delete(@Param('id') id: string, @Request() req): Promise<void> {
    return this.todoService.delete(id, req.user);
  }
}
