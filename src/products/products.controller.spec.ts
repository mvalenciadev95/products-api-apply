import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProductsController', () => {
  let controller: ProductsController;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createProductDto: CreateProductDto = {
        contentfulId: 'test-id',
        name: 'Test Product',
        category: 'Test',
        price: 100,
      };
      const expectedProduct = {
        _id: '507f1f77bcf86cd799439011',
        ...createProductDto,
      };

      mockProductsService.create.mockResolvedValue(expectedProduct);

      const result = await controller.create(createProductDto);

      expect(result).toEqual(expectedProduct);
      expect(mockProductsService.create).toHaveBeenCalledWith(createProductDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const filterDto: FilterProductDto = {
        page: 1,
        limit: 5,
      };
      const expectedResult = {
        data: [],
        meta: {
          page: 1,
          limit: 5,
          total: 0,
          totalPages: 0,
        },
      };

      mockProductsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(filterDto);

      expect(result).toEqual(expectedResult);
      expect(mockProductsService.findAll).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const productId = '507f1f77bcf86cd799439011';
      const expectedProduct = {
        _id: productId,
        name: 'Test Product',
      };

      mockProductsService.findOne.mockResolvedValue(expectedProduct);

      const result = await controller.findOne(productId);

      expect(result).toEqual(expectedProduct);
      expect(mockProductsService.findOne).toHaveBeenCalledWith(productId);
    });

    it('should throw NotFoundException when product not found', async () => {
      const productId = '507f1f77bcf86cd799439011';

      mockProductsService.findOne.mockRejectedValue(
        new NotFoundException(`Product with ID ${productId} not found`),
      );

      await expect(controller.findOne(productId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      const productId = '507f1f77bcf86cd799439011';

      mockProductsService.remove.mockResolvedValue(undefined);

      await controller.remove(productId);

      expect(mockProductsService.remove).toHaveBeenCalledWith(productId);
    });

    it('should throw NotFoundException when product not found', async () => {
      const productId = '507f1f77bcf86cd799439011';

      mockProductsService.remove.mockRejectedValue(
        new NotFoundException(`Product with ID ${productId} not found`),
      );

      await expect(controller.remove(productId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
