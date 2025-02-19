import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  UseGuards, 
  Req, 
  Body, 
  Param,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@Req() request) {
    return { message: 'User profile', user: request.user };
  }
}