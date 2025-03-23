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
  Patch
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
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

  @Post('/api/request-seller')
  @UseGuards(AuthGuard, RolesGuard)
  async requestseller(@Req() req){
    const userId = req.user.userId;
    return this.userService.requestSeller(userId)
  }
  @Patch('/api/accept-seller/:id')
  @UseGuards(AuthGuard)
  async approveseller(@Param('id') id: string){
    return  this.userService.approveseller(id)
  }
  @Patch('/api/reject-seller/:id')
  @UseGuards(AuthGuard)
  async rejectseller(@Param('id') id: string){
    return this.userService.rejectseller(id)
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