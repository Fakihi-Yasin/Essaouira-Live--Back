import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { Product, ProductDocument } from './schema/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {}

  async create(createProductDto: CreateProductDto, userId: string): Promise<Product> {
    const product = new this.productModel({...createProductDto,userId});
    return product.save();
  }
  async findAllPublic(){
    return this.productModel.find({display: true}).exec();
  } 
 
  async findAll(userId: string): Promise<Product[]> {
    return this.productModel.find({userId}).exec();
  }

  async findOne(id: string): Promise<Product> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid product ID format');
    }

    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }
  async findByCategory(categoryId: string) {
    this.logger.log(`Service: Finding products by category ${categoryId}`);
    
    // Try querying with the string directly since that's how it's stored
    return this.productModel.find({ category: categoryId })
      .populate('category')
      .exec();
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid product ID format');
    }

    const product = await this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true }).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async delete(id: string): Promise<{ message: string }> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid product ID format');
    }

    const product = await this.productModel.findByIdAndDelete(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return { message: 'Product deleted successfully' };
  }
} 