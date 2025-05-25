import { Injectable } from '@nestjs/common';
import prisma from './shared/prisma/client';
import countriesData from './data/countries.json';
import citiesData from './data/cities.json';
import * as bcrypt from 'bcrypt';

interface CountryData {
  id: number;
  governorate_name_en: string;
}

interface DistrictData {
  districtId: string;
  zoneId: string;
  zoneName: string;
  zoneOtherName: string;
  districtName: string;
  districtOtherName: string;
  pickupAvailability: boolean;
  dropOffAvailability: boolean;
}

interface CityData {
  id: number;
  cityName: string;
  cityCode: string;
  districts: DistrictData[];
}

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.seedData();
    } catch (error) {
      console.error('Error during app bootstrap:', error);
    }
  }

  private async seedData(): Promise<void> {
    try {
      await this.seedCountries();
      await this.seedCities();
      await this.seedSuperAdmin();
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  }

  private async seedSuperAdmin(): Promise<void> {
    try {
      const Admins = await prisma.admins.findFirst();
      if (!Admins) {
        const hashedPassword = await bcrypt.hash(
          process.env.ADMIN_PASSWORD || '',
          10,
        );
        await prisma.admins.create({
          data: {
            email: process.env.ADMIN_MAIL || '',
            password: hashedPassword || '',
          },
        });
      }
    } catch (error) {
      console.error(
        'Error seeding super admin:',
        JSON.stringify(error, null, 2),
      );
    }
  }

  private async seedCountries(): Promise<void> {
    try {
      const countries = await prisma.countries.findFirst();

      if (!countries) {
        const typedCountriesData = countriesData as CountryData[];

        await Promise.all(
          typedCountriesData.map(async (country) => {
            await prisma.countries.create({
              data: {
                id: country.id,
                name: country.governorate_name_en,
              },
            });
          }),
        );
      }
    } catch (error) {
      console.error('Error seeding countries:', JSON.stringify(error, null, 2));
    }
  }

  private async seedCities(): Promise<void> {
    try {
      const cities = await prisma.cities.findFirst();

      if (!cities) {
        const typedCitiesData = citiesData as CityData[];

        await Promise.all(
          typedCitiesData.map(async (city) => {
            await prisma.cities.create({
              data: {
                id: city.id,
                name: city.cityName,
                code: city.cityCode,
                countryId: 1,
                Districts: {
                  createMany: {
                    data: city.districts.map((district) => ({
                      district_id: district.districtId,
                      zoneId: district.zoneId,
                      zoneName: district.zoneName,
                      zoneOtherName: district.zoneOtherName,
                      districtName: district.districtName,
                      districtOtherName: district.districtOtherName,
                      pickupAvailability: district.pickupAvailability,
                      dropOffAvailability: district.dropOffAvailability,
                    })),
                  },
                },
              },
            });
          }),
        );
      }
    } catch (error) {
      console.error('Error seeding countries:', error);
    }
  }
}
