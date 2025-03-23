import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { User } from '../user/schema/user.schema';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let userModel: any;
  let jwtService: JwtService;

  // Create a mock for the user document to be returned by the save method
  const mockUserDocument = {
    save: jest.fn().mockResolvedValue(undefined),
  };

  // Fix the mock model implementation
  const mockUserModel = {
    findOne: jest.fn(),
    // Correctly mock the constructor function behavior
    constructor: jest.fn().mockImplementation((dto) => ({
      ...dto,
      ...mockUserDocument,
    })),
  };
  // Add a constructor function that will be called by 'new'
  mockUserModel.constructor.prototype.save = jest.fn().mockResolvedValue(undefined);

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('test-token'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          // Use a factory function that returns both a function (for 'new') and methods
          useValue: function MockUserModel(dto) {
            this.data = dto;
            this.save = jest.fn().mockResolvedValue(undefined);
            
            return this;
          },
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
    
    // Add the findOne method to the model
    userModel.findOne = jest.fn();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      name: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should register a new user successfully', async () => {
      userModel.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      
      const result = await service.register(registerDto);
      
      expect(userModel.findOne).toHaveBeenCalledWith({ email: registerDto.email });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(result).toEqual({ message: 'User registered successfully' });
    });

    it('should throw ConflictException if email already exists', async () => {
      userModel.findOne.mockResolvedValue({ email: registerDto.email });
      
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(userModel.findOne).toHaveBeenCalledWith({ email: registerDto.email });
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should return access token and role when credentials are valid', async () => {
      const user = {
        _id: 'user-id',
        email: loginDto.email,
        password: 'hashed-password',
        role: 'user',
      };
      
      userModel.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      
      const result = await service.login(loginDto);
      
      expect(userModel.findOne).toHaveBeenCalledWith({ email: loginDto.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: user._id,
        email: user.email,
      });
      expect(result).toEqual({
        access_token: 'test-token',
        role: user.role,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userModel.findOne.mockResolvedValue(null);
      
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(userModel.findOne).toHaveBeenCalledWith({ email: loginDto.email });
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const user = {
        email: loginDto.email,
        password: 'hashed-password',
      };
      
      userModel.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(userModel.findOne).toHaveBeenCalledWith({ email: loginDto.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
    });
  });
});