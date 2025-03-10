import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as multer from 'multer';


import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  // Configure storage destination and file naming
  public multerOptions = {
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.join(process.cwd(), 'uploads');
        // Create directory if doesn't exist
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        // Create unique filename with original extension
        const filename = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, filename);
      },
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // Accept the file
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed.'), false);
      }
    },
  };

  // Get the URL for accessing the uploaded file
  getFileUrl(filename: string): string {
    if (!filename) return '';
    // This URL should match your static file serving path
    return `/uploads/${filename}`;
  }
  
  // Delete a file
  deleteFile(fileUrl: string): boolean {
    if (!fileUrl) return true;
    
    try {
      const filename = path.basename(fileUrl);
      const filePath = path.join(process.cwd(), 'uploads', filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
}