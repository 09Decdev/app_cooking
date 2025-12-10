import {HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import * as Minio from 'minio';
import * as crypto from 'crypto';
import {FILE_VALIDATORS} from './file-upload.constant';
import sharp from "sharp";

@Injectable()
export class MinioService {
    private minioClient: Minio.Client;
    private bucketName = 'cooking-app';
    private readonly logger = new Logger(MinioService.name);

    constructor(private readonly configService: ConfigService) {
        this.minioClient = new Minio.Client({
            endPoint: 'localhost',
            port: 9000,
            useSSL: false,
            accessKey: 'minioadmin',
            secretKey: 'minioadmin123',
        });
    }

    public get client(): Minio.Client {
        return this.minioClient;
    }

    private async ensureBucket(bucket: string) {
        try {
            const exists = await this.minioClient.bucketExists(bucket);
            if (!exists) {
                await this.minioClient.makeBucket(bucket);
                this.logger.log(`[MinIO] Bucket "${bucket}" created successfully.`);
            }
        } catch (err) {
            this.logger.error(`Error ensuring bucket ${bucket}: ${err.message}`);
            throw new HttpException('Lỗi kết nối MinIO', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<{ fileName: string; url: string }> {
        await this.validateFile(file);

        const timestamp = Date.now();
        const random = crypto.randomBytes(4).toString('hex');
        const extension = file.originalname.split('.').pop();
        const fileName = `${timestamp}-${random}.${extension}`;

        const metaData = {
            'Content-Type': file.mimetype,
        };
        try {
            await this.ensureBucket(this.bucketName);

            await this.minioClient.putObject(
                this.bucketName,
                fileName,
                file.buffer,
                file.size,
                metaData,
            );

            const url = await this.getPresignedUrl(fileName);

            return {
                fileName: fileName,
                url: url,
            };
        } catch (error) {
            this.logger.error(error);
            throw new HttpException('Lỗi upload file', HttpStatus.BAD_REQUEST);
        }
    }

    async getPresignedUrl(key: string, expiry: number = 604800): Promise<string> {
        try {
            const bucket = this.bucketName;
            return await this.minioClient.presignedGetObject(bucket, key, expiry);
        } catch (err) {
            throw new HttpException('Cannot generate secure link', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteFile(fileName: string) {
        try {
            const objectName = fileName.split('/').pop();

            if (objectName != null) {
                await this.minioClient.removeObject(this.bucketName, objectName);
            }
            this.logger.log(`[MinIO] Deleted file: ${objectName}`);
        } catch (error) {
            this.logger.error(`Lỗi khi xóa file ${fileName}: ${error.message}`);
        }
    }

    public async validateFile(file: Express.Multer.File) {
        if (!FILE_VALIDATORS) return;

        const validator = FILE_VALIDATORS.find((rule) => rule.mimes.includes(file.mimetype));
        if (!validator) {
            throw new HttpException(`File type ${file.mimetype} is not supported`, HttpStatus.BAD_REQUEST);
        }

        const configKey = `UPLOAD_${validator.type}_MAX_SIZE`;
        const maxFileSize = this.configService.get<number>(
            configKey,
            5 * 1024 * 1024,
        );

        if (file.size > maxFileSize) {
            const sizeMB = Math.round(maxFileSize / 1024 / 1024);
            throw new HttpException(
                `File ${validator.type} quá lớn (Max: ${sizeMB}MB)`,
                HttpStatus.BAD_REQUEST,
            );
        }

        if (validator.type === 'IMAGE') {
            await this.validateImageResolution(file);
        }
    }

    private async validateImageResolution(file: Express.Multer.File) {
        const maxWidth = this.configService.get<number>('UPLOAD_IMAGE_MAX_WIDTH', 0);
        const maxHeight = this.configService.get<number>('UPLOAD_IMAGE_MAX_HEIGHT', 0);

        if (!maxWidth && !maxHeight) return;

        try {
            const metadata = await sharp(file.buffer, {failOnError: false}).metadata();
            if (
                (maxWidth && (metadata.width || 0) > maxWidth) ||
                (maxHeight && (metadata.height || 0) > maxHeight)
            ) {
                throw new Error(`Kích thước ảnh vượt quá giới hạn ${maxWidth}x${maxHeight}`);
            }
        } catch (e) {
            if (e instanceof Error && e.message.includes('vượt quá'))
                throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
        }
    }
}