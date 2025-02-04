import { ErrorCodes } from 'src/exceptions/error-codes';
import { BaseException } from './base.exception';
import { HttpStatus } from '@nestjs/common';

export class UnauthorizedException extends BaseException {
  constructor(message: string) {
    super(message, HttpStatus.UNAUTHORIZED, ErrorCodes.NOT_FOUND);
  }
}
