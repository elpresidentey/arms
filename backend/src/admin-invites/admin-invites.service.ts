import { BadRequestException, ForbiddenException, Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserRole } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { AdminInvite } from './entities/admin-invite.entity';

export interface AdminInviteView {
  id: string;
  email: string;
  role: UserRole;
  createdByUserId: string;
  usedByUserId: string | null;
  expiresAt: Date;
  usedAt: Date | null;
  revokedAt: Date | null;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'used' | 'revoked' | 'expired';
}

@Injectable()
export class AdminInvitesService implements OnModuleInit {
  private readonly logger = new Logger(AdminInvitesService.name);
  private readonly supabase: SupabaseClient;

  constructor(
    @InjectRepository(AdminInvite)
    private readonly adminInvitesRepository: Repository<AdminInvite>,
    private readonly dataSource: DataSource,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async onModuleInit() {
    await this.ensureAdminInvitesTable();
  }

  private async ensureAdminInvitesTable() {
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS admin_invites (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tokenHash" varchar NOT NULL UNIQUE,
        email varchar NOT NULL,
        role text NOT NULL DEFAULT 'admin',
        "createdByUserId" varchar NOT NULL,
        "usedByUserId" varchar,
        "expiresAt" timestamp NOT NULL,
        "usedAt" timestamp,
        "revokedAt" timestamp,
        note text,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
    await this.dataSource.query('CREATE INDEX IF NOT EXISTS idx_admin_invites_email ON admin_invites (email)');
    await this.dataSource.query('CREATE INDEX IF NOT EXISTS idx_admin_invites_expires_at ON admin_invites ("expiresAt")');
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private generateToken() {
    return randomBytes(24).toString('hex');
  }

  private getStatus(invite: AdminInvite): AdminInviteView['status'] {
    if (invite.usedAt) {
      return 'used';
    }
    if (invite.revokedAt) {
      return 'revoked';
    }
    if (invite.expiresAt.getTime() <= Date.now()) {
      return 'expired';
    }
    return 'active';
  }

  private toView(invite: AdminInvite): AdminInviteView {
    return {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      createdByUserId: invite.createdByUserId,
      usedByUserId: invite.usedByUserId,
      expiresAt: invite.expiresAt,
      usedAt: invite.usedAt,
      revokedAt: invite.revokedAt,
      note: invite.note,
      createdAt: invite.createdAt,
      updatedAt: invite.updatedAt,
      status: this.getStatus(invite),
    };
  }

  async createInvite(createdByUserId: string, options: { email: string; expiresInHours?: number; note?: string }) {
    const email = this.normalizeEmail(options.email);
    const expiresInHours = Math.max(1, Math.min(168, Math.round(options.expiresInHours ?? 72)));
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const invite = this.adminInvitesRepository.create({
      tokenHash: this.hashToken(token),
      email,
      role: UserRole.ADMIN,
      createdByUserId,
      usedByUserId: null,
      expiresAt,
      usedAt: null,
      revokedAt: null,
      note: options.note?.trim() || null,
    });

    const savedInvite = await this.adminInvitesRepository.save(invite);
    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '') || 'http://localhost:3000';
    const inviteLink = `${frontendUrl}/admin/register?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
    const emailDeliveryId = await this.notificationsService.sendAdminInviteEmail({
      to: email,
      inviteLink,
      expiresAt,
      note: options.note?.trim() || null,
    });

    return {
      invite: this.toView(savedInvite),
      token,
      inviteLink,
      emailSent: Boolean(emailDeliveryId),
    };
  }

  async listInvites() {
    const invites = await this.adminInvitesRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: 50,
    });

    return invites.map((invite) => this.toView(invite));
  }

  async revokeInvite(id: string) {
    const invite = await this.adminInvitesRepository.findOne({ where: { id } });
    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.usedAt) {
      throw new BadRequestException('Used invites cannot be revoked');
    }

    if (!invite.revokedAt) {
      invite.revokedAt = new Date();
      await this.adminInvitesRepository.save(invite);
    }

    return this.toView(invite);
  }

  async validateInvite(email: string, token: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const invite = await this.adminInvitesRepository.findOne({
      where: { tokenHash: this.hashToken(token) },
    });

    if (!invite || invite.email !== normalizedEmail) {
      throw new ForbiddenException('Admin invite is invalid or expired');
    }

    const status = this.getStatus(invite);
    if (status !== 'active') {
      throw new ForbiddenException('Admin invite is invalid or expired');
    }

    return this.toView(invite);
  }

  async consumeInvite(email: string, token: string, usedByUserId: string) {
    const invite = await this.adminInvitesRepository.findOne({
      where: { tokenHash: this.hashToken(token) },
    });

    const normalizedEmail = this.normalizeEmail(email);
    if (!invite || invite.email !== normalizedEmail) {
      throw new ForbiddenException('Admin invite is invalid or expired');
    }

    const status = this.getStatus(invite);
    if (status !== 'active') {
      throw new ForbiddenException('Admin invite is invalid or expired');
    }

    invite.usedAt = new Date();
    invite.usedByUserId = usedByUserId;

    const savedInvite = await this.adminInvitesRepository.save(invite);
    return this.toView(savedInvite);
  }

  async acceptInvite(token: string, adminData: {
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
    const email = this.normalizeEmail(adminData.email);
    
    // Validate the invite first
    const invite = await this.validateInvite(email, token);
    
    // Create Supabase auth user
    const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
      email,
      password: adminData.password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      this.logger.error(`Failed to create Supabase auth user: ${authError?.message}`);
      throw new BadRequestException('Failed to create authentication user');
    }

    try {
      // Create the user profile with admin role
      const user = await this.usersService.create({
        id: authData.user.id,
        email,
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

      // Consume the invite
      await this.consumeInvite(email, token, user.id);
      
      this.logger.log(`Admin user created via invite: ${user.email}`);

      // Return login credentials
      const { data: sessionData, error: signInError } = await this.supabase.auth.signInWithPassword({
        email,
        password: adminData.password,
      });

      if (signInError || !sessionData.session) {
        this.logger.error(`Failed to sign in new admin user: ${signInError?.message}`);
        throw new BadRequestException('User created but failed to sign in');
      }

      return {
        access_token: sessionData.session.access_token,
        token: sessionData.session.access_token,
        user,
        message: 'Admin account created successfully via invite',
      };
    } catch (error) {
      // Clean up auth user if profile creation fails
      await this.supabase.auth.admin.deleteUser(authData.user.id);
      throw error;
    }
  }
}
