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
    const spaceId = this.configService.get<string>('contentful.spaceId');
    const accessToken = this.configService.get<string>(
      'contentful.accessToken',
    );

    if (!spaceId || !accessToken) {
      this.logger.warn('Contentful credentials not configured. Skipping sync.');
      return;
    }

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
      let errorMessage = 'Unknown error';
      if (error && typeof error === 'object' && 'status' in error) {
        const statusError = error as { status: number; message?: string };
        if (statusError.status === 404) {
          errorMessage =
            'Contentful space not found. Please check your CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN.';
        } else if (statusError.status === 401) {
          errorMessage =
            'Contentful authentication failed. Please check your CONTENTFUL_ACCESS_TOKEN.';
        } else {
          errorMessage =
            statusError.message ||
            `Contentful API error (${statusError.status})`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      this.logger.error(`Error syncing Contentful products: ${errorMessage}`);
      throw error;
    }
  }
}
