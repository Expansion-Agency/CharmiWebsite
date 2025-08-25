import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

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
    console.log('Paymob API KEY:', this.apiKey); 
    this.integrationId = this.config.get<string>('PAYMOB_INTEGRATION_ID')!;
    this.iframeId = this.config.get<string>('PAYMOB_IFRAME_ID')!;
  }

  getIframeId() {
    return this.iframeId;
  }

  async createOrder(amount: number, billingData: any): Promise<string> {
    const authToken = await this.authenticate();
    const orderId = await this.createPaymobOrder(authToken, amount);
    const paymentToken = await this.generatePaymentKey(authToken, amount, billingData, orderId);
    return paymentToken;
  }

  private async authenticate(): Promise<string> {
    const { data } = await firstValueFrom(
      this.http.post('https://accept.paymob.com/api/auth/tokens', {
        api_key: this.apiKey,
      }),
    );
    return data.token;
  }

  private async createPaymobOrder(token: string, amount: number): Promise<number> {
    const { data } = await firstValueFrom(
      this.http.post('https://accept.paymob.com/api/ecommerce/orders', {
        auth_token: token,
        delivery_needed: false,
        amount_cents: amount,
        currency: 'EGP',
        items: [],
      }),
    );
    return data.id;
  }

  private async generatePaymentKey(
    token: string,
    amount: number,
    billingData: any,
    orderId: number,
  ): Promise<string> {
    const { data } = await firstValueFrom(
      this.http.post('https://accept.paymob.com/api/acceptance/payment_keys', {
        auth_token: token,
        amount_cents: amount,
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          apartment: billingData.apartment || 'NA',
          email: billingData.email,
          floor: billingData.floor || 'NA',
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
      }),
    );
    return data.token;
  }
}
