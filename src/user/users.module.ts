// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// import { User, UserSchema } from '../schemas/user.schema';
// import { UserService } from './users.service';
// import { UserController } from './users.controller';

// @Module({
//   imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
//   controllers: [UserController],
//   providers: [UserService],
//   exports: [UserService],
// })
// export class UsersModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { UserService } from './users.service';
import { UserController } from './users.controller';


@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService,], 

})
export class UsersModule {}