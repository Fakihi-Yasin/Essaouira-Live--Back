import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

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

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;


  @Prop()
  imageUrl: string;

  @Prop({ 
    type: String,
    enum: ['in stock', 'out of stock'],
    default: function() {
      return this.quantity > 0 ? 'in stock' : 'out of stock';
    }
  })
  status: string;

  @Prop({ default: true })
  display: boolean;


  @Prop({ type: String, ref: 'User', required: true }) 
  userId: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Add middleware to update status when quantity changes
ProductSchema.pre('save', function(next) {
  if (this.isModified('quantity')) {
    this.status = this.quantity > 0 ? 'in stock' : 'out of stock';
  }
  next();
});

// Apply the same logic to update operations
ProductSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update && 'quantity' in update) {
    if (update.quantity > 0) {
      this.set({ status: 'in stock' });
    } else {
      this.set({ status: 'out of stock' });
    }
  }
  next();
});