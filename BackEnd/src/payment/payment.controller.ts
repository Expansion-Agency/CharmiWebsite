import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  async initiatePayment(@Body() body: any) {
    const { amount, billing } = body;
    const token = await this.paymentService.createOrder(amount, billing);
    return {
      paymentPageUrl: `https://accept.paymob.com/api/acceptance/iframes/${this.paymentService.getIframeId()}?payment_token=${token}`,
    };
  }
}
