import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class PaymentService {
  private readonly apiKey: string;
  private readonly integrationId: string;
  private readonly iframeId: string;
  private readonly logger = new Logger(PaymentService.name);

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
      this.logger.log(`Creating payment order for amount: ${amount}`);

      const authToken = await this.authenticate();
      this.logger.log(`✅ Got Auth Token: ${authToken.substring(0, 10)}...`);

      const orderId = await this.createPaymobOrder(authToken, amount);
      this.logger.log(`✅ Paymob Order Created: ID = ${orderId}`);

      const paymentToken = await this.generatePaymentKey(
        authToken,
        amount,
        billingData,
        orderId,
      );
      this.logger.log(
        `✅ Payment Key Generated: ${paymentToken.substring(0, 10)}...`,
      );

      return paymentToken;
    } catch (error) {
      this.logger.error('❌ Payment creation failed');
      if (error.response) {
        // 🔎 Log full error details
        this.logger.error(
          `Paymob API Error (status ${error.response.status}): ${JSON.stringify(
            error.response.data,
            null,
            2,
          )}`,
        );
      } else {
        this.logger.error(`Unexpected Error: ${error.message}`);
      }

      throw new InternalServerErrorException('Failed to initiate payment');
    }
  }

  private async authenticate(): Promise<string> {
    this.logger.log('🔑 Requesting Paymob Auth Token...');
    const { data }: AxiosResponse<any> = await firstValueFrom(
      this.http.post('https://accept.paymob.com/api/auth/tokens', {
        api_key: this.apiKey,
      }),
    );
    return data.token;
  }

  private async createPaymobOrder(
    token: string,
    amount: number,
  ): Promise<number> {
    this.logger.log(`📦 Creating Paymob Order with amount: ${amount}`);
    const { data }: AxiosResponse<any> = await firstValueFrom(
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
    const payload = {
      auth_token: token,
      amount_cents: amount,
      expiration: 3600,
      order_id: orderId,
      billing_data: {
        apartment: billingData.apartment || 'NA',
        email: billingData.email,
        floor: billingData.floor || 'NA',
        building: billingData.building || 'NA',
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
    };

    this.logger.debug(
      `📤 Sending payload to Paymob:\n${JSON.stringify(payload, null, 2)}`,
    );

    const { data }: AxiosResponse<any> = await firstValueFrom(
      this.http.post(
        'https://accept.paymob.com/api/acceptance/payment_keys',
        payload,
      ),
    );

    return data.token;
  }
}
