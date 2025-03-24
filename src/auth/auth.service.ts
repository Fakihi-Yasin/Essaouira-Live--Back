// src/auth/auth.service.ts
import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserDocument } from '../user/schema/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';
import { UserService } from '../user/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, lastname, email, password } = registerDto;
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({ name, lastname, email, password: hashedPassword });
    await user.save();
    return { message: 'User registered successfully' };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { userId: user._id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),
      role: user.role,
      status: user.status,
    };
  }
  
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = this.jwtService.sign(
      { email },
      { secret: process.env.JWT_SECRET, expiresIn: '1h' },
    );
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    await this.emailService.sendPasswordResetEmail(email, resetToken);

    return { message: 'Password reset email sent' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    let decoded;
    try {
      decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset token');
    }
  
    const user = await this.userModel.findOne({ resetPasswordToken: token });
    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Token expired or invalid');
    }
  
    if (!newPassword) {
      throw new BadRequestException('New password is required');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    return { message: 'Password successfully reset' };
  }
}