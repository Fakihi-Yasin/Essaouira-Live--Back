import * as multer from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

// Create upload directory if it doesn't exist
const uploadDirectory = './uploads';
if (!existsSync(uploadDirectory)) {
  mkdirSync(uploadDirectory, { recursive: true });
}

// Configure storage
export const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

// Configure file filter
export const multerFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new BadRequestException('Invalid file type. Only JPEG, PNG, and JPG are allowed.'), false);
  }
};

// Multer config object
export const multerConfig = {
  storage: multerStorage,
  fileFilter: multerFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
};