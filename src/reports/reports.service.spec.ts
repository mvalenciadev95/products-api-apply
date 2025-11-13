import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { ProductsService } from '../products/products.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let productsService: ProductsService;

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
    productsService = module.get<ProductsService>(ProductsService);
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
      ] as any;

      mockProductsService.findAllForReports.mockResolvedValue(mockProducts);

      const result = await service.getCategoryDistribution();

      expect(result['Electronics']).toBe(2);
      expect(result['Clothing']).toBe(1);
      expect(result['Uncategorized']).toBe(1);
    });
  });
});
