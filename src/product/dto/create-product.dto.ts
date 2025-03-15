import { IsString, IsNumber, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number) // Transform string to number
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  quantity: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsNotEmpty()
  category: string;
}