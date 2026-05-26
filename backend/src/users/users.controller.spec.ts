import { ForbiddenException } from '@nestjs/common';
import { UsersController } from './users.controller';

describe('UsersController access control', () => {
  const usersService = {
    findById: jest.fn().mockResolvedValue({ id: 'target-user' }),
    updateProfile: jest.fn(),
    updateBankDetails: jest.fn(),
    verifyBankDetails: jest.fn(),
  };

  const controller = new UsersController(usersService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows a resident to read their own profile', async () => {
    await controller.findOne('target-user', { user: { userId: 'target-user', role: 'resident' } });

    expect(usersService.findById).toHaveBeenCalledWith('target-user');
  });

  it('blocks a resident from reading another profile', async () => {
    expect(() =>
      controller.findOne('target-user', { user: { userId: 'other-user', role: 'resident' } }),
    ).toThrow(new ForbiddenException('You can only view your own user profile'));
  });

  it('allows an admin to read another profile', async () => {
    await controller.findOne('target-user', { user: { userId: 'admin-user', role: 'admin' } });

    expect(usersService.findById).toHaveBeenCalledWith('target-user');
  });
});
