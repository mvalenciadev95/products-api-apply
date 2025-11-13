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

  const mockFind = jest.fn().mockReturnValue(mockQuery);
  const mockFindOne = jest.fn().mockReturnValue(mockQuery);
  const mockFindOneAndUpdate = jest.fn().mockResolvedValue(mockProduct);
  const mockFindById = jest.fn().mockReturnValue(mockQuery);
  const mockCountDocuments = jest.fn().mockReturnValue(mockQuery);
  const mockCreate = jest.fn().mockResolvedValue(mockProduct);

  const mockProductModel = Object.assign(MockModel, {
    find: mockFind,
    findOne: mockFindOne,
    findOneAndUpdate: mockFindOneAndUpdate,
    findById: mockFindById,
    countDocuments: mockCountDocuments,
    create: mockCreate,
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

  describe('createOrUpdate', () => {
    it('should create or update a product', async () => {
      const productData = {
        name: 'Updated Product',
        price: 200,
      };

      const result = await service.createOrUpdate('test-id', productData);

      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { contentfulId: 'test-id' },
        { ...productData, contentfulId: 'test-id' },
        { upsert: true, new: true },
      );
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      mockQuery.exec
        .mockResolvedValueOnce([mockProduct])
        .mockResolvedValueOnce(1);

      const filterDto = { page: 1, limit: 5 };
      const result = await service.findAll(filterDto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(5);
    });

    it('should filter by name', async () => {
      mockQuery.exec
        .mockResolvedValueOnce([mockProduct])
        .mockResolvedValueOnce(1);

      const filterDto = { name: 'Test' };
      await service.findAll(filterDto);

      expect(mockFind).toHaveBeenCalled();
    });

    it('should filter by category', async () => {
      mockQuery.exec
        .mockResolvedValueOnce([mockProduct])
        .mockResolvedValueOnce(1);

      const filterDto = { category: 'Electronics' };
      await service.findAll(filterDto);

      expect(mockFind).toHaveBeenCalled();
    });

    it('should filter by price range', async () => {
      mockQuery.exec
        .mockResolvedValueOnce([mockProduct])
        .mockResolvedValueOnce(1);

      const filterDto = { minPrice: 10, maxPrice: 100 };
      await service.findAll(filterDto);

      expect(mockFind).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      mockQuery.exec.mockResolvedValueOnce(mockProduct);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toBeDefined();
      expect(mockFindOne).toHaveBeenCalledWith({
        _id: '507f1f77bcf86cd799439011',
        deleted: false,
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      mockQuery.exec.mockResolvedValueOnce(null);

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(
        'Product with ID 507f1f77bcf86cd799439011 not found',
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a product', async () => {
      const productWithSave = {
        ...mockProduct,
        save: jest.fn().mockResolvedValue(mockProduct),
      };
      mockQuery.exec.mockResolvedValueOnce(productWithSave);

      await service.remove('507f1f77bcf86cd799439011');

      expect(productWithSave.deleted).toBe(true);
      expect(productWithSave.deletedAt).toBeInstanceOf(Date);
      expect(productWithSave.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product not found', async () => {
      mockQuery.exec.mockResolvedValueOnce(null);

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(
        'Product with ID 507f1f77bcf86cd799439011 not found',
      );
    });
  });

  describe('findAllForReports', () => {
    it('should return all products for reports', async () => {
      mockQuery.exec.mockResolvedValueOnce([mockProduct]);

      const result = await service.findAllForReports({ deleted: false });

      expect(result).toEqual([mockProduct]);
      expect(mockFind).toHaveBeenCalledWith({ deleted: false });
    });

    it('should return all products when no filter provided', async () => {
      mockQuery.exec.mockResolvedValueOnce([mockProduct]);

      const result = await service.findAllForReports();

      expect(result).toEqual([mockProduct]);
      expect(mockFind).toHaveBeenCalledWith({});
    });
  });

  describe('count', () => {
    it('should return count of products', async () => {
      mockQuery.exec.mockResolvedValueOnce(10);

      const result = await service.count({ deleted: false });

      expect(result).toBe(10);
      expect(mockCountDocuments).toHaveBeenCalledWith({
        deleted: false,
      });
    });

    it('should return count when no filter provided', async () => {
      mockQuery.exec.mockResolvedValueOnce(5);

      const result = await service.count();

      expect(result).toBe(5);
      expect(mockCountDocuments).toHaveBeenCalledWith({});
    });
  });
});
