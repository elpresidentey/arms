import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { GeoapifyService, GeocodingResult, ReverseGeocodingResult } from './geoapify.service';

@Controller('geoapify')
export class GeoapifyController {
  constructor(private readonly geoapifyService: GeoapifyService) {}

  @Get('geocode')
  async geocode(@Query('address') address: string): Promise<GeocodingResult> {
    if (!address) {
      throw new BadRequestException('Address query parameter is required');
    }
    return this.geoapifyService.geocode(address);
  }

  @Get('reverse-geocode')
  async reverseGeocode(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
  ): Promise<ReverseGeocodingResult> {
    if (!lat || !lon) {
      throw new BadRequestException('Latitude and longitude query parameters are required');
    }
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new BadRequestException('Invalid latitude or longitude values');
    }
    
    return this.geoapifyService.reverseGeocode(latitude, longitude);
  }

  @Get('autocomplete')
  async autocomplete(
    @Query('query') query: string,
    @Query('limit') limit?: string,
  ): Promise<GeocodingResult[]> {
    if (!query) {
      throw new BadRequestException('Query parameter is required');
    }
    const limitNumber = limit ? parseInt(limit, 10) : 5;
    return this.geoapifyService.autocompleteAddress(query, limitNumber);
  }

  @Get('validate')
  async validate(@Query('address') address: string) {
    if (!address) {
      throw new BadRequestException('Address query parameter is required');
    }
    return this.geoapifyService.validateAddress(address);
  }
}
