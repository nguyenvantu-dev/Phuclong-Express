import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';

/**
 * Register DTO
 *
 * Used for user registration with all customer details.
 */
export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  hoTen?: string;

  @IsString()
  @IsOptional()
  diaChi?: string;

  @IsString()
  @IsOptional()
  tinhThanh?: string;

  @IsString()
  @IsOptional()
  soTaiKhoan?: string;

  @IsString()
  @IsOptional()
  hinhThucNhanHang?: string;

  @IsBoolean()
  @IsOptional()
  khachBuon?: boolean;

  @IsString()
  @IsOptional()
  linkTaiKhoanMang?: string;

  @IsString()
  @IsOptional()
  vungMien?: string;
}
