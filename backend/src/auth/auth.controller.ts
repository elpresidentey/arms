import { Body, Controller, Get, Request, Post, UseGuards, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BootstrapAdminDto, ForgotPasswordDto, LoginDto, RegisterProfileDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SupabaseAccessTokenGuard } from './guards/supabase-access-token.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: any, @Res({ passthrough: true }) res: Response) {
    try {
      const result = await this.authService.login(loginDto);
      // Reset failed attempts header on successful login
      res.removeHeader('x-failed-attempts');
      return result;
    } catch (error) {
      // Increment failed attempts for progressive rate limiting
      const currentFailed = parseInt(req.headers['x-failed-attempts'] || '0');
      const newFailedCount = currentFailed + 1;
      res.setHeader('x-failed-attempts', newFailedCount.toString());
      throw error;
    }
  }

  @UseGuards(SupabaseAccessTokenGuard)
  @Post('register')
  register(@Request() req: { user: { userId: string; email: string } }, @Body() registerDto: RegisterProfileDto) {
    return this.authService.registerProfile(req.user, registerDto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(forgotPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@Request() req: { user: { userId: string } }) {
    return this.authService.getProfile(req.user.userId);
  }

  @Post('bootstrap')
  bootstrap(@Body() body: BootstrapAdminDto) {
    return this.authService.bootstrapFirstAdmin(body.bootstrapToken, {
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      phoneNumber: body.phoneNumber,
      address: body.address,
      ward: body.ward,
      houseNumber: body.houseNumber,
      street: body.street,
    });
  }
}
