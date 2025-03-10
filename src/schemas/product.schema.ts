import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from './user.schema'; // Adjust the import path as necessary

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  quantity: number;
  
  @Prop()
  imageUrl: string;

  @Prop({ enum: ['active', 'out of stock'], default: 'active' })
  status: string;


  @Prop({ type: String, ref: 'User', required: true }) 
  userId: string;

}

export const ProductSchema = SchemaFactory.createForClass(Product); 