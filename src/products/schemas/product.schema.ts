import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, unique: true })
  contentfulId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  category?: string;

  @Prop()
  price?: number;

  @Prop({ type: Object })
  rawData?: Record<string, any>;

  @Prop({ default: false })
  deleted: boolean;

  @Prop()
  deletedAt?: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

/* Indices */
ProductSchema.index({ deleted: 1 });
ProductSchema.index({ name: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });