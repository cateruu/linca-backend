import { ErrorCodes } from 'src/exceptions/error-codes';
import { BaseException } from './base.exception';
import { HttpStatus } from '@nestjs/common';

export class UsernameTakenException extends BaseException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT, ErrorCodes.USERNAME_TAKEN);
  }
}
