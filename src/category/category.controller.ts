import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CategoriesService } from '../category/category.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getCategories() {
    return await this.categoriesService.findAll();
  }
x
  @Post()
  async createCategory(@Body('name') name: string) {
    return await this.categoriesService.create(name);
  }

  @Put(':id')
  async updateCategory(@Param('id') id: string, @Body('name') name: string) {
    return await this.categoriesService.update(id, name);
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    return await this.categoriesService.delete(id);
  }
}
