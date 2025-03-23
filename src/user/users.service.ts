import { BadRequestException, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { promises } from 'dns';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.userModel.findOne({ email: createUserDto.email });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      
      const user = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
        role: 'user',
      });
      
      return await user.save();
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Error creating user: ' + error.message);
    }
  }

  async requestSeller(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if(!user){
      throw new NotFoundException('user not found');
    }
  user.sellerRequest = 'pending';
  await user.save();
  return user;
  }

  // async approveseller(userId: string): Promise<User>{
  //   const user = await this.userModel.findById(userId);
  //   if(!user){
  //     throw new NotFoundException('user not found');
  //   }

  //   user.role = 'seller';
  //   user.sellerRequest = 'approved';
  //   await user.save();

  //   // await this.mailservice.sendSellerApprovedEmail(user.email, user,name);
  //   return user;
  // }

  async approveseller(userId: string): Promise<User>{
    const user = await this.userModel.findById(userId);
    if(!user){
      throw new NotFoundException('user not found');
    }
    user.role = 'seller';
    user.sellerRequest = 'approved'; 
    await user.save();
    return user;
  }

  async rejectseller(userId: string): Promise<User>{
    {
      const user =  await this.userModel.findById(userId);
      if(!user){
        throw new NotFoundException('user not found');
      }
      user.sellerRequest ='rejected';
      user.save();
      return user;
    }
  }
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    try {
      // Check if email is being updated and already exists
      if (updateUserDto.email) {
        const existingUser = await this.userModel.findOne({ 
          email: updateUserDto.email,
          _id: { $ne: id }
        });
        if (existingUser) {
          throw new ConflictException('Email already exists');
        }
      }

      // Hash password if it's being updated
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      const user = await this.userModel.findByIdAndUpdate(
        id,
        { $set: updateUserDto },
        { new: true, runValidators: true }
      ).exec();

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Error updating user: ' + error.message);
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: 'User deleted successfully' };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }
}