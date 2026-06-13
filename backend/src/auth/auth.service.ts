import { ForbiddenException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ForgotPasswordDto, LoginDto, RegisterProfileDto } from './dto/auth.dto';
import { UserRole } from '../users/entities/user.entity';
import { AdminInvitesService } from '../admin-invites/admin-invites.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly supabase: SupabaseClient;
  private readonly canManageSupabaseUsers: boolean;
  private readonly tokenCacheTtlMs: number;
  private readonly authUserCache = new Map<string, { expiresAt: number; value: { userId: string; email: string } }>();
  private readonly accessTokenCache = new Map<string, { expiresAt: number; value: { userId: string; email: string; role: UserRole } }>();

  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
    private adminInvitesService: AdminInvitesService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseKey = serviceRoleKey || this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase backend environment variables');
    }

    this.canManageSupabaseUsers = Boolean(serviceRoleKey);
    this.tokenCacheTtlMs = this.configService.get<number>('AUTH_TOKEN_CACHE_TTL_MS', 60000);

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  private normalizeEmail(email?: string | null) {
    return email?.trim().toLowerCase() || null;
  }

  private async resolveProfileByAuthIdentity(userId: string, email?: string | null) {
    const profileById = await this.usersService.findById(userId);
    if (profileById) {
      return profileById;
    }

    const normalizedEmail = this.normalizeEmail(email);
    if (!normalizedEmail) {
      return null;
    }

    const profileByEmail = await this.usersService.findByEmail(normalizedEmail);
    if (!profileByEmail) {
      return null;
    }

    if (profileByEmail.id !== userId) {
      this.logger.warn(
        `Auth identity mismatch for ${normalizedEmail}: auth user ${userId} does not match profile ${profileByEmail.id}`,
      );
      throw new ForbiddenException(
        'This account profile is out of sync with authentication. Contact support to complete account migration.',
      );
    }

    return profileByEmail;
  }

  private async cleanupAuthUser(userId: string) {
    if (!this.canManageSupabaseUsers) {
      return;
    }

    try {
      await this.supabase.auth.admin.deleteUser(userId);
    } catch (error) {
      this.logger.warn(`Failed to clean up Supabase auth user ${userId}: ${(error as Error).message}`);
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email.trim().toLowerCase());
    if (user?.password && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: loginDto.email,
      password: loginDto.password,
    });

    if (error || !data.session) {
      // Log the actual error for debugging but return a generic message
      this.logger.warn(`Login failed for ${loginDto.email}: ${error?.message || 'No session returned'}`);
      
      // Get user to determine if they're admin (for error message customization)
      const user = await this.usersService.findByEmail(loginDto.email.trim().toLowerCase());
      const isAdmin = user?.role && user.role !== 'resident';
      
      if (isAdmin) {
        // Silent fail for admin - no detailed error message
        throw new UnauthorizedException('Access denied');
      } else {
        // Detailed error for residents
        throw new UnauthorizedException('Invalid email or password. Please check your credentials and try again.');
      }
    }

    const user = await this.getProfileByAuthIdentity(data.user.id, data.user.email);

    return {
      access_token: data.session.access_token,
      token: data.session.access_token,
      user,
    };
  }

  async registerProfile(authUser: { userId: string; email: string }, registerDto: RegisterProfileDto) {
    const existingUser = await this.usersService.findById(authUser.userId);
    if (existingUser) {
      const { password: _, ...result } = existingUser;
      return result;
    }

    const requestedRole = registerDto.role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.RESIDENT;
    const normalizedEmail = authUser.email.trim().toLowerCase();
    const existingEmailUser = await this.usersService.findByEmail(normalizedEmail);
    if (existingEmailUser) {
      if (existingEmailUser.id !== authUser.userId) {
        throw new ForbiddenException(
          'An account already exists for this email address. Contact support to finish account migration.',
        );
      }
      const { password: _, ...result } = existingEmailUser;
      return result;
    }

    if (requestedRole === UserRole.ADMIN) {
      if (!registerDto.adminInviteToken) {
        throw new ForbiddenException('Admin invite is required');
      }

      await this.adminInvitesService.consumeInvite(normalizedEmail, registerDto.adminInviteToken, authUser.userId);
    }

    const { adminInviteToken: _adminInviteToken, ...profileData } = registerDto;

    const user = await this.usersService.create({
      ...profileData,
      id: authUser.userId,
      email: normalizedEmail,
      password: null,
      role: requestedRole,
    });

    const { password: _, ...result } = user;
    void this.notificationsService.sendWelcomeEmail(user);
    return result;
  }

  async requestPasswordReset(forgotPasswordDto: ForgotPasswordDto) {
    const email = forgotPasswordDto.email.trim().toLowerCase();
    const configuredRedirect = this.configService.get<string>('SUPABASE_PASSWORD_REDIRECT_URL');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const workspace = forgotPasswordDto.workspace === 'admin' ? 'admin' : 'resident';
    const redirectTo =
      configuredRedirect || `${frontendUrl.replace(/\/$/, '')}/reset-password?workspace=${workspace}`;
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, redirectTo ? { redirectTo } : undefined);

    if (error) {
      this.logger.warn(`Password reset email request failed for ${email}: ${error.message}`);
    }

    return {
      message: 'If that email is registered, password reset instructions will be sent shortly.',
    };
  }

  async verifySupabaseAccessToken(token: string) {
    const cached = this.authUserCache.get(token);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user?.id || !data.user.email) {
      throw new UnauthorizedException('Invalid Supabase access token');
    }

    const authUser = {
      userId: data.user.id,
      email: data.user.email,
    };

    this.authUserCache.set(token, {
      expiresAt: Date.now() + this.tokenCacheTtlMs,
      value: authUser,
    });

    return authUser;
  }

  async verifyAccessToken(token: string) {
    const cached = this.accessTokenCache.get(token);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const authUser = await this.verifySupabaseAccessToken(token);

    const profile = await this.resolveProfileByAuthIdentity(authUser.userId, authUser.email);
    if (!profile) {
      throw new UnauthorizedException('User profile not found for this authentication session');
    }

    const verifiedUser = {
      userId: profile.id,
      email: authUser.email,
      role: profile.role,
    };

    this.accessTokenCache.set(token, {
      expiresAt: Date.now() + this.tokenCacheTtlMs,
      value: verifiedUser,
    });

    return verifiedUser;
  }

  private async getProfileByAuthIdentity(userId: string, email?: string | null) {
    const user = await this.resolveProfileByAuthIdentity(userId, email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password: _, ...result } = user;
    return result;
  }

  async bootstrapFirstAdmin(bootstrapToken: string, adminData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
    ward: string;
    houseNumber: string;
    street: string;
  }) {
    const expectedBootstrapToken = this.configService.get<string>('BOOTSTRAP_ADMIN_TOKEN');
    if (!expectedBootstrapToken || bootstrapToken !== expectedBootstrapToken) {
      throw new ForbiddenException('Bootstrap admin token is invalid or not configured');
    }

    if (!this.canManageSupabaseUsers) {
      throw new ForbiddenException('SUPABASE_SERVICE_ROLE_KEY is required to bootstrap the first admin');
    }

    // Check if any admin already exists.
    const adminExists = await this.usersService.findAdminByRole();
    if (adminExists) {
      throw new ForbiddenException('An admin user already exists. Bootstrap is only for initial setup.');
    }

    // Create Supabase auth user
    const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
      email: adminData.email.trim().toLowerCase(),
      password: adminData.password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      this.logger.error(`Failed to create Supabase auth user: ${authError?.message}`);
      throw new ForbiddenException('Failed to create authentication user');
    }

    try {
      // Create the user profile with admin role
      const user = await this.usersService.create({
        id: authData.user.id,
        email: adminData.email.trim().toLowerCase(),
        password: null,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        phoneNumber: adminData.phoneNumber,
        address: adminData.address,
        ward: adminData.ward,
        houseNumber: adminData.houseNumber,
        street: adminData.street,
        role: UserRole.ADMIN,
      });

      this.logger.log(`Bootstrap admin user created: ${user.email}`);

      // Return login credentials
      const { data: sessionData } = await this.supabase.auth.signInWithPassword({
        email: adminData.email,
        password: adminData.password,
      });

      const { password: _, ...userResult } = user;

      return {
        access_token: sessionData?.session?.access_token || null,
        token: sessionData?.session?.access_token || null,
        user: userResult,
        message: 'Bootstrap admin created successfully',
      };
    } catch (error) {
      // Cleanup auth user if profile creation fails
      await this.cleanupAuthUser(authData.user.id);
      throw error;
    }
  }
}
