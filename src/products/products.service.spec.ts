import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductsService } from './products.service';
import { Product } from './schemas/product.schema';

describe('ProductsService', () => {
  let service: ProductsService;
  let model: Model<Product>;

  const mockProduct = {
    _id: '507f1f77bcf86cd799439011',
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

  const mockProductModel = jest.fn().mockImplementation((dto) => {
    return {
      ...mockProduct,
      ...dto,
      save: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        ...dto,
        deleted: false,
      }),
    };
  }) as any;
  
  const mockQuery = {
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };
  
  mockProductModel.find = jest.fn().mockReturnValue(mockQuery);
  mockProductModel.findOne = jest.fn().mockReturnValue(mockQuery);
  mockProductModel.findOneAndUpdate = jest.fn();
  mockProductModel.findById = jest.fn();
  mockProductModel.countDocuments = jest.fn().mockReturnValue(mockQuery);
  mockProductModel.create = jest.fn();
  mockProductModel.exec = jest.fn();

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
    model = module.get<Model<Product>>(getModelToken(Product.name));
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
      
      expect(mockProductModel).toHaveBeenCalledWith(createProductDto);
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
