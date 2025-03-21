// src/orders/orders.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderModel } from './order.schema';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(OrderModel.name) private orderModel: Model<OrderDocument>
  ) {}

  async create(orderData: Partial<Order>): Promise<Order> {
    try {
      console.log('OrdersService.create called with:', JSON.stringify(orderData));
  console.log('Products data:', JSON.stringify(orderData.products));
  
      this.logger.log(`Creating order with data: ${JSON.stringify(orderData)}`);
      const newOrder = new this.orderModel(orderData);
      const savedOrder = await newOrder.save();
      this.logger.log(`Order created successfully with ID: ${savedOrder._id}`);
      return savedOrder.toObject() as Order;
    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`);
      if (error.name === 'ValidationError') {
        this.logger.error(`Validation error details: ${JSON.stringify(error.errors)}`);
      }
      throw error;
    }
  }
  async findById(orderId: string): Promise<Order | null> {
    try {
      const order = await this.orderModel.findById(orderId).exec();
      return order ? order.toObject() as Order : null;
    } catch (error) {
      this.logger.error(`Failed to find order by ID: ${error.message}`);
      throw error;
    }
  }

  async findByPaymentId(paymentId: string): Promise<Order | null> {
    try {
      const order = await this.orderModel.findOne({ paymentId }).exec();
      return order ? order.toObject() as Order : null;
    } catch (error) {
      this.logger.error(`Failed to find order by payment ID: ${error.message}`);
      throw error;
    }
  }

  async updatePaymentStatus(paymentId: string, status: string, paymentDetails: any): Promise<Order | null> {
    try {
      const updatedOrder = await this.orderModel.findOneAndUpdate(
        { paymentId },
        { 
          status, 
          paymentDetails,
          ...(status === 'paid' ? { paymentMethod: paymentDetails.method } : {})
        },
        { new: true }
      ).exec();
      
      return updatedOrder ? updatedOrder.toObject() as Order : null;
    } catch (error) {
      this.logger.error(`Failed to update payment status: ${error.message}`);
      throw error;
    }
  }

  // Add the missing methods for user and seller orders
  async findOrdersByUserId(userId: string): Promise<Order[]> {
    try {
      const orders = await this.orderModel.find({ userId }).exec();
      return orders.map(order => order.toObject() as Order);
    } catch (error) {
      this.logger.error(`Failed to find orders by user ID: ${error.message}`);
      throw error;
    }
  }

  async findOrdersBySellerId(sellerId: string): Promise<Order[]> {
    try {
      const orders = await this.orderModel.find({ sellerId }).exec();
      return orders.map(order => order.toObject() as Order);
    } catch (error) {
      this.logger.error(`Failed to find orders by seller ID: ${error.message}`);
      throw error;
    }
  }
// Add this method to your OrdersService class in orders.service.ts
async updateOrderById(orderId: string, updates: Partial<Order>): Promise<Order | null> {
  try {
    this.logger.log(`Updating order ${orderId} with: ${JSON.stringify(updates)}`);
    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      orderId,
      updates,
      { new: true }
    ).exec();
    
    return updatedOrder ? updatedOrder.toObject() as Order : null;
  } catch (error) {
    this.logger.error(`Failed to update order by ID: ${error.message}`);
    throw error;
  }
}
}