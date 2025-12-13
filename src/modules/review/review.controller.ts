import {Body, Controller, Delete, Get, Param, Post, Put, UseGuards} from '@nestjs/common';
import {ReviewService} from './review.service';
import {AuthGuard} from '@nestjs/passport';
import {CreateCommentDto, CreateReviewDto, LikeRecipeDto} from './dto/create-review.dto';
import {UpdateReviewDto} from './dto/update-review.dto';
import {GetUser} from "../../common/get-user.decorator";
import {UpdateCommentDto} from "./dto/update-comment.dto";

@Controller('reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@GetUser('id') userId: string, @Body() dto: CreateReviewDto) {
        return this.reviewService.createReview(userId, dto);
    }

    @Get('recipe/:recipeId')
    findAllByRecipe(@Param('recipeId') recipeId: string) {
        return this.reviewService.findAllByRecipe(recipeId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    update(
        @Param('id') id: string,
        @GetUser('id') userId: string,
        @Body() dto: UpdateReviewDto,
    ) {
        return this.reviewService.update(id, userId, dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    remove(@Param('id') id: string, @GetUser('id') userId: string) {
        return this.reviewService.remove(id, userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('like')
    toggleLike(@GetUser('id') userId: string, @Body() dto: LikeRecipeDto) {
        return this.reviewService.toggleLike(userId, dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('comment')
    createComment(@GetUser('id') userId: string, @Body() dto: CreateCommentDto) {
        return this.reviewService.createComment(userId, dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('comment/:id')
    updateComment(@Param('id') id: string, @GetUser('id') userId: string, @Body() dto: UpdateCommentDto) {
        return this.reviewService.updateComment(id,userId, dto);
    }

    @Get('comments/:recipeId')
    getComments(@Param('recipeId') recipeId: string) {
        return this.reviewService.getComments(recipeId);
    }
}