import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'contentful';
import { ProductsService } from '../products/products.service';
import { ContentfulProductFields } from './interfaces/contentful-fields.interface';

@Injectable()
export class ContentfulService {
  private readonly logger = new Logger(ContentfulService.name);
  private client: ReturnType<typeof createClient>;

  constructor(
    private configService: ConfigService,
    private productsService: ProductsService,
  ) {
    const spaceId = this.configService.get<string>('contentful.spaceId');
    const accessToken = this.configService.get<string>(
      'contentful.accessToken',
    );
    const environment = this.configService.get<string>(
      'contentful.environment',
    );

    this.client = createClient({
      space: spaceId || '',
      accessToken: accessToken || '',
      environment: environment || '',
    });
  }

  async fetchAndSyncProducts(): Promise<void> {
    try {
      this.logger.log('Starting Contentful products sync...');

      const contentType = this.configService.get<string>(
        'contentful.contentType',
      );

      const response = await this.client.getEntries({
        content_type: contentType,
        limit: 1000,
      });

      this.logger.log(
        `Fetched ${response.items.length} products from Contentful`,
      );

      for (const item of response.items) {
        const fields = item.fields as ContentfulProductFields;
        const contentfulId = item.sys.id;

        const productData = {
          contentfulId,
          name: fields.name || fields.title || 'Unnamed Product',
          category: fields.category || fields.categories?.[0] || undefined,
          price: fields.price || undefined,
          rawData: {
            ...fields,
            sys: item.sys,
          },
        };

        await this.productsService.createOrUpdate(contentfulId, productData);
      }

      this.logger.log('Contentful products sync completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error syncing Contentful products: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }
}
