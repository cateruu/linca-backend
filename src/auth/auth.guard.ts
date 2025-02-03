import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Roles } from 'src/roles/roles.entity';

interface TokenUser {
  sub: string;
  username: string;
  roles: Roles[];
}

export interface RequestWithUser extends Request {
  user: TokenUser;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = this.extractTokenFromRequest(req);

    if (!token) {
      throw new UnauthorizedException('no token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      req['user'] = payload;
    } catch {
      throw new UnauthorizedException('invalid token');
    }

    return true;
  }

  private extractTokenFromRequest(req: Request): string | null {
    const token = req.cookies['jwt'];
    return token;
  }
}
