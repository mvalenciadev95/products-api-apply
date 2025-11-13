import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';

@Injectable()
export class ReportsService {
  constructor(private readonly productsService: ProductsService) {}

  async getDeletedProductsPercentage(): Promise<{ percentage: number }> {
    const [total, deleted] = await Promise.all([
      this.productsService.count(),
      this.productsService.count({ deleted: true }),
    ]);

    const percentage = total > 0 ? (deleted / total) * 100 : 0;
    return { percentage: Math.round(percentage * 100) / 100 };
  }

  async getNonDeletedProductsWithPricePercentage(
    hasPrice: boolean,
    startDate?: string,
    endDate?: string,
  ): Promise<{ percentage: number }> {
    const filter: any = { deleted: false };

    if (hasPrice) {
      filter.price = { $exists: true, $ne: null, $gt: 0 };
    } else {
      filter.$or = [
        { price: { $exists: false } },
        { price: null },
        { price: 0 },
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const [total, matching] = await Promise.all([
      this.productsService.count({ deleted: false }),
      this.productsService.count(filter),
    ]);

    const percentage = total > 0 ? (matching / total) * 100 : 0;
    return { percentage: Math.round(percentage * 100) / 100 };
  }

  async getCategoryDistribution(): Promise<Record<string, number>> {
    const products = await this.productsService.findAllForReports({
      deleted: false,
    });

    const distribution: Record<string, number> = {};
    let uncategorized = 0;

    products.forEach((product) => {
      if (product.category) {
        distribution[product.category] =
          (distribution[product.category] || 0) + 1;
      } else {
        uncategorized++;
      }
    });

    if (uncategorized > 0) {
      distribution['Uncategorized'] = uncategorized;
    }

    return distribution;
  }
}