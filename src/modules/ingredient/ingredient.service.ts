import { Injectable } from '@nestjs/common';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import {PrismaService} from "../../prisma.service";

@Injectable()
export class IngredientService {
    constructor(private prisma: PrismaService) {}


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
}