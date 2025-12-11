import {IsNotEmpty, IsNumber, IsOptional, IsString} from 'class-validator';

export class CreateRecipeDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    image?: string;

    @IsNumber()
    cookTime: number;

    @IsString()
    @IsNotEmpty()
    categoryId: string;

}