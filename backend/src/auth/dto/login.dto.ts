import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

/**
 * Login DTO
 *
 * Used for user authentication.
 */
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
