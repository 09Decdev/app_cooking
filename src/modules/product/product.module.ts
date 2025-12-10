import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import {MinioService} from "../minio/minio.service";
import {PrismaService} from "../../prisma.service";

@Module({
  controllers: [ProductController],
  providers: [ProductService,MinioService,PrismaService],
})
export class ProductModule {}
