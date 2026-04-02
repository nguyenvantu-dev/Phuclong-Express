/**
 * Auth Response DTO
 *
 * Response after successful login/registration.
 */
export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string | number;
    username: string;
    email: string;
    hoTen?: string;
    roles: string[];
  };
}
