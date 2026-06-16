import { IsEmail, IsIn, IsNumber, IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsStrongPassword } from '../validators/password.validator';

export class LoginDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password: string;
}

export class ForgotPasswordDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsOptional()
  @IsIn(['resident', 'admin'])
  workspace?: string;
}

export class RegisterProfileDto {
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'First name can only contain letters, spaces, hyphens, and apostrophes' })
  firstName: string;

  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'Last name can only contain letters, spaces, hyphens, and apostrophes' })
  lastName: string;

  @IsString()
  @Matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, { 
    message: 'Please provide a valid phone number' 
  })
  phoneNumber: string;

  @IsString()
  @MinLength(5, { message: 'Address must be at least 5 characters' })
  @MaxLength(200, { message: 'Address must not exceed 200 characters' })
  address: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ward?: string;

  @IsString()
  @MinLength(1, { message: 'House number is required' })
  @MaxLength(20)
  houseNumber: string;

  @IsString()
  @MinLength(2, { message: 'Street name must be at least 2 characters' })
  @MaxLength(100)
  street: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  serviceZone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  propertyType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  landmark?: string;

  @IsOptional()
  @IsNumber()
  householdSize?: number;

  @IsOptional()
  @IsIn(['resident', 'admin'])
  role?: string;

  @IsOptional()
  @IsString()
  adminInviteToken?: string;
}

export class RegisterDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;

  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'First name can only contain letters, spaces, hyphens, and apostrophes' })
  firstName: string;

  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'Last name can only contain letters, spaces, hyphens, and apostrophes' })
  lastName: string;

  @IsString()
  @Matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, { 
    message: 'Please provide a valid phone number' 
  })
  phoneNumber: string;

  @IsString()
  @MinLength(5, { message: 'Address must be at least 5 characters' })
  @MaxLength(200, { message: 'Address must not exceed 200 characters' })
  address: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ward?: string;

  @IsString()
  @MinLength(1, { message: 'House number is required' })
  @MaxLength(20)
  houseNumber: string;

  @IsString()
  @MinLength(2, { message: 'Street name must be at least 2 characters' })
  @MaxLength(100)
  street: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  serviceZone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  propertyType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  landmark?: string;

  @IsOptional()
  @IsNumber()
  householdSize?: number;
}

export class BootstrapAdminDto {
  @IsString()
  @MinLength(32, { message: 'Bootstrap token must be at least 32 characters' })
  bootstrapToken: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName: string;

  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName: string;

  @IsString()
  @MinLength(10, { message: 'Please provide a valid phone number' })
  phoneNumber: string;

  @IsString()
  @MinLength(5, { message: 'Address must be at least 5 characters' })
  address: string;

  @IsString()
  ward: string;

  @IsString()
  houseNumber: string;

  @IsString()
  street: string;
}
