// src/site-settings/site-settings.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service';

@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get('price-visibility')
  async getPriceVisibility() {
    const settings = await this.siteSettingsService.getSettings();
    return { hidePrices: settings?.hidePrices ?? false };
  }

  @Post('price-visibility')
  async updatePriceVisibility(@Body('hidePrices') hidePrices: boolean) {
    await this.siteSettingsService.updateHidePrices(hidePrices);
    return { success: true };
  }
}
