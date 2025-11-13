import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', () => {
      const result = service.validateUser('admin', 'admin123');
      expect(result).toBeDefined();
      expect(result?.username).toBe('admin');
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if credentials are invalid', () => {
      const result = service.validateUser('admin', 'wrong-password');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token for valid credentials', () => {
      const loginDto = { username: 'admin', password: 'admin123' };
      const result = service.login(loginDto);

      expect(result).toHaveProperty('access_token');
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid credentials', () => {
      const loginDto = { username: 'admin', password: 'wrong-password' };

      expect(() => service.login(loginDto)).toThrow(UnauthorizedException);
    });
  });
});
