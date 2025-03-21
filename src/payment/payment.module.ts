// src/payment/payment.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { MollieService } from './mollie.service';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    forwardRef(() => OrdersModule), // Use forwardRef to avoid circular dependency
  ],
  controllers: [PaymentController],
  providers: [MollieService],
  exports: [MollieService],
})
export class PaymentModule {}