import {Type} from 'class-transformer';
import {IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested} from 'class-validator';

export class RecipeIngredientDto {
    @IsString()
    @IsNotEmpty()
    ingredientId: string;

    @IsString()
    @IsNotEmpty()
    amount: string;
}

export class RecipeStepDto {
    @IsNumber()
    order: number;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsOptional()
    image?: string;
}

// 3. DTO Chính
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
    cookTime: number; // Phút

    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => RecipeIngredientDto)
    ingredients: RecipeIngredientDto[];

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => RecipeStepDto)
    steps: RecipeStepDto[];
}