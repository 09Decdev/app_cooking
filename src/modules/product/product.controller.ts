import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    Post,
    Put, Query,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {ProductService} from './product.service';
import {CreateProductDto} from './dto/create-product.dto';
import {UpdateProductDto} from './dto/update-product.dto';
import {AuthGuard} from '@nestjs/passport';
import {GetUser} from "../../common/get-user.decorator";

@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) {
    }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('file'))
    create(
        @Body() dto: CreateProductDto,
        @GetUser('id') userId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.productService.create(dto, userId, file);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('file'))
    update(
        @Param('id') id: string,
        @Body() dto: UpdateProductDto,
        @GetUser('id') userId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.productService.update(id, dto, userId, file);
    }
    @Get('search')
    async search(@Query('q') keyword: string) {
        return this.productService.search(keyword);
    }

    @Get()
    findAll() {
        return this.productService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productService.findOne(id);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    async remove(@Param('id') id: string, @GetUser('id') userId: string,) {
        await this.productService.remove(id, userId);
        return {
            status: HttpStatus.OK,
            body: "delete successfully."
        };
    }

}