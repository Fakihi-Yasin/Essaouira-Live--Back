import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode, HttpStatus, Req, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { request } from 'http';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // @Get('admin')
  // @SetMetadata('roles', ['admin']) 
  // async adminOnlyRoute() {
  //   return { message: 'This route is only accessible by admin' };
  // }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  // @SetMetadata('roles', ['seller', 'admin'])

    async create(@Body() createProductDto: CreateProductDto, @Req() request: any) {
    const userId = request.user.userId;
    return this.productsService.create(createProductDto, userId);
  }

  @Get('all')
  async findAllPublic() {
    return this.productsService.findAllPublic();
  }

  @Get('my-products')
  @UseGuards(AuthGuard, RolesGuard)
  async findAll(@Req() request: any) {
    const userId = request.user.userId;
    return this.productsService.findAll(userId);
  }



  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
} 