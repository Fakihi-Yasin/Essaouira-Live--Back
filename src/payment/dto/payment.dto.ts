// src/payment/dto/payment.dto.ts
import { IsNumber, IsString, IsArray, IsOptional, IsObject } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePaymentDto {
    @IsNumber()
    amount: number;
  
    @IsString()
    description: string;
  
    @IsString()
    redirectUrl: string;
  
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.toString() || 'guest-user')
    userId?: string;
  
    @IsOptional()
    @IsArray()
    items?: any[]; 
  
    @IsOptional()
    @IsObject()
    customerDetails?: Record<string, any>;
  }