import { registerAs } from '@nestjs/config';

export default registerAs('contentful', () => ({
  spaceId: process.env.CONTENTFUL_SPACE_ID || '',
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || '',
  environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
  contentType: process.env.CONTENTFUL_CONTENT_TYPE || 'product',
}));