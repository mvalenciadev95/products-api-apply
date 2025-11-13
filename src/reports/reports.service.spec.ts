import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { ProductsService } from '../products/products.service';

describe('ReportsService', () => {
  let service: ReportsService;

  const mockProductsService = {
    count: jest.fn(),
    findAllForReports: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDeletedProductsPercentage', () => {
    it('should calculate percentage of deleted products', async () => {
      mockProductsService.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(25);

      const result = await service.getDeletedProductsPercentage();

      expect(result.percentage).toBe(25);
    });

    it('should return 0 if no products exist', async () => {
      mockProductsService.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const result = await service.getDeletedProductsPercentage();

      expect(result.percentage).toBe(0);
    });
  });

  describe('getCategoryDistribution', () => {
    it('should return category distribution', async () => {
      const mockProducts = [
        { category: 'Electronics' },
        { category: 'Electronics' },
        { category: 'Clothing' },
        { category: null },
      ] as Array<{ category: string | null }>;

      mockProductsService.findAllForReports.mockResolvedValue(mockProducts);

      const result = await service.getCategoryDistribution();

      expect(result['Electronics']).toBe(2);
      expect(result['Clothing']).toBe(1);
      expect(result['Uncategorized']).toBe(1);
    });

    it('should return empty distribution when no products', async () => {
      mockProductsService.findAllForReports.mockResolvedValue([]);

      const result = await service.getCategoryDistribution();

      expect(result).toEqual({});
    });

    it('should not include Uncategorized when all products have categories', async () => {
      const mockProducts = [
        { category: 'Electronics' },
        { category: 'Clothing' },
      ] as Array<{ category: string | null }>;

      mockProductsService.findAllForReports.mockResolvedValue(mockProducts);

      const result = await service.getCategoryDistribution();

      expect(result['Uncategorized']).toBeUndefined();
    });
  });

  describe('getNonDeletedProductsWithPricePercentage', () => {
    it('should calculate percentage for products with price', async () => {
      mockProductsService.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(75);

      const result =
        await service.getNonDeletedProductsWithPricePercentage(true);

      expect(result.percentage).toBe(75);
    });

    it('should calculate percentage for products without price', async () => {
      mockProductsService.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(25);

      const result =
        await service.getNonDeletedProductsWithPricePercentage(false);

      expect(result.percentage).toBe(25);
    });

    it('should filter by date range', async () => {
      mockProductsService.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(50);

      const result = await service.getNonDeletedProductsWithPricePercentage(
        true,
        '2024-01-01',
        '2024-12-31',
      );

      expect(result.percentage).toBe(50);
    });

    it('should filter by start date only', async () => {
      mockProductsService.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(60);

      const result = await service.getNonDeletedProductsWithPricePercentage(
        true,
        '2024-01-01',
      );

      expect(result.percentage).toBe(60);
    });

    it('should filter by end date only', async () => {
      mockProductsService.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(40);

      const result = await service.getNonDeletedProductsWithPricePercentage(
        true,
        undefined,
        '2024-12-31',
      );

      expect(result.percentage).toBe(40);
    });

    it('should return 0 when no products exist', async () => {
      mockProductsService.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const result =
        await service.getNonDeletedProductsWithPricePercentage(true);

      expect(result.percentage).toBe(0);
    });
  });
});
