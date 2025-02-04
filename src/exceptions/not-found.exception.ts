import { ErrorCodes } from 'src/exceptions/error-codes';
import { BaseException } from './base.exception';
import { HttpStatus } from '@nestjs/common';

export class NotFoundException extends BaseException {
  constructor(message: string) {
    super(message, HttpStatus.NOT_FOUND, ErrorCodes.USERNAME_TAKEN);
  }
}
