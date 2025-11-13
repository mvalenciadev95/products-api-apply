import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user object from payload', () => {
      const payload: JwtPayload = {
        sub: 1,
        username: 'admin',
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        userId: 1,
        username: 'admin',
      });
    });

    it('should throw UnauthorizedException when payload is null', () => {
      expect(() => strategy.validate(null as unknown as JwtPayload)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when payload is undefined', () => {
      expect(() =>
        strategy.validate(undefined as unknown as JwtPayload),
      ).toThrow(UnauthorizedException);
    });
  });
});
