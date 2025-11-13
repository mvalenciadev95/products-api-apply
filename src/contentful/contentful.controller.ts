import { Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ContentfulService } from './contentful.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('contentful')
@Controller('contentful')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContentfulController {
  constructor(private readonly contentfulService: ContentfulService) {}

  @Post('sync')
  @ApiOperation({ summary: 'Manually trigger Contentful products sync' })
  @ApiResponse({ status: 200, description: 'Sync completed successfully' })
  async sync() {
    await this.contentfulService.fetchAndSyncProducts();
    return { message: 'Products synced successfully' };
  }
}
