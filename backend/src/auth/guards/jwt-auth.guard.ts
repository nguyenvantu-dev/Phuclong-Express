import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Auth Guard
 *
 * Protects routes requiring authentication.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context) {
    console.log('[Guard] ⚡ canActivate called!');
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    console.log('[Guard] handleRequest err:', err);
    console.log('[Guard] handleRequest user:', user);
    console.log('[Guard] handleRequest info:', info);
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication required');
    }
    return user;
  }
}
