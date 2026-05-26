import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type PaystackResponse<T> = {
  status: boolean;
  message: string;
  data: T;
};

type PaystackBank = {
  name: string;
  code: string;
  slug?: string;
};

type PaystackAccountResolution = {
  account_number: string;
  account_name: string;
  bank_id: number;
};

type PaystackRecipient = {
  recipient_code: string;
  name: string;
};

type PaystackTransfer = {
  id?: number;
  transfer_code?: string;
  reference?: string;
  status?: string;
};

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly secretKey?: string;

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
  }

  async listBanks(): Promise<PaystackBank[]> {
    const response = await this.request<PaystackBank[]>('/bank?country=nigeria&currency=NGN', {
      method: 'GET',
    });
    return response.data;
  }

  async resolveAccount(accountNumber: string, bankCode: string): Promise<PaystackAccountResolution> {
    const cleanAccountNumber = accountNumber.replace(/\D/g, '');
    if (cleanAccountNumber.length !== 10) {
      throw new BadRequestException('Account number must be 10 digits');
    }
    if (!bankCode) {
      throw new BadRequestException('Bank is required');
    }

    const response = await this.request<PaystackAccountResolution>(
      `/bank/resolve?account_number=${encodeURIComponent(cleanAccountNumber)}&bank_code=${encodeURIComponent(bankCode)}`,
      { method: 'GET' },
    );
    return response.data;
  }

  async createTransferRecipient(input: {
    accountNumber: string;
    bankCode: string;
    accountName: string;
  }): Promise<PaystackRecipient> {
    const response = await this.request<PaystackRecipient>('/transferrecipient', {
      method: 'POST',
      body: JSON.stringify({
        type: 'nuban',
        name: input.accountName,
        account_number: input.accountNumber.replace(/\D/g, ''),
        bank_code: input.bankCode,
        currency: 'NGN',
      }),
    });
    return response.data;
  }

  async initiateTransfer(input: {
    amount: number;
    recipientCode: string;
    reason: string;
    reference: string;
  }): Promise<PaystackTransfer> {
    const response = await this.request<PaystackTransfer>('/transfer', {
      method: 'POST',
      body: JSON.stringify({
        source: 'balance',
        amount: Math.round(input.amount * 100),
        recipient: input.recipientCode,
        reason: input.reason,
        reference: input.reference,
      }),
    });
    return response.data;
  }

  async verifyTransfer(reference: string): Promise<PaystackTransfer> {
    if (!reference) {
      throw new BadRequestException('Transfer reference is required');
    }

    const response = await this.request<PaystackTransfer>(`/transfer/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
    });
    return response.data;
  }

  private async request<T>(path: string, init: RequestInit): Promise<PaystackResponse<T>> {
    if (!this.secretKey || this.secretKey.includes('replace-with') || this.secretKey.includes('your-')) {
      throw new ServiceUnavailableException('Paystack secret key is not configured');
    }

    const response = await fetch(`https://api.paystack.co${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    });

    const data = (await response.json().catch(() => null)) as PaystackResponse<T> | null;
    if (!response.ok || !data?.status) {
      const message = data?.message || response.statusText || 'Paystack request failed';
      this.logger.warn(`Paystack ${path} failed: ${response.status} ${message}`);
      throw new BadRequestException(message);
    }

    return data;
  }
}
