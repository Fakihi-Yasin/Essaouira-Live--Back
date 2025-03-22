import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './category.controller';
import { CategoriesService } from './category.service';
import { getModelToken } from '@nestjs/mongoose';
import { Category } from './schemas/category.schema';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategoryModel = {
    find: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    new: jest.fn().mockResolvedValue({
      save: jest.fn(),
    }),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const mockCategoriesService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCategories', () => {
    it('should return an array of categories', async () => {
      const result = [{ name: 'Category 1' }, { name: 'Category 2' }];
      jest.spyOn(service, 'findAll').mockResolvedValue(result as any);

      expect(await controller.getCategories()).toBe(result);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const newCategory = { name: 'New Category' };
      jest.spyOn(service, 'create').mockResolvedValue(newCategory as any);

      expect(await controller.createCategory('New Category')).toBe(newCategory);
      expect(service.create).toHaveBeenCalledWith('New Category');
    });
  });

  describe('updateCategory', () => {
    it('should update a category', async () => {
      const updatedCategory = { id: '1', name: 'Updated Category' };
      jest.spyOn(service, 'update').mockResolvedValue(updatedCategory as any);

      expect(await controller.updateCategory('1', 'Updated Category')).toBe(updatedCategory);
      expect(service.update).toHaveBeenCalledWith('1', 'Updated Category');
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      const result = { message: 'Category deleted successfully' };
      jest.spyOn(service, 'delete').mockResolvedValue(result);

      expect(await controller.deleteCategory('1')).toBe(result);
      expect(service.delete).toHaveBeenCalledWith('1');
    });
  });
});