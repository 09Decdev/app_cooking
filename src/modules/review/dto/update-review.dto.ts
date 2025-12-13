import { PartialType } from '@nestjs/mapped-types';
import {CreateCommentDto, CreateReviewDto} from "./create-review.dto";


export class UpdateReviewDto extends PartialType(CreateReviewDto) {}
