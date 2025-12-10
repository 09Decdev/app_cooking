import {IsNotEmpty, IsNumber, IsOptional, IsString} from 'class-validator';
import {Type} from 'class-transformer';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty()
    manufacturer: string;

    @IsString()
    @IsOptional()
    image?: string;

    @IsString()
    @IsOptional()
    ingredientId?: string;
}