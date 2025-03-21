import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export interface Order {
  _id?: string;
  userId: string;
  amount: number;
  description: string;
  status: string;
  paymentId?: string;
  paymentMethod?: string;
  products: any[];
  customerDetails: Record<string, any>;
  paymentDetails?: Record<string, any>;
  sellerId?: string;
}

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class OrderModel {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ['pending', 'paid', 'failed', 'canceled'] })
  status: string;

  @Prop()
  paymentId: string;

  @Prop()
  paymentMethod: string;

  @Prop({ type: [Object] })
  products: any[];

  @Prop({ type: Object })
  customerDetails: Record<string, any>;

  @Prop({ type: Object })
  paymentDetails: Record<string, any>;
  
  @Prop()
  sellerId: string;
}

export const OrderSchema = SchemaFactory.createForClass(OrderModel);