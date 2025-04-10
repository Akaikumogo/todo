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
  register(@Body() loginDto: LoginDto) {
    // LoginDto ishlatilmoqda, lekin alohida RegisterDto yaratish ham mumkin
    return this.authService.register(loginDto.username, loginDto.password);
  }
}
