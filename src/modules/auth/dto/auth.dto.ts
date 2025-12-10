import {IsEmail, IsNotEmpty, IsOptional, IsString, MinLength} from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6, {message: 'Mật khẩu phải trên 6 ký tự'})
    password: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    avatar: string;
}

export class LoginDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;
}