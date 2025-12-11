import {IsNotEmpty, IsString} from "class-validator";

export class CreateRecipeIngredientDto {

    @IsNotEmpty()
    @IsString()
    recipeId: string;

    @IsNotEmpty()
    @IsString()
    ingredientId: string

    @IsString()
    @IsNotEmpty()
    amount: string;
}