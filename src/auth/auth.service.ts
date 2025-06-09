import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto, SigninDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  async createUser(createUserDto: CreateUserDto) {
    try {
      const isExist = await this.usersService.findByEmail(createUserDto.email);
  
      if (isExist) {
        throw new BadRequestException('User already exists with this email');
      }
  
      const user = await this.usersService.create(createUserDto);
      const payload = { email: user.email, id: user.id, name: user.name };
      const token = this.jwtService.sign(payload);
      delete user.password;
      return {
        user,
        token,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
  
      throw new InternalServerErrorException('Failed to create user');
    }
  }
  async signin(body: SigninDto) {
    const { email, password } = body;
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = {
      email: user.email,
      id: user.id,
      name: user.name,
    };
    const token = this.jwtService.sign(payload);
    delete user.password
    return {
      user,
      token,
    };
  }

  async validateUser(userId: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    await this.usersService.update(userId, user);
    return user;
  }
}