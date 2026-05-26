import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LocationsService } from './locations.service';

@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('nearby')
  async getNearby(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('radius') radius?: string,
  ) {
    if (!lat || !lon) {
      throw new BadRequestException('Latitude and longitude query parameters are required');
    }

    const latitude = Number(lat);
    const longitude = Number(lon);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      throw new BadRequestException('Invalid latitude or longitude values');
    }

    const radiusMeters = radius ? Number(radius) : 1500;
    if (Number.isNaN(radiusMeters) || radiusMeters <= 0 || radiusMeters > 20000) {
      throw new BadRequestException('Radius must be a number between 1 and 20000');
    }

    return this.locationsService.findNearby(latitude, longitude, radiusMeters);
  }
}
