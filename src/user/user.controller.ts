import {
  Controller,
  Patch,
  Get,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UpdateUserDto } from './update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllUsers(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.userService.getAllUsers(page, limit);
  }

  @Get(':username')
  async getUser(@Param('username') username: string) {
    return this.userService.findByUsername(username);
  }

  @Patch(':username')
  @ApiOperation({ summary: 'Update user by username (partial)' })
  async patchUser(
    @Param('username') username: string,
    @Body() updateData: UpdateUserDto,
  ) {
    return this.userService.updateUser(username, updateData);
  }x

  @Delete(':username')
  @ApiOperation({ summary: 'Delete user by username' })
  async deleteUser(@Param('username') username: string) {
    await this.userService.deleteUser(username);
    return { message: 'User deleted successfully' };
  }
}
