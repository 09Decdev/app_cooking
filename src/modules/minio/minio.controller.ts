import {Controller, Get, Injectable, Query} from "@nestjs/common";
import {MinioService} from "./minio.service";

@Controller("files")
export class MinioController{
constructor(private readonly minioService: MinioService) {
}

    @Get('presignedUrl')
    async checkFile(@Query('fileName') fileName: string) {
        return await this.minioService.getPresignedUrl(fileName);
    }
}