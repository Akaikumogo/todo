import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'; // Swagger dekoratorlari
import { LoginDto } from './dto/login.dto';

@ApiTags('auth') // Swaggerda "auth" guruhi
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Foydalanuvchi tizimga kirishi' })
  @ApiResponse({
    status: 200,
    description: 'Muvaffaqiyatli kirish, token qaytariladi',
  })
  @ApiResponse({ status: 401, description: "Noto'g'ri username yoki parol" })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    if (!user) throw new UnauthorizedException();
    return this.authService.login(user);
  }

  @Post('register')
  @ApiOperation({ summary: "Foydalanuvchi ro'yxatdan o'tishi" })
  @ApiResponse({ status: 201, description: "Muvaffaqiyatli ro'yxatdan o'tish" })
  @ApiResponse({ status: 400, description: "Noto'g'ri ma'lumotlar" })
  @ApiResponse({ status: 409, description: "Foydalanuvchi nomi allaqachon mavjud" })
  async register(@Body() loginDto: LoginDto) {
    try {
      // Check if user already exists
      const existingUser = await this.authService.validateUser(loginDto.username, '', false);
      if (existingUser) {
        throw new UnauthorizedException('Foydalanuvchi nomi allaqachon mavjud');
      }
      
      // Create new user
      const newUser = await this.authService.register(loginDto.username, loginDto.password);
      return {
        message: "Muvaffaqiyatli ro'yxatdan o'tildi",
        username: newUser.username
      };
    } catch (error) {
      console.log(error);
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Ro'yxatdan o'tishda xatolik yuz berdi");
    }
  }
}
