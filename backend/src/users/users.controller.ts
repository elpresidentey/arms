import { Controller, Get, Param, UseGuards, Patch, Request, Body, Post, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { userId: string; role: string } }) {
    const canReviewOthers = ['admin', 'supervisor', 'finance_officer'].includes(req.user.role);
    if (!canReviewOthers && req.user.userId !== id) {
      throw new ForbiddenException('You can only view your own user profile');
    }
    return this.usersService.findById(id);
  }

  @Patch('profile')
  updateProfile(
    @Request() req: { user: { userId: string } },
    @Body() updateData: { street?: string; ward?: string; houseNumber?: string; landmark?: string; propertyType?: string },
  ) {
    return this.usersService.updateProfile(req.user.userId, updateData);
  }

  @Patch('bank-details')
  updateBankDetails(
    @Request() req: { user: { userId: string } },
    @Body() bankData: {
      bankCode: string;
      accountNumber: string;
      accountName: string;
      paystackRecipientCode?: string;
    },
  ) {
    return this.usersService.updateBankDetails(req.user.userId, bankData);
  }

  @Post('verify-bank')
  verifyBankDetails(
    @Request() req: { user: { userId: string } },
    @Body() verifyData: {
      accountNumber: string;
      bankCode: string;
      paystackRecipientCode: string;
    },
  ) {
    return this.usersService.verifyBankDetails(
      req.user.userId,
      verifyData.accountNumber,
      verifyData.bankCode,
      verifyData.paystackRecipientCode,
    );
  }
}
