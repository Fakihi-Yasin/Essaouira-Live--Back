import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

@Controller('users')
export class UsersController {
  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@Req() request) {
    return { message: 'User profile', user: request.user };
  }
}
