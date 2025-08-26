import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  async initiatePayment(@Body() body: any) {
    const { amount, billing } = body;
    const paymentToken = await this.paymentService.createOrder(amount, billing);
    const iframeId = this.paymentService.getIframeId();

    return {
      iframeId,
      paymentToken,
      paymentPageUrl: `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`, // optional
    };
  }
}
