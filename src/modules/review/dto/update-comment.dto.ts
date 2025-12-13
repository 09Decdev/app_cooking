import {PartialType} from "@nestjs/mapped-types";
import {CreateCommentDto} from "./create-review.dto";

export class UpdateCommentDto extends PartialType(CreateCommentDto) {
}