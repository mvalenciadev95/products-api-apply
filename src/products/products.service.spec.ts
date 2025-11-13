import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductsService } from './products.service';
import { Product, ProductDocument } from './schemas/product.schema';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockProduct: Partial<ProductDocument> = {
    _id: '507f1f77bcf86cd799439011' as unknown,
    contentfulId: 'test-contentful-id',
    name: 'Test Product',
    category: 'Test Category',
    price: 100,
    deleted: false,
    save: jest.fn().mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      contentfulId: 'test-id',
      name: 'Test Product',
      category: 'Test',
      price: 100,
      deleted: false,
    }),
  };

  const mockQuery = {
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const createMockInstance = (dto: unknown): ProductDocument => {
    return {
      ...mockProduct,
      ...(dto as Record<string, unknown>),
      save: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        ...(dto as Record<string, unknown>),
        deleted: false,
      }),
    } as ProductDocument;
  };

  const MockModel = function (this: ProductDocument, dto: unknown) {
    return createMockInstance(dto);
  } as unknown as new (dto: unknown) => ProductDocument;

  const mockProductModel = Object.assign(MockModel, {
    find: jest.fn().mockReturnValue(mockQuery),
    findOne: jest.fn().mockReturnValue(mockQuery),
    findOneAndUpdate: jest.fn().mockResolvedValue(mockProduct),
    findById: jest.fn().mockReturnValue(mockQuery),
    countDocuments: jest.fn().mockReturnValue(mockQuery),
    create: jest.fn().mockResolvedValue(mockProduct),
  }) as unknown as Model<ProductDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createProductDto = {
        contentfulId: 'test-id',
        name: 'Test Product',
        category: 'Test',
        price: 100,
      };

      const result = await service.create(createProductDto);

      expect(result).toEqual({
        _id: '507f1f77bcf86cd799439011',
        contentfulId: 'test-id',
        name: 'Test Product',
        category: 'Test',
        price: 100,
        deleted: false,
      });
    });
  });
});
