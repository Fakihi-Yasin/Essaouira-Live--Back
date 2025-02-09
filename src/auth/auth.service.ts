import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../shemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  // **Register User**
  async register(registerDto: RegisterDto) {
    const { name,lastname, email, password } = registerDto;

    // Check if email already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({ name,lastname, email, password: hashedPassword });
    await user.save();

    return { message: 'User registered successfully' };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Check if user exists
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT Token
    const payload = { userId: user._id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
  
}
