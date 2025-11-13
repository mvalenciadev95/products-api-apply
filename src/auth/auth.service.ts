import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { User, UserWithoutPassword } from './interfaces/user.interface';

@Injectable()
export class AuthService {
  private readonly users: User[] = [
    {
      userId: 1,
      username: 'admin',
      password: 'admin123',
    },
  ];

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  validateUser(username: string, password: string): UserWithoutPassword | null {
    const user = this.users.find(
      (u) => u.username === username && u.password === password,
    );
    if (user) {
      const { password: _password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}