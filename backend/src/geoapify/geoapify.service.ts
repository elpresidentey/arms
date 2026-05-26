import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface GeocodingResult {
  lat: number;
  lon: number;
  formatted: string;
  address: {
    name?: string;
    house_number?: string;
    street?: string;
    postcode?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

export interface ReverseGeocodingResult extends GeocodingResult {}

interface GeoapifyFeature {
  properties?: {
    lat?: number;
    lon?: number;
    formatted?: string;
    name?: string;
    housenumber?: string;
    street?: string;
    postcode?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

interface GeoapifyFeatureResponse {
  features?: GeoapifyFeature[];
}

@Injectable()
export class GeoapifyService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.geoapify.com/v1';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('GEOAPIFY_API_KEY');
  }

  async geocode(address: string): Promise<GeocodingResult> {
    const feature = await this.fetchFirstFeature('/geocode/search', {
      text: address,
      limit: '1',
    });

    return this.toGeocodingResult(feature);
  }

  async reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodingResult> {
    const feature = await this.fetchFirstFeature('/geocode/reverse', {
      lat: lat.toString(),
      lon: lon.toString(),
    });

    return this.toGeocodingResult(feature);
  }

  async autocompleteAddress(query: string, limit: number = 5): Promise<GeocodingResult[]> {
    this.ensureApiKey();

    const response = await firstValueFrom(
      this.httpService.get<GeoapifyFeatureResponse>(`${this.baseUrl}/geocode/autocomplete`, {
        params: {
          text: query,
          limit: limit.toString(),
          apiKey: this.apiKey,
        },
      }),
    );

    return (response.data.features || []).map((feature) => this.toGeocodingResult(feature));
  }

  async validateAddress(address: string): Promise<{
    isValid: boolean;
    formattedAddress?: string;
    coordinates?: { lat: number; lon: number };
    components?: GeocodingResult['address'];
  }> {
    try {
      const result = await this.geocode(address);
      return {
        isValid: true,
        formattedAddress: result.formatted,
        coordinates: { lat: result.lat, lon: result.lon },
        components: result.address,
      };
    } catch {
      return {
        isValid: false,
      };
    }
  }

  private async fetchFirstFeature(path: string, params: Record<string, string>) {
    this.ensureApiKey();

    const response = await firstValueFrom(
      this.httpService.get<GeoapifyFeatureResponse>(`${this.baseUrl}${path}`, {
        params: {
          ...params,
          apiKey: this.apiKey,
        },
      }),
    );

    const firstFeature = response.data.features?.[0];
    if (!firstFeature) {
      throw new BadRequestException('Address not found');
    }

    return firstFeature;
  }

  private toGeocodingResult(feature: GeoapifyFeature): GeocodingResult {
    const properties = feature.properties;
    if (properties?.lat == null || properties?.lon == null) {
      throw new BadRequestException('Geoapify response did not contain coordinates');
    }

    return {
      lat: properties.lat,
      lon: properties.lon,
      formatted: properties.formatted || '',
      address: {
        name: properties.name,
        house_number: properties.housenumber,
        street: properties.street,
        postcode: properties.postcode,
        city: properties.city,
        county: properties.county,
        state: properties.state,
        country: properties.country,
      },
    };
  }

  private ensureApiKey() {
    if (!this.apiKey || this.apiKey === 'your_geoapify_api_key_here') {
      throw new ServiceUnavailableException(
        'Geoapify API key is not configured. Add GEOAPIFY_API_KEY on the backend or VITE_GEOAPIFY_API_KEY on the frontend.',
      );
    }
  }
}
