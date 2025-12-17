import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {CreateIngredientDto} from './dto/create-ingredient.dto';
import {PrismaService} from "../../prisma.service";
import {UpdateIngredientDto} from "./dto/update-ingredient.dto";

@Injectable()
export class IngredientService {
    constructor(private prisma: PrismaService) {
    }


    create(dto: CreateIngredientDto) {
        return this.prisma.ingredient.create({
            data: {
                name: dto.name,
            },
        });
    }

    findAll() {
        return this.prisma.ingredient.findMany();
    }

    async findOne(id: string) {
        const ingredient = await this.prisma.ingredient.findUnique({
            where: {id},
            include:{
                recipes:true,
                products:true,
            }
        });

        if (!ingredient) {
            throw new NotFoundException(`Ingredient with id ${id} not found`);
        }

        return ingredient;
    }

    async update( id: string, dto: UpdateIngredientDto) {
        await this.findOne(id);

        return this.prisma.ingredient.update({
            where: {id},
            data: {
                name: dto.name?.trim(),
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        return this.prisma.ingredient.delete({
            where: {id},
        });
    }

    async search(keyword: string) {
        if (!keyword?.trim()) {
            throw new BadRequestException('Search keyword is required');
        }

        return this.prisma.ingredient.findMany({
            where: {
                name: {
                    contains: keyword,
                    mode: 'insensitive',
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
    }
}