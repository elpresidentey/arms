import { Body, Controller, Get, Request, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BootstrapAdminDto, ForgotPasswordDto, LoginDto, RegisterProfileDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SupabaseAccessTokenGuard } from './guards/supabase-access-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
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
