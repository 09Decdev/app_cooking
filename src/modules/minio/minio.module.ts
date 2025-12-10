import {Module} from '@nestjs/common';
import {MinioService} from './minio.service';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {MinioController} from "./minio.controller";

@Module({
    imports: [],
    controllers: [MinioController],
    providers: [MinioService, ConfigService],
    exports: [MinioService],
})
export class MinioModule {
}
