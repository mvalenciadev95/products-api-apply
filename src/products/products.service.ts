import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const createdProduct = new this.productModel(createProductDto);
    return createdProduct.save();
  }

  async createOrUpdate(
    contentfulId: string,
    productData: Partial<CreateProductDto>,
  ): Promise<Product> {
    return this.productModel.findOneAndUpdate(
      { contentfulId },
      { ...productData, contentfulId },
      { upsert: true, new: true },
    );
  }

  async findAll(filterDto: FilterProductDto) {
    const {
      page = 1,
      limit = 5,
      name,
      category,
      minPrice,
      maxPrice,
    } = filterDto;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<ProductDocument> = { deleted: false };

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        filter.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        filter.price.$lte = maxPrice;
      }
    }

    const [data, total] = await Promise.all([
      this.productModel.find(filter).skip(skip).limit(limit).exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel
      .findOne({ _id: id, deleted: false })
      .exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async remove(id: string): Promise<void> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    product.deleted = true;
    product.deletedAt = new Date();
    await product.save();
  }

  async findAllForReports(filter?: FilterQuery<ProductDocument>): Promise<ProductDocument[]> {
    return this.productModel.find(filter || {}).exec();
  }

  async count(filter?: FilterQuery<ProductDocument>): Promise<number> {
    return this.productModel.countDocuments(filter || {}).exec();
  }
}
