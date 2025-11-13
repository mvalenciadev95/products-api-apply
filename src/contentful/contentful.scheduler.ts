import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ContentfulService } from './contentful.service';

@Injectable()
export class ContentfulScheduler {
  private readonly logger = new Logger(ContentfulScheduler.name);

  constructor(private readonly contentfulService: ContentfulService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.log('Running scheduled Contentful sync...');
    try {
      await this.contentfulService.fetchAndSyncProducts();
      this.logger.log('Scheduled Contentful sync completed');
    } catch (error) {
      this.logger.warn(
        `Scheduled Contentful sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
