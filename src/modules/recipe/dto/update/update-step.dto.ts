import {PartialType} from "@nestjs/mapped-types";
import {StepDTO} from "../creat/create-step.dto";

export class UpdateStepDto extends PartialType(StepDTO) {
}