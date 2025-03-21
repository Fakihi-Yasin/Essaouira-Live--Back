import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './user/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './product/products.module';
import { ConfigModule , ConfigService  } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryModule } from './category/category.module';
import { PaymentModule }  from './payment/payment.module'
import { OrdersModule } from './orders/orders.module'

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/essaouira-live'),
    UsersModule,
    AuthModule,
    ProductsModule,
    CategoryModule,
    PaymentModule,
    OrdersModule

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
