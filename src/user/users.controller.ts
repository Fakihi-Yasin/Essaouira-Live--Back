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
  HttpStatus,
  Patch,
  SetMetadata
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('/api/request-seller')
  async requestSeller(@Req() req) {
    const userId = req.user.userId;
    return this.userService.requestSeller(userId);
  }

  @Patch('/api/accept-seller/:id')
  async approveSeller(@Param('id') id: string) {
    return this.userService.approveseller(id);
  }

  @Patch('/api/reject-seller/:id')
  async rejectSeller(@Param('id') id: string) {
    return this.userService.rejectseller(id);
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  @Get('profile')
  getProfile(@Req() request) {
    return { message: 'User profile', user: request.user };
  }
}