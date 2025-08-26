import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class PaymentService {
  private readonly apiKey: string;
  private readonly integrationId: string;
  private readonly iframeId: string;

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {
    this.apiKey = this.config.get<string>('PAYMOB_API_KEY')!;
    this.integrationId = this.config.get<string>('PAYMOB_INTEGRATION_ID')!;
    this.iframeId = this.config.get<string>('PAYMOB_IFRAME_ID')!;
  }

  getIframeId() {
    return this.iframeId;
  }

  async createOrder(amount: number, billingData: any): Promise<string> {
    try {
      const authToken = await this.authenticate();
      const orderId = await this.createPaymobOrder(authToken, amount);
      const paymentToken = await this.generatePaymentKey(authToken, amount, billingData, orderId);
      return paymentToken;
    } catch (error) {
      console.error('Payment creation failed:', error);
      throw new InternalServerErrorException('Failed to initiate payment');
    }
  }

  private async authenticate(): Promise<string> {
    const { data }: AxiosResponse<any> = await firstValueFrom(
      this.http.post(
        'https://accept.paymob.com/api/auth/tokens',
        { api_key: this.apiKey },
        { timeout: 10000 }, // Optional timeout
      ),
    );
    return data.token;
  }

  private async createPaymobOrder(token: string, amount: number): Promise<number> {
    const { data }: AxiosResponse<any> = await firstValueFrom(
      this.http.post(
        'https://accept.paymob.com/api/ecommerce/orders',
        {
          auth_token: token,
          delivery_needed: false,
          amount_cents: amount,
          currency: 'EGP',
          items: [],
        },
        { timeout: 10000 }, // Optional timeout
      ),
    );
    return data.id;
  }

  private async generatePaymentKey(
  token: string,
  amount: number,
  billingData: any,
  orderId: number,
): Promise<string> {
  const { data }: AxiosResponse<any> = await firstValueFrom(
    this.http.post(
      'https://accept.paymob.com/api/acceptance/payment_keys',
      {
        auth_token: token,
        amount_cents: amount,
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          apartment: billingData.apartment || 'NA',
          email: billingData.email,
          floor: billingData.floor || 'NA',
          building: billingData.building || 'NA', // ✅ REQUIRED by Paymob
          first_name: billingData.first_name,
          last_name: billingData.last_name,
          phone_number: billingData.phone_number,
          shipping_method: billingData.shipping_method || 'PKG',
          postal_code: billingData.postal_code || 'NA',
          city: billingData.city,
          country: billingData.country || 'EG',
          state: billingData.state,
          street: billingData.street,
        },
        currency: 'EGP',
        integration_id: Number(this.integrationId),
      },
      { timeout: 10000 },
    ),
  );
  return data.token;
}}
