import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with registerDto', async () => {
      const registerDto: RegisterDto = {
        name: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      
      mockAuthService.register.mockResolvedValue({ message: 'User registered successfully' });
      
      const result = await controller.register(registerDto);
      
      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({ message: 'User registered successfully' });
    });
  });

  describe('login', () => {
    it('should call authService.login with loginDto', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'password123',
      };
      
      mockAuthService.login.mockResolvedValue({ 
        access_token: 'jwt-token',
        role: 'user'
      });
      
      const result = await controller.login(loginDto);
      
      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual({ 
        access_token: 'jwt-token',
        role: 'user'
      });
    });
  });

  describe('getProfile', () => {
    it('should return user from request', () => {
      const req = {
        user: { userId: '123', email: 'john@example.com' }
      };
      
      const result = controller.getProfile(req);
      
      expect(result).toEqual(req.user);
    });
  });
});