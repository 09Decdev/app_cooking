import {Body, Controller, Delete, Get, Param, Put, UploadedFile, UseGuards, UseInterceptors} from '@nestjs/common';
import {GetUser} from 'src/common/get-user.decorator';
import {UserService} from "./user.service";
import {UpdateUserDto} from "./dto/update-user.dto";
import {AuthGuard} from "@nestjs/passport";
import {FileInterceptor} from "@nestjs/platform-express";

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {

    constructor(private readonly userService: UserService) {
    }

    @Put('update')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('file'))
    updateMe(
        @GetUser('id') userId: string,
        @Body() dto: UpdateUserDto,
        @UploadedFile() file?: Express.Multer.File
    ) {
        return this.userService.update(userId, dto, file);
    }

    @Get()
    findAll() {
        return this.userService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.userService.findOne(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.userService.remove(id);
    }
}