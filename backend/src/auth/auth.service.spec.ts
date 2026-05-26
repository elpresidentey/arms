import { ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRole } from '../users/entities/user.entity';

describe('AuthService admin registration guardrails', () => {
  const createService = () => {
    const usersService = {
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation(async (data) => ({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    };

    const config = {
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_ANON_KEY: 'anon-key',
    };

    const configService = {
      get: jest.fn((key: string, defaultValue?: string) => config[key] ?? defaultValue),
    };

    const notificationsService = {
      sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
    };

    const adminInvitesService = {
      consumeInvite: jest.fn().mockResolvedValue(undefined),
    };

    return {
      service: new AuthService(
        usersService as never,
        configService as never,
        notificationsService as never,
        adminInvitesService as never,
      ),
      usersService,
      notificationsService,
      adminInvitesService,
    };
  };

  it('blocks admin signup without an invite token', async () => {
    const { service, usersService, adminInvitesService } = createService();

    await expect(
      service.registerProfile(
        { userId: 'user-1', email: 'admin@example.com' },
        {
          firstName: 'Ada',
          lastName: 'Admin',
          phoneNumber: '+2340000000000',
          address: 'HQ',
          ward: 'Central',
          houseNumber: '1',
          street: 'Secretariat Road',
          role: UserRole.ADMIN,
        },
      ),
    ).rejects.toThrow(new ForbiddenException('Admin invite is required'));

    expect(usersService.create).not.toHaveBeenCalled();
    expect(adminInvitesService.consumeInvite).not.toHaveBeenCalled();
  });

  it('blocks admin signup with an invalid invite token', async () => {
    const { service, usersService, adminInvitesService } = createService();
    adminInvitesService.consumeInvite.mockRejectedValue(new ForbiddenException('Admin invite is invalid or expired'));

    await expect(
      service.registerProfile(
        { userId: 'user-2', email: 'admin@example.com' },
        {
          firstName: 'Ada',
          lastName: 'Admin',
          phoneNumber: '+2340000000000',
          address: 'HQ',
          ward: 'Central',
          houseNumber: '1',
          street: 'Secretariat Road',
          role: UserRole.ADMIN,
          adminInviteToken: 'wrong-token',
        },
      ),
    ).rejects.toThrow(new ForbiddenException('Admin invite is invalid or expired'));

    expect(usersService.create).not.toHaveBeenCalled();
    expect(adminInvitesService.consumeInvite).toHaveBeenCalledWith('admin@example.com', 'wrong-token', 'user-2');
  });

  it('creates an admin profile only when the invite token is accepted', async () => {
    const { service, usersService, notificationsService, adminInvitesService } = createService();

    const profile = await service.registerProfile(
      { userId: 'user-3', email: 'admin@example.com' },
      {
        firstName: 'Ada',
        lastName: 'Admin',
        phoneNumber: '+2340000000000',
        address: 'HQ',
        ward: 'Central',
        houseNumber: '1',
        street: 'Secretariat Road',
        role: UserRole.ADMIN,
        adminInviteToken: 'valid-token',
      },
    );

    expect(adminInvitesService.consumeInvite).toHaveBeenCalledWith('admin@example.com', 'valid-token', 'user-3');
    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-3',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      }),
    );
    expect(profile.role).toBe(UserRole.ADMIN);
    expect(notificationsService.sendWelcomeEmail).toHaveBeenCalled();
  });

  it('blocks profile creation when an existing email belongs to a different auth id', async () => {
    const { service, usersService, adminInvitesService } = createService();
    usersService.findByEmail.mockResolvedValue({
      id: 'existing-user',
      email: 'resident@example.com',
      firstName: 'Rita',
      lastName: 'Resident',
      phoneNumber: '+2340000000000',
      address: '1 Main Road',
      ward: 'Unassigned',
      houseNumber: '1',
      street: 'Main Road',
      role: UserRole.RESIDENT,
      password: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.registerProfile(
        { userId: 'new-auth-user', email: 'resident@example.com' },
        {
          firstName: 'Rita',
          lastName: 'Resident',
          phoneNumber: '+2340000000000',
          address: '1 Main Road',
          houseNumber: '1',
          street: 'Main Road',
          role: UserRole.RESIDENT,
        },
      ),
    ).rejects.toThrow(
      new ForbiddenException(
        'An account already exists for this email address. Contact support to finish account migration.',
      ),
    );

    expect(usersService.create).not.toHaveBeenCalled();
    expect(adminInvitesService.consumeInvite).not.toHaveBeenCalled();
  });
});
