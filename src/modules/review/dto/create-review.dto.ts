import {IsInt, IsNotEmpty, IsString, IsUUID, Max, Min} from 'class-validator';

export class CreateCommentDto {
    @IsUUID()
    @IsNotEmpty()
    recipeId: string;

    @IsString()
    @IsNotEmpty()
    content: string;
}

export class LikeRecipeDto {
    @IsUUID()
    @IsNotEmpty()
    recipeId: string;
}

export class CreateReviewDto {
    @IsUUID()
    @IsNotEmpty()
    recipeId: string;

    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @IsString()
    @IsNotEmpty()
    content: string;
}