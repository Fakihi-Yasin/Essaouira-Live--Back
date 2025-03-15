import { IsOptional, IsNumber, IsString, IsBoolean } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number' })
  price?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Quantity must be a number' })
  quantity?: number;

  @IsOptional()
  @IsString()
  category?: string;


  @IsOptional()
  @IsString()
  imageUrl?: string;
} 