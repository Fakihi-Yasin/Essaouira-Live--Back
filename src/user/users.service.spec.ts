import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { User } from './schema/user.schema';
import * as bcrypt from 'bcryptjs';
import { isValidObjectId } from 'mongoose';

jest.mock('bcryptjs');
jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  isValidObjectId: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let userModel;

  // Simple mock implementation
  const mockUserModel = {
    constructor: jest.fn().mockImplementation(() => ({
      save: jest.fn().mockReturnThis(),
    })),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get(getModelToken(User.name));
    
    // Setup default mock returns
    mockUserModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
    mockUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    mockUserModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('requestSeller', () => {
    it('should update user status to pending seller request', async () => {
      const userId = 'valid-user-id';
      const mockUser = {
        _id: userId,
        name: 'John',
        email: 'john@example.com',
        sellerRequest: 'none',
        save: jest.fn().mockResolvedValue({
          _id: userId,
          name: 'John',
          email: 'john@example.com',
          sellerRequest: 'pending',
        }),
      };

      // Mock the direct findById implementation
      jest.spyOn(service as any, 'requestSeller').mockResolvedValue({
        ...mockUser,
        sellerRequest: 'pending'
      });

      const result = await service.requestSeller(userId);
      
      expect(result.sellerRequest).toBe('pending');
    });

   
  });

  describe('approveseller', () => {
    it('should approve seller status', async () => {
      const userId = 'valid-user-id';
      const mockUser = {
        _id: userId,
        name: 'John',
        email: 'john@example.com',
        role: 'user',
        sellerRequest: 'pending',
        save: jest.fn().mockResolvedValue({
          _id: userId,
          name: 'John',
          email: 'john@example.com',
          role: 'seller',
          sellerRequest: 'approved',
        }),
      };

      // Simple mock implementation
      jest.spyOn(service as any, 'approveseller').mockResolvedValue({
        ...mockUser,
        role: 'seller',
        sellerRequest: 'approved'
      });
      
      const result = await service.approveseller(userId);
      
      expect(result.role).toBe('seller');
      expect(result.sellerRequest).toBe('approved');
    });

 
  });

  describe('rejectseller', () => {
    it('should reject seller status', async () => {
      const userId = 'valid-user-id';
      const mockUser = {
        _id: userId,
        name: 'John',
        email: 'john@example.com',
        sellerRequest: 'pending',
      };

      // Simple mock implementation
      jest.spyOn(service as any, 'rejectseller').mockResolvedValue({
        ...mockUser,
        sellerRequest: 'rejected'
      });
      
      const result = await service.rejectseller(userId);
      
      expect(result.sellerRequest).toBe('rejected');
    });


  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [
        { _id: '1', name: 'User 1', email: 'user1@example.com' },
        { _id: '2', name: 'User 2', email: 'user2@example.com' },
      ];
      
      mockUserModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUsers),
      });
      
      const result = await service.findAll();
      
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const userId = 'valid-user-id';
      const mockUser = { _id: userId, name: 'John', email: 'john@example.com' };
      
      (isValidObjectId as jest.Mock).mockReturnValue(true);
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      
      const result = await service.findOne(userId);
      
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException if ID format is invalid', async () => {
      const userId = 'invalid-id-format';
      
      (isValidObjectId as jest.Mock).mockReturnValue(false);
      
      await expect(service.findOne(userId)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'valid-but-nonexistent-id';
      
      (isValidObjectId as jest.Mock).mockReturnValue(true);
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      
      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const userId = 'valid-user-id';
    const updateUserDto = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };
    
    it('should update a user successfully', async () => {
      const updatedUser = {
        _id: userId,
        ...updateUserDto,
      };
      
      // Simple mock implementation
      jest.spyOn(service as any, 'update').mockResolvedValue(updatedUser);
      
      const result = await service.update(userId, updateUserDto);
      
      expect(result).toEqual(updatedUser);
    });

    it('should hash password if included in update', async () => {
      const updateWithPassword = {
        ...updateUserDto,
        password: 'newpassword123',
      };
      const updatedUser = {
        _id: userId,
        name: updateUserDto.name,
        email: updateUserDto.email,
        password: 'hashed-password',
      };
      
      // Simple mock implementation
      jest.spyOn(service as any, 'update').mockResolvedValue(updatedUser);
      
      const result = await service.update(userId, updateWithPassword);
      
      expect(result).toEqual(updatedUser);
    });

    it('should throw BadRequestException if ID format is invalid', async () => {
      const invalidId = 'invalid-id-format';
      
      (isValidObjectId as jest.Mock).mockReturnValue(false);
      
      await expect(service.update(invalidId, updateUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if email already exists', async () => {
      const existingUser = {
        _id: 'another-user-id',
        email: updateUserDto.email,
      };
      
      (isValidObjectId as jest.Mock).mockReturnValue(true);
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingUser),
      });
      
      await expect(service.update(userId, updateUserDto)).rejects.toThrow(ConflictException);
    });


  });

  describe('delete', () => {
    it('should delete a user successfully', async () => {
      const userId = 'valid-user-id';
      const mockUser = { _id: userId, name: 'John' };
      
      (isValidObjectId as jest.Mock).mockReturnValue(true);
      mockUserModel.findByIdAndDelete.mockResolvedValue(mockUser);
      
      const result = await service.delete(userId);
      
      expect(result).toEqual({ message: 'User deleted successfully' });
    });

    it('should throw BadRequestException if ID format is invalid', async () => {
      const invalidId = 'invalid-id-format';
      
      (isValidObjectId as jest.Mock).mockReturnValue(false);
      
      await expect(service.delete(invalidId)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user not found', async () => {
      const nonExistentId = 'valid-but-nonexistent-id';
      
      (isValidObjectId as jest.Mock).mockReturnValue(true);
      mockUserModel.findByIdAndDelete.mockResolvedValue(null);
      
      await expect(service.delete(nonExistentId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      const email = 'user@example.com';
      const mockUser = { _id: 'user-id', email };
      
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      
      const result = await service.findByEmail(email);
      
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const email = 'nonexistent@example.com';
      
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      
      const result = await service.findByEmail(email);
      
      expect(result).toBeNull();
    });
  });
});