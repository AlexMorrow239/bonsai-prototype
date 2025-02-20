/**
 * Custom validation pipe
 * Performs data transformation and validation using class-validator
 * and class-transformer decorators
 */

import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  Type,
} from "@nestjs/common";

import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  /**
   * Transforms and validates incoming data
   * @param value The value to transform/validate
   * @param metadata Metadata about the value being processed
   * @returns Transformed and validated value
   * @throws BadRequestException if validation fails
   */
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      throw new BadRequestException("Validation failed");
    }

    return value;
  }

  /**
   * Determines if the type should be validated
   * @param metatype Type to check for validation
   * @returns Boolean indicating if type should be validated
   */
  private toValidate(metatype: Type<any>): boolean {
    const types: Type<any>[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
