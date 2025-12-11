import {IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";
import {Type} from "class-transformer";

export class StepDTO {
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    order: number;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsOptional()
    image?: string;

}