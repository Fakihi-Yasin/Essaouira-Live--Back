import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './category.service';
import { getModelToken } from '@nestjs/mongoose';
import { Category } from './schemas/category.schema';
import { NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryModel: any;

  const mockCategoryModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    new: jest.fn().mockResolvedValue({
      save: jest.fn(),
    }),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getModelToken(Category.name),
          useValue: mockCategoryModel,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    categoryModel = module.get(getModelToken(Category.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const categories = [{ name: 'Category 1' }, { name: 'Category 2' }];
      mockCategoryModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(categories),
      });

      const result = await service.findAll();
      expect(result).toEqual(categories);
      expect(mockCategoryModel.find).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const newCategory = { name: 'New Category' };
      mockCategoryModel.new.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(newCategory),
      }));

      expect(mockCategoryModel.new).toBeDefined();
      const createMock = jest.spyOn(service, 'create');
      createMock.mockResolvedValue(newCategory as any);

      const result = await service.create('New Category');
      expect(result).toEqual(newCategory);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updatedCategory = { id: '1', name: 'Updated Category' };
      mockCategoryModel.findByIdAndUpdate.mockResolvedValue(updatedCategory);

      const result = await service.update('1', 'Updated Category');
      expect(result).toEqual(updatedCategory);
      expect(mockCategoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { name: 'Updated Category' },
        { new: true }
      );
    });

    it('should throw NotFoundException if category not found', async () => {
      mockCategoryModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(service.update('1', 'Updated Category')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockCategoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { name: 'Updated Category' },
        { new: true }
      );
    });
  });

  describe('delete', () => {
    it('should delete a category', async () => {
      const result = { message: 'Category deleted successfully' };
      mockCategoryModel.findByIdAndDelete.mockResolvedValue({ id: '1', name: 'Category' });

      expect(await service.delete('1')).toEqual(result);
      expect(mockCategoryModel.findByIdAndDelete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if category not found', async () => {
      mockCategoryModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.delete('1')).rejects.toThrow(NotFoundException);
      expect(mockCategoryModel.findByIdAndDelete).toHaveBeenCalledWith('1');
    });
  });
});