// src/orders/orders.controller.ts
import { Controller, Get, Param, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(
    private readonly ordersService: OrdersService
  ) {}

  @Get('user/:userId')
  async getUserOrders(@Param('userId') userId: string) {
    try {
      return await this.ordersService.findOrdersByUserId(userId);
    } catch (error) {
      this.logger.error(`Failed to get user orders: ${error.message}`);
      throw new HttpException('Failed to get user orders', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('seller/:sellerId')
  async getSellerOrders(@Param('sellerId') sellerId: string) {
    try {
      return await this.ordersService.findOrdersBySellerId(sellerId);
    } catch (error) {
      this.logger.error(`Failed to get seller orders: ${error.message}`);
      throw new HttpException('Failed to get seller orders', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getOrder(@Param('id') orderId: string) {
    try {
      const order = await this.ordersService.findById(orderId);
      if (!order) {
        throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
      }
      return order;
    } catch (error) {
      this.logger.error(`Failed to get order: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to get order', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}