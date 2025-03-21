import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<Category>) {}

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async create(name: string): Promise<Category> {
    const newCategory = new this.categoryModel({ name });
    return newCategory.save();
  }

  async update(id: string, name: string): Promise<Category> {
    const updatedCategory = await this.categoryModel.findByIdAndUpdate(id, { name }, { new: true });
    if (!updatedCategory) throw new NotFoundException('Category not found');
    return updatedCategory;
  }

  async delete(id: string): Promise<{ message: string }> {
    const result = await this.categoryModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Category not found');
    return { message: 'Category deleted successfully' };
  }
}
