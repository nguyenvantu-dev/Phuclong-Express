import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Sequelize } from 'sequelize-typescript';
import { User, UserModel } from '../../users/entities/user.entity';

/**
 * JWT Strategy
 *
 * Validates JWT tokens for authenticated requests using Sequelize.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private userModel: typeof User;

  constructor(@Inject('SEQUELIZE') private sequelize: Sequelize) {
    console.log('[JWT] ⚡ Strategy constructor called!');
    const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
    console.log('[JWT] Strategy init with secret:', secret);
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    });
    if (!sequelize.models.User) {
      UserModel(sequelize);
    }
    this.userModel = sequelize.models.User as typeof User;
  }

  async validate(payload: { sub: string; username: string }) {
    console.log('[JWT] Validate payload:', payload);
    const user = await this.userModel.findByPk(payload.sub);

    if (!user) {
      console.log('[JWT] User not found, sub:', payload.sub);
      throw new UnauthorizedException('User not found');
    }

    console.log('[JWT] User found:', user.UserName);
    return {
      id: user.Id,
      username: user.UserName,
      email: user.Email,
      roles: user.roles,
    };
  }
}
