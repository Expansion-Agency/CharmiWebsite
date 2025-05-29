// src/site-settings/site-settings.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { SiteSettings } from '@prisma/client';

@Injectable()
export class SiteSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(): Promise<SiteSettings | null> {
    return this.prisma.siteSettings.findFirst();
  }

  async updateHidePrices(hidePrices: boolean): Promise<SiteSettings> {
    const existing = await this.prisma.siteSettings.findFirst();

    if (!existing) {
      return this.prisma.siteSettings.create({
        data: { hidePrices },
      });
    }

    return this.prisma.siteSettings.update({
      where: { id: existing.id },
      data: { hidePrices },
    });
  }
}
