import { Controller, Post, Body, UseGuards, Get, Request, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto, SigninDto } from './dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body(new ValidationPipe()) body: SigninDto) {
    return this.authService.signin(body);
  }

  @Post('signup')
  async signup(@Body(new ValidationPipe()) body: CreateUserDto) {
    return this.authService.createUser(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}