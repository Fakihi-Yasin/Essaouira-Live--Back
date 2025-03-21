// src/payment/payment.controller.ts
import { Controller, Post, Body, Get, Param, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { MollieService } from './mollie.service';
import { OrdersService } from '../orders/orders.service';
import { CreatePaymentDto } from './dto/payment.dto';

@Controller('payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly mollieService: MollieService,
    private readonly ordersService: OrdersService
  ) {}

  @Post('create')
  async createPayment(@Body() paymentData: CreatePaymentDto) {
    try {
      if (!paymentData.userId) {
        this.logger.warn('No userId provided, using guest user');
        paymentData.userId = 'guest-user'; // Or handle differently based on your requirements
      }
      
      this.logger.log(`Creating order for user: ${paymentData.userId}`);
      
const orderData = {
  userId: paymentData.userId,
  amount: paymentData.amount,
  description: paymentData.description,
  status: 'pending',
  products: paymentData.items || [],
  customerDetails: paymentData.customerDetails || {}
};


      
      const order = await this.ordersService.create(orderData);
      this.logger.log(`Order created with ID: ${order._id}`);
      
      // Type check and handle the case where _id could be undefined
      if (!order._id) {
        throw new HttpException('Order created without ID', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      
      // 2. Create the payment with Mollie using the non-null orderId
      const payment = await this.mollieService.createPayment(
        paymentData.amount,
        order._id.toString(), // Explicit conversion to string to satisfy TypeScript
        paymentData.description,
        paymentData.redirectUrl
      );
      
      // 3. Update the order with the payment ID
      await this.ordersService.updateOrderById(
        order._id.toString(), 
        { paymentId: payment.id }
      );
      
      this.logger.log(`Payment created and linked to order: ${payment.id}`);

      return {
        orderId: order._id,
        paymentId: payment.id,
        checkoutUrl: payment._links.checkout.href
      };
    } catch (error) {
      this.logger.error(`Failed to create payment: ${error.message}`);
      throw new HttpException('Payment creation failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getPayment(@Param('id') paymentId: string) {
    try {
      const payment = await this.mollieService.getPayment(paymentId);
      return {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        description: payment.description,
        metadata: payment.metadata
      };
    } catch (error) {
      this.logger.error(`Failed to get payment: ${error.message}`);
      throw new HttpException('Payment retrieval failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    try {
      if (!body.id) {
        this.logger.error('Webhook received without payment ID');
        return { received: true };
      }
      
      const paymentId = body.id;
      this.logger.log(`Received webhook for payment: ${paymentId}`);
      
      // 1. Get payment details from Mollie
      const payment = await this.mollieService.getPayment(paymentId);
      
      // 2. Update the order with payment status
      const order = await this.ordersService.updatePaymentStatus(
        paymentId,
        payment.status === 'paid' ? 'paid' : 
        payment.status === 'failed' ? 'failed' : 
        payment.status === 'canceled' ? 'canceled' : 'pending',
        payment
      );
      
      if (order) {
        this.logger.log(`Order ${order._id} updated with status: ${payment.status}`);
      } else {
        this.logger.warn(`No order found for payment ID: ${paymentId}`);
      }
      
      // Always return 200 for Mollie webhooks
      return { received: true };
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`);
      // Still return 200 to prevent Mollie from retrying
      return { received: true };
    }
  }
}