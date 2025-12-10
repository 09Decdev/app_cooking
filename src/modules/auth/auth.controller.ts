import {Body, Controller, Post, UploadedFile, UseInterceptors} from '@nestjs/common';
import {AuthService} from './auth.service';
import {LoginDto, RegisterDto} from './dto/auth.dto';
import {FileInterceptor} from "@nestjs/platform-express";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post('register')
    @UseInterceptors(FileInterceptor('image'))
    register(
        @Body() dto: RegisterDto,
        @UploadedFile() file: Express.Multer.File) {

        return this.authService.register(dto,file);
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
}