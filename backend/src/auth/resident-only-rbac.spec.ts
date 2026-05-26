import { ForbiddenException } from '@nestjs/common';
import { PayoutsController } from '../payouts/payouts.controller';
import { RecyclablesController } from '../recyclables/recyclables.controller';
import { ReportsController } from '../reports/reports.controller';
import { ServiceRequestsController } from '../service-requests/service-requests.controller';
import { UserRole } from '../users/entities/user.entity';
import { WalletController } from '../wallet/wallet.controller';
import { WasteCollectionController } from '../waste-collection/waste-collection.controller';

const req = (role: UserRole = UserRole.ADMIN) => ({
  user: {
    userId: 'user-1',
    role,
  },
});

describe('resident-only RBAC guardrails', () => {
  it('blocks staff from creating resident complaints and service requests', () => {
    const reportsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findMine: jest.fn(),
      update: jest.fn(),
    };
    const serviceRequestsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findMine: jest.fn(),
      getSummary: jest.fn(),
      update: jest.fn(),
    };

    const reportsController = new ReportsController(reportsService as any);
    const serviceRequestsController = new ServiceRequestsController(serviceRequestsService as any);

    expect(() => reportsController.create({}, req(UserRole.ADMIN))).toThrow(ForbiddenException);
    expect(() => serviceRequestsController.create({} as any, req(UserRole.SUPERVISOR))).toThrow(ForbiddenException);
    expect(() => serviceRequestsController.findMine(req(UserRole.DISPATCHER))).toThrow(ForbiddenException);
    expect(reportsService.create).not.toHaveBeenCalled();
    expect(serviceRequestsService.create).not.toHaveBeenCalled();
    expect(serviceRequestsService.findMine).not.toHaveBeenCalled();
  });

  it('blocks staff from resident collection scheduling and confirmation', () => {
    const wasteCollectionService = {
      findAll: jest.fn(),
      getStats: jest.fn(),
      getMyCollections: jest.fn(),
      scheduleCollection: jest.fn(),
      confirmCollection: jest.fn(),
      findOneForUser: jest.fn(),
      verifyCollection: jest.fn(),
    };
    const controller = new WasteCollectionController(wasteCollectionService as any);

    expect(() => controller.getMyCollections(req(UserRole.ADMIN))).toThrow(ForbiddenException);
    expect(() => controller.scheduleCollection(req(UserRole.WARD_OFFICER), { scheduledDate: new Date().toISOString() })).toThrow(
      ForbiddenException,
    );
    expect(() => controller.confirmCollection('collection-1', { observedTruckCode: 'TRUCK-1' }, req(UserRole.DISPATCHER))).toThrow(
      ForbiddenException,
    );
    expect(wasteCollectionService.getMyCollections).not.toHaveBeenCalled();
    expect(wasteCollectionService.scheduleCollection).not.toHaveBeenCalled();
    expect(wasteCollectionService.confirmCollection).not.toHaveBeenCalled();
  });

  it('blocks staff from resident recyclable creation and pickup requests', () => {
    const recyclablesService = {
      findAll: jest.fn(),
      getMyRecyclables: jest.fn(),
      getValuationSummary: jest.fn(),
      createWithValuation: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      requestPickupForUser: jest.fn(),
    };
    const controller = new RecyclablesController(recyclablesService as any);

    expect(() => controller.getMyRecyclables(req(UserRole.ADMIN))).toThrow(ForbiddenException);
    expect(() => controller.getValuationSummary(req(UserRole.SUPERVISOR))).toThrow(ForbiddenException);
    expect(() => controller.submitWithValuation({}, req(UserRole.WARD_OFFICER))).toThrow(ForbiddenException);
    expect(() => controller.create({}, req(UserRole.RECYCLER))).toThrow(ForbiddenException);
    expect(() => controller.requestPickup('recyclable-1', req(UserRole.ADMIN))).toThrow(ForbiddenException);
    expect(recyclablesService.create).not.toHaveBeenCalled();
    expect(recyclablesService.createWithValuation).not.toHaveBeenCalled();
    expect(recyclablesService.requestPickupForUser).not.toHaveBeenCalled();
  });

  it('blocks staff from resident wallet and payout actions', async () => {
    const walletService = {
      getBanks: jest.fn(),
      resolveAccount: jest.fn(),
      findAllByUser: jest.fn(),
      assertCanReviewWithdrawals: jest.fn(),
      findWithdrawals: jest.fn(),
      verifyWithdrawalStatus: jest.fn(),
      getBalanceByUser: jest.fn(),
      getWithdrawalLimits: jest.fn(),
      getTransactionSummary: jest.fn(),
      withdraw: jest.fn(),
    };
    const payoutsService = {
      createPayoutRequest: jest.fn(),
      getUserPayoutRequests: jest.fn(),
    };
    const paystackService = {
      getBanks: jest.fn(),
      verifyAccount: jest.fn(),
      createRecipient: jest.fn(),
    };
    const walletController = new WalletController(walletService as any);
    const payoutsController = new PayoutsController(payoutsService as any, paystackService as any);

    expect(() => walletController.getBanks(req(UserRole.ADMIN))).toThrow(ForbiddenException);
    expect(() => walletController.resolveAccount({ accountNumber: '0123456789', bankCode: '001' }, req(UserRole.ADMIN))).toThrow(
      ForbiddenException,
    );
    expect(() => walletController.getTransactions(req(UserRole.SUPERVISOR))).toThrow(ForbiddenException);
    expect(() => walletController.getBalance(req(UserRole.WARD_OFFICER))).toThrow(ForbiddenException);
    expect(() => walletController.getWithdrawalLimits(req(UserRole.DISPATCHER))).toThrow(ForbiddenException);
    expect(() => walletController.getTransactionSummary(req(UserRole.FINANCE_OFFICER))).toThrow(ForbiddenException);
    expect(() =>
      walletController.withdraw({ amount: 100, accountNumber: '0123456789', bankCode: '001' }, req(UserRole.ADMIN)),
    ).toThrow(ForbiddenException);

    await expect(payoutsController.createPayoutRequest(req(UserRole.ADMIN), { amount: 100 })).rejects.toThrow(ForbiddenException);
    await expect(payoutsController.getUserPayoutRequests(req(UserRole.SUPERVISOR))).rejects.toThrow(ForbiddenException);
    await expect(payoutsController.getBanks(req(UserRole.FINANCE_OFFICER))).rejects.toThrow(ForbiddenException);
    await expect(
      payoutsController.verifyAccount({ accountNumber: '0123456789', bankCode: '001' }, req(UserRole.ADMIN)),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      payoutsController.createRecipient(
        { accountNumber: '0123456789', bankCode: '001', accountName: 'Resident User' },
        req(UserRole.ADMIN),
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(walletService.withdraw).not.toHaveBeenCalled();
    expect(payoutsService.createPayoutRequest).not.toHaveBeenCalled();
    expect(paystackService.createRecipient).not.toHaveBeenCalled();
  });
});
