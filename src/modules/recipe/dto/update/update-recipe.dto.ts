import { PartialType } from '@nestjs/mapped-types';
import { CreateRecipeDto } from '../creat/create-recipe.dto';

export class UpdateRecipeDto extends PartialType(CreateRecipeDto) {}
