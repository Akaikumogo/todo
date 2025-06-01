/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string, checkPasswordMatch = true): Promise<any> {
    const user = await this.userService.findByUsername(username);
    
    // If we're just checking if the user exists (for registration)
    if (!checkPasswordMatch && user) {
      // Convert to plain object to avoid TypeScript errors
      const userObj = user as any;
      const { password, ...result } = userObj.toObject ? userObj.toObject() : userObj;
      return result;
    }
    
    // Normal login validation
    if (user && checkPasswordMatch && (await bcrypt.compare(password, user.password))) {
      // Convert to plain object to avoid TypeScript errors
      const userObj = user as any;
      const { password, ...result } = userObj.toObject ? userObj.toObject() : userObj;
      return result;
    }
    
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(username: string, password: string) {
    return this.userService.create(username, password);
  }
}
