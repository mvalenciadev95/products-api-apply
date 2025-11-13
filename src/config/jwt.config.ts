import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'df67f8636d95c1e73d596a83dd7c8b19',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
}));
