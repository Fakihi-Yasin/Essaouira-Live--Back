import { IsOptional, IsNumber, IsString } from 'class-validator';

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
  imageUrl?: string;

} 