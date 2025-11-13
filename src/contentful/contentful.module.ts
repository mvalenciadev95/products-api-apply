import { Module } from '@nestjs/common';
import { ContentfulService } from './contentful.service';
import { ContentfulController } from './contentful.controller';
import { ContentfulScheduler } from './contentful.scheduler';
import { ProductsModule } from '../products/products.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ProductsModule, AuthModule],
  controllers: [ContentfulController],
  providers: [ContentfulService, ContentfulScheduler],
  exports: [ContentfulService],
})
export class ContentfulModule {}