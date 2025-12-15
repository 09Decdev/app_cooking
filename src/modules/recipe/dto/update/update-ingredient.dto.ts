import {PartialType} from "@nestjs/mapped-types";
import {CreateRecipeIngredientDto} from "../creat/create-ingredient.dto";

export class UpdateRecipeIngredientDto extends PartialType(CreateRecipeIngredientDto) {

}