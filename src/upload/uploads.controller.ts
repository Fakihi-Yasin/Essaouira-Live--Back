import { Controller, Post, UseInterceptors, UploadedFile, HttpStatus, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Controller('upload')
export class UploadsController {
  constructor() {
    // Create uploads directory if it doesn't exist
    const uploadPath = join(process.cwd(), 'uploads');
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({  
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file, @Req() req) {
    console.log('File uploaded:', file.path);
    const filename = file.filename;
    
    return {
      statusCode: HttpStatus.CREATED,
      filename: filename,
      path: `uploads/${filename}`, // This is what should be saved in the product
      url: `http://localhost:3000/uploads/${filename}` // Full URL for direct use
    };
  }  
}