import { 
  Controller, Get, Post, Put, Delete, Body, Param, 
  UseGuards, HttpCode, HttpStatus, Req, 
  UseInterceptors, UploadedFile, Res,
  Logger
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { multerConfig } from '../config/multer.config';
import { join } from 'path';
import { of } from 'rxjs';

@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async create(
    @Body() createProductDto: CreateProductDto, 
    @Req() request: any,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const userId = request.user.userId;
    
    // The DTO will now handle the type conversion
    this.logger.log(`Creating product with data: ${JSON.stringify(createProductDto)}`);
    this.logger.log(`File received: ${file ? 'Yes' : 'No'}`);
    
    if (file) {
      this.logger.log(`File details: ${JSON.stringify({
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size
      })}`);
      createProductDto.imageUrl = file.path.replace(/\\/g, '/');
    }
    
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

  // Serve product images
  @Get('image/:imageName')
  getProductImage(@Param('imageName') imageName: string, @Res() res) {
    return of(res.sendFile(join(process.cwd(), 'uploads', imageName)));
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async update(
    @Param('id') id: string, 
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    // If a file was uploaded, add the file path to the DTO
    if (file) {
      updateProductDto.imageUrl = file.path.replace(/\\/g, '/');
    }
    
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}