// src/payment/mollie.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { createMollieClient } from '@mollie/api-client';
import { OrdersService } from '../orders/orders.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MollieService {
  private readonly logger = new Logger(MollieService.name);
  private mollieClient;
  private baseUrl: string;

  constructor(
    private readonly ordersService: OrdersService,
    private readonly configService: ConfigService 
  ) {
    // Initialize Mollie client with your API key
    this.mollieClient = createMollieClient({
      apiKey: this.configService.get('MOLLIE_API_KEY') || 'unvalid api'
    });
    
    this.baseUrl = this.configService.get('BASE_URL') || 'http://localhost:3000';
  }

  async createPayment(amount: number, orderId: string, description: string, redirectUrl: string, items: any = null) {
    try {
      const webhookUrl = `${this.configService.get('WEBHOOK_BASE_URL')}/payments/webhook`;
      this.logger.log(`Creating payment with webhook URL: ${webhookUrl}`);
      
      const payment = await this.mollieClient.payments.create({
        amount: {
          currency: 'EUR',
          value: amount.toFixed(2) // Format as string with 2 decimal places
        },
        description,
        redirectUrl,
        webhookUrl,  // Add webhook URL
        metadata: {
          orderId
        }
      });

      this.logger.log(`Payment created: ${payment.id}`);
      return payment;
    } catch (error) {
      this.logger.error(`Error creating payment: ${error.message}`);
      throw error;
    }
  }

  async getPayment(paymentId: string) {
    try {
      return await this.mollieClient.payments.get(paymentId);
    } catch (error) {
      this.logger.error(`Error fetching payment: ${error.message}`);
      throw error;
    }
  }
}