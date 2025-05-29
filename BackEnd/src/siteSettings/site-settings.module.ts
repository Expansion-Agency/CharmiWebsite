// src/site-settings/site-settings.module.ts
import { Module } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service';
import { SiteSettingsController } from './site-settings.controller';
import { PrismaService } from 'src/shared/prisma/prisma.service';
@Module({
  controllers: [SiteSettingsController],
  providers: [SiteSettingsService, PrismaService],
  exports: [SiteSettingsService],
})
export class SiteSettingsModule {}
