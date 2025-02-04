import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseException extends HttpException {
  errorCode: number;

  constructor(message: string, status: HttpStatus, errorCode: number) {
    super(message, status);
    this.errorCode = errorCode;
  }
}
