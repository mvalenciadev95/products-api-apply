import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'b7946068b64cd5e3c1d038b5990402b6',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
}));