import {ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from "../../prisma.service";
import {CreateCommentDto, CreateReviewDto, LikeRecipeDto} from "./dto/create-review.dto";
import {UpdateReviewDto} from "./dto/update-review.dto";
import {UpdateCommentDto} from "./dto/update-comment.dto";

@Injectable()
export class ReviewService {
    constructor(private readonly prismaService: PrismaService) {
    }

    async createReview(userId: string, dto: CreateReviewDto) {
        const recipe = await this.prismaService.recipe.findUnique({
            where: {id: dto.recipeId},
        });
        if (!recipe) {
            throw new NotFoundException("No recipe found");
        }
        return this.prismaService.review.create({
            data: {
                userId,
                recipeId: dto.recipeId,
                rating: dto.rating,
                content: dto.content,
            },
            include: {
                user: {select: {id: true, name: true, avatar: true}},
            },
        });

    }

    async findAllByRecipe(recipeId: string) {
        return this.prismaService.review.findMany({
            where: {recipeId},
            orderBy: {createdAt: 'desc'}, // Mới nhất lên đầu
            include: {
                user: {select: {id: true, name: true, avatar: true}},
            },
        });
    }

    async update(id: string, userId: string, dto: UpdateReviewDto) {
        const review = await this.prismaService.review.findUnique({where: {id}});

        if (!review) throw new NotFoundException('Đánh giá không tồn tại');
        if (review.userId !== userId) throw new ForbiddenException('Bạn không có quyền sửa đánh giá này');

        return this.prismaService.review.update({
            where: {id},
            data: {
                rating: dto.rating,
                content: dto.content,
            },
            include: {
                user: {select: {id: true, name: true, avatar: true}},
            },
        });
    }

    async remove(id: string, userId: string) {
        const review = await this.prismaService.review.findUnique({where: {id}});

        if (!review) throw new NotFoundException('Đánh giá không tồn tại');
        if (review.userId !== userId) throw new ForbiddenException('Bạn không có quyền xóa đánh giá này');

        return this.prismaService.review.delete({where: {id}});
    }

    async toggleLike(userId: string, dto: LikeRecipeDto) {
        const recipe = await this.prismaService.recipe.findUnique({
            where: {
                id: dto.recipeId
            }
        })
        if (!recipe) {
            throw new NotFoundException("recipe not found");
        }

        const likeRecipe = await this.prismaService.like.findUnique({
            where: {
                userId_recipeId: {
                    userId: userId,
                    recipeId: dto.recipeId,
                },
            }
        });

        if (likeRecipe) {
            await this.prismaService.like.delete(
                {
                    where: {
                        userId_recipeId: {userId, recipeId: dto.recipeId},
                    }
                }
            )
            return {message: 'UnLike', isLiked: false};
        } else {
            await this.prismaService.like.create({
                data: {
                    userId,
                    recipeId: dto.recipeId,
                },
            });
            return {message: 'Liked', isLiked: true};
        }

    }

    async createComment(userId: string, dto: CreateCommentDto) {
        const recipe = await this.prismaService.recipe.findUnique({where: {id: dto.recipeId}});
        if (!recipe) throw new NotFoundException('Món ăn không tồn tại');

        return this.prismaService.comment.create({
            data: {
                content: dto.content,
                userId: userId,
                recipeId: dto.recipeId,
            },
            include: {
                user: {select: {id: true, name: true, avatar: true}}
            }
        });
    }

    async updateComment(id: string, userId: string, dto: UpdateCommentDto) {
        const comment = await this.prismaService.comment.findUnique({where: {id: id}});
        if (!comment) {
            throw new NotFoundException("Comment not found");
        }
        if (comment.userId != userId) {
            throw new ForbiddenException("You not permission")
        }
        const  updateComment=await this.prismaService.comment.update({
            where: {
                id: id,
            },
            data: {
                content: dto.content
            }
        })
        return {message: 'Comment updated', data: updateComment};
    }

    async getComments(recipeId: string) {
        return this.prismaService.comment.findMany({
            where: {recipeId},
            orderBy: {createdAt: 'desc'},
            include: {
                user: {
                    select: {id: true, name: true, avatar: true},
                },
            },
        });
    }
}
