import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly secretKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    if (!this.secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured');
    }
  }

  private async makeRequest<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    data?: any,
  ): Promise<AxiosResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.request<T>({
        url,
        method,
        headers,
        data,
      });
      return response as AxiosResponse<T>;
    } catch (error) {
      this.logger.error(`Paystack API error: ${error.message}`, error.response?.data);
      throw error;
    }
  }

  /**
   * Get list of banks
   */
  async getBanks(): Promise<{ data: { name: string; code: string }[] }> {
    const response = await this.makeRequest<{ data: { name: string; code: string }[] }>('/bank');
    return response.data as { data: { name: string; code: string }[] };
  }

  /**
   * Initialize payment transaction
   */
  async initializeTransaction(data: {
    email: string;
    amount: number;
    reference: string;
    metadata?: any;
    callback_url?: string;
  }): Promise<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }> {
    const response = await this.makeRequest<{
      status: boolean;
      message: string;
      data: {
        authorization_url: string;
        access_code: string;
        reference: string;
      };
    }>('/transaction/initialize', 'POST', data);
    return response.data.data;
  }

  /**
   * Verify payment transaction
   */
  async verifyTransaction(reference: string): Promise<{
    status: string;
    reference: string;
    amount: number;
    paid_at: string;
    channel: string;
    currency: string;
    [key: string]: any;
  }> {
    const response = await this.makeRequest<{
      status: boolean;
      message: string;
      data: {
        status: string;
        reference: string;
        amount: number;
        paid_at: string;
        channel: string;
        currency: string;
        [key: string]: any;
      };
    }>(`/transaction/verify/${reference}`);
    return response.data.data;
  }

  /**
   * Verify bank account number
   */
  async verifyAccount(accountNumber: string, bankCode: string): Promise<{
    status: boolean;
    message: string;
    data: {
      account_number: string;
      account_name: string;
      bank_id: number;
    };
  }> {
    const response = await this.makeRequest<{
      status: boolean;
      message: string;
      data: {
        account_number: string;
        account_name: string;
        bank_id: number;
      };
    }>(
      `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
    );
    return response.data;
  }

  /**
   * Create transfer recipient
   */
  async createRecipient(
    type: 'nuban' | 'authorization',
    name: string,
    accountNumber?: string,
    bankCode?: string,
    authorizationCode?: string,
  ): Promise<{
    status: boolean;
    message: string;
    data: {
      recipient_code: string;
      type: string;
      name: string;
      description: string;
      account_number: string;
      bank_code: string;
      bank_name: string;
    };
  }> {
    const payload: any = {
      type,
      name,
    };

    if (type === 'nuban' && accountNumber && bankCode) {
      payload.account_number = accountNumber;
      payload.bank_code = bankCode;
    } else if (type === 'authorization' && authorizationCode) {
      payload.authorization = authorizationCode;
    }

    const response = await this.makeRequest<{
      status: boolean;
      message: string;
      data: {
        recipient_code: string;
        type: string;
        name: string;
        description: string;
        account_number: string;
        bank_code: string;
        bank_name: string;
      };
    }>('/transferrecipient', 'POST', payload);
    return response.data;
  }

  /**
   * Initiate transfer
   */
  async initiateTransfer(
    source: 'balance' | string,
    amount: number,
    recipient: string,
    reason?: string,
  ): Promise<{
    status: boolean;
    message: string;
    data: {
      reference: string;
      transfer_code: string;
      amount: number;
      status: string;
      transfer_fee: number;
      recipient: {
        recipient_code: string;
        name: string;
        account_number: string;
        bank_code: string;
        bank_name: string;
      };
    };
  }> {
    const payload = {
      source,
      amount: amount * 100, // Convert to kobo
      recipient,
      reason,
    };

    const response = await this.makeRequest<{
      status: boolean;
      message: string;
      data: {
        reference: string;
        transfer_code: string;
        amount: number;
        status: string;
        transfer_fee: number;
        recipient: {
          recipient_code: string;
          name: string;
          account_number: string;
          bank_code: string;
          bank_name: string;
        };
      };
    }>('/transfer', 'POST', payload);
    return response.data;
  }

  /**
   * Verify transfer
   */
  async verifyTransfer(reference: string): Promise<{
    status: boolean;
    message: string;
    data: {
      reference: string;
      transfer_code: string;
      amount: number;
      status: string;
      transfer_fee: number;
      recipient: {
        recipient_code: string;
        name: string;
        account_number: string;
        bank_code: string;
        bank_name: string;
      };
      createdAt: string;
    };
  }> {
    const response = await this.makeRequest<{
      status: boolean;
      message: string;
      data: {
        reference: string;
        transfer_code: string;
        amount: number;
        status: string;
        transfer_fee: number;
        recipient: {
          recipient_code: string;
          name: string;
          account_number: string;
          bank_code: string;
          bank_name: string;
        };
        createdAt: string;
      };
    }>(`/transfer/verify/${reference}`);
    return response.data;
  }

  /**
   * Get transfer status
   */
  async getTransferStatus(reference: string): Promise<string> {
    try {
      const response = await this.verifyTransfer(reference);
      return response.data.status;
    } catch (error) {
      this.logger.error(`Failed to get transfer status: ${error.message}`);
      return 'unknown';
    }
  }

  /**
   * Fetch transfer
   */
  async fetchTransfer(transferCode: string): Promise<{
    status: boolean;
    message: string;
    data: {
      reference: string;
      transfer_code: string;
      amount: number;
      status: string;
      transfer_fee: number;
      recipient: {
        recipient_code: string;
        name: string;
        account_number: string;
        bank_code: string;
        bank_name: string;
      };
      createdAt: string;
    };
  }> {
    const response = await this.makeRequest<{
      status: boolean;
      message: string;
      data: {
        reference: string;
        transfer_code: string;
        amount: number;
        status: string;
        transfer_fee: number;
        recipient: {
          recipient_code: string;
          name: string;
          account_number: string;
          bank_code: string;
          bank_name: string;
        };
        createdAt: string;
      };
    }>(`/transfer/${transferCode}`);
    return response.data;
  }
}
