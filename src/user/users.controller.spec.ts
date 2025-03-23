import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    create: jest.fn(),
    requestSeller: jest.fn(),
    approveseller: jest.fn(),
    rejectseller: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockJwtService = {
    verify: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should call userService.create with createUserDto', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      
      const expectedUser = {
        _id: 'user-id',
        ...createUserDto,
        password: 'hashed-password',
        role: 'user',
      };
      
      mockUserService.create.mockResolvedValue(expectedUser);
      
      const result = await controller.createUser(createUserDto);
      
      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('requestSeller', () => {
    it('should call userService.requestSeller with userId from request', async () => {
      const req = {
        user: { userId: 'user-id' }
      };
      
      const expectedResult = {
        _id: 'user-id',
        name: 'John',
        email: 'john@example.com',
        sellerRequest: 'pending',
      };
      
      mockUserService.requestSeller.mockResolvedValue(expectedResult);
      
      const result = await controller.requestSeller(req);
      
      expect(service.requestSeller).toHaveBeenCalledWith(req.user.userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('approveSeller', () => {
    it('should call userService.approveseller with userId', async () => {
      const userId = 'user-id';
      
      const expectedResult = {
        _id: userId,
        name: 'John',
        email: 'john@example.com',
        role: 'seller',
        sellerRequest: 'approved',
      };
      
      mockUserService.approveseller.mockResolvedValue(expectedResult);
      
      const result = await controller.approveSeller(userId);
      
      expect(service.approveseller).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('rejectSeller', () => {
    it('should call userService.rejectseller with userId', async () => {
      const userId = 'user-id';
      
      const expectedResult = {
        _id: userId,
        name: 'John',
        email: 'john@example.com',
        sellerRequest: 'rejected',
      };
      
      mockUserService.rejectseller.mockResolvedValue(expectedResult);
      
      const result = await controller.rejectSeller(userId);
      
      expect(service.rejectseller).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedUsers = [
        { _id: '1', name: 'User 1', email: 'user1@example.com' },
        { _id: '2', name: 'User 2', email: 'user2@example.com' },
      ];
      
      mockUserService.findAll.mockResolvedValue(expectedUsers);
      
      const result = await controller.findAll();
      
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const userId = 'user-id';
      const expectedUser = { _id: userId, name: 'John', email: 'john@example.com' };
      
      mockUserService.findOne.mockResolvedValue(expectedUser);
      
      const result = await controller.findOne(userId);
      
      expect(service.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('updateUser', () => {
    it('should update and return a user', async () => {
      const userId = 'user-id';
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };
      
      const expectedUser = {
        _id: userId,
        name: 'Updated Name',
        email: 'john@example.com',
      };
      
      mockUserService.update.mockResolvedValue(expectedUser);
      
      const result = await controller.updateUser(userId, updateUserDto);
      
      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and return success message', async () => {
      const userId = 'user-id';
      const expectedResult = { message: 'User deleted successfully' };
      
      mockUserService.delete.mockResolvedValue(expectedResult);
      
      const result = await controller.deleteUser(userId);
      
      expect(service.delete).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getProfile', () => {
    it('should return user profile from request', () => {
      const req = {
        user: {
          userId: 'user-id',
          email: 'john@example.com',
        }
      };
      
      const result = controller.getProfile(req);
      
      expect(result).toEqual({
        message: 'User profile',
        user: req.user,
      });
    });
  });
});