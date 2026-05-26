import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export type LocationCategory = 'bin' | 'collection_point';

export type LocationPoi = {
  id: string;
  osmType: 'node' | 'way' | 'relation' | 'curated';
  name: string;
  category: LocationCategory;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  address?: string;
  area?: string;
  capacity?: 'small' | 'medium' | 'large';
  acceptedWaste?: string[];
  liveStatus?: 'available' | 'near_capacity' | 'closed' | 'scheduled_pickup';
  tags?: Record<string, string>;
};

type OverpassElement = {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

@Injectable()
export class LocationsService {
  private readonly overpassUrl = 'https://overpass-api.de/api/interpreter';
  private readonly curatedLocations: Omit<LocationPoi, 'distanceMeters'>[] = [
    // Amuwo Odofin LGA locations
    {
      id: 'curated/festac-transfer-station',
      osmType: 'curated',
      name: 'Festac Town Transfer Station',
      category: 'collection_point',
      latitude: 6.4641,
      longitude: 3.2806,
      address: '2nd Avenue, Festac Town',
      area: 'Festac Town',
      capacity: 'large',
      acceptedWaste: ['Household waste', 'Bagged refuse', 'Recyclables', 'Bulk waste'],
      liveStatus: 'available',
    },
    {
      id: 'curated/festac-1st-gate-bin',
      osmType: 'curated',
      name: 'Festac 1st Gate Public Bin',
      category: 'bin',
      latitude: 6.4658,
      longitude: 3.2795,
      address: '1st Gate, Festac Town',
      area: 'Festac Town',
      capacity: 'medium',
      acceptedWaste: ['Bagged household waste', 'Small recyclables'],
      liveStatus: 'available',
    },
    {
      id: 'curated/festac-3rd-gate-bin',
      osmType: 'curated',
      name: 'Festac 3rd Gate Public Bin',
      category: 'bin',
      latitude: 6.4625,
      longitude: 3.2818,
      address: '3rd Gate, Festac Town',
      area: 'Festac Town',
      capacity: 'medium',
      acceptedWaste: ['Bagged household waste'],
      liveStatus: 'available',
    },
    {
      id: 'curated/apple-junction-bin',
      osmType: 'curated',
      name: 'Apple Junction Public Bin',
      category: 'bin',
      latitude: 6.4512,
      longitude: 3.2891,
      address: 'Apple Junction, Amuwo Odofin',
      area: 'Apple Junction',
      capacity: 'small',
      acceptedWaste: ['Bagged household waste'],
      liveStatus: 'near_capacity',
    },
    {
      id: 'curated/mile2-collection-point',
      osmType: 'curated',
      name: 'Mile 2 Collection Point',
      category: 'collection_point',
      latitude: 6.4425,
      longitude: 3.3065,
      address: 'Oshodi-Apapa Expressway, Mile 2',
      area: 'Mile 2',
      capacity: 'large',
      acceptedWaste: ['Household waste', 'Bagged refuse', 'Recyclables'],
      liveStatus: 'available',
    },
    {
      id: 'curated/trade-fair-bin',
      osmType: 'curated',
      name: 'Trade Fair Complex Bin',
      category: 'bin',
      latitude: 6.4589,
      longitude: 3.2952,
      address: 'Badagry Expressway, Trade Fair Complex',
      area: 'Trade Fair',
      capacity: 'medium',
      acceptedWaste: ['Bagged household waste', 'Small recyclables'],
      liveStatus: 'available',
    },
    {
      id: 'curated/kirikiri-bin',
      osmType: 'curated',
      name: 'Kirikiri Public Bin',
      category: 'bin',
      latitude: 6.4398,
      longitude: 3.3142,
      address: 'Kirikiri Road, Amuwo Odofin',
      area: 'Kirikiri',
      capacity: 'small',
      acceptedWaste: ['Bagged household waste'],
      liveStatus: 'scheduled_pickup',
    },
    {
      id: 'curated/satellite-town-bin',
      osmType: 'curated',
      name: 'Satellite Town Public Bin',
      category: 'bin',
      latitude: 6.4556,
      longitude: 3.3089,
      address: 'Satellite Town, Amuwo Odofin',
      area: 'Satellite Town',
      capacity: 'medium',
      acceptedWaste: ['Bagged household waste', 'Small recyclables'],
      liveStatus: 'available',
    },
    {
      id: 'curated/amuwo-recycling-center',
      osmType: 'curated',
      name: 'Amuwo Odofin Recycling Center',
      category: 'collection_point',
      latitude: 6.4478,
      longitude: 3.2945,
      address: 'Amuwo Odofin Housing Estate',
      area: 'Amuwo Odofin',
      capacity: 'medium',
      acceptedWaste: ['Plastic bottles', 'Paper', 'Cardboard', 'Cans', 'Glass bottles'],
      liveStatus: 'available',
    },
    {
      id: 'curated/amuwo-housing-estate-bin',
      osmType: 'curated',
      name: 'Amuwo Housing Estate Public Bin',
      category: 'bin',
      latitude: 6.4472,
      longitude: 3.2929,
      address: 'Amuwo Odofin Housing Estate',
      area: 'Amuwo Odofin',
      capacity: 'medium',
      acceptedWaste: ['Bagged household waste', 'Small recyclables'],
      liveStatus: 'available',
    },
    {
      id: 'curated/old-ojo-road-bin',
      osmType: 'curated',
      name: 'Old Ojo Road Public Bin',
      category: 'bin',
      latitude: 6.4595,
      longitude: 3.3035,
      address: 'Old Ojo Road, Amuwo Odofin',
      area: 'Old Ojo Road',
      capacity: 'medium',
      acceptedWaste: ['Bagged household waste'],
      liveStatus: 'available',
    },
    {
      id: 'curated/mazamaza-bin',
      osmType: 'curated',
      name: 'Mazamaza Public Bin',
      category: 'bin',
      latitude: 6.4629,
      longitude: 3.3102,
      address: 'Mazamaza, Amuwo Odofin',
      area: 'Mazamaza',
      capacity: 'medium',
      acceptedWaste: ['Bagged household waste', 'Small recyclables'],
      liveStatus: 'available',
    },
  ];

  constructor(private readonly httpService: HttpService) {}

  async findNearby(latitude: number, longitude: number, radiusMeters: number) {
    const query = this.buildOverpassQuery(latitude, longitude, radiusMeters);

    let externalPois: LocationPoi[] = [];
    try {
      const response = await firstValueFrom(
        this.httpService.post<OverpassResponse>(this.overpassUrl, query, {
          headers: {
            'Content-Type': 'text/plain',
          },
          timeout: 20000,
        }),
      );
      const elements = Array.isArray(response.data?.elements) ? response.data.elements : [];
      externalPois = elements
        .map((element) => this.toPoi(element, latitude, longitude))
        .filter((item): item is LocationPoi => Boolean(item));
    } catch {
      // Silently fail external API and rely on curated locations
      externalPois = [];
    }

    const curatedPois = this.curatedLocations
      .map((location) => ({
        ...location,
        distanceMeters: this.distanceMeters(latitude, longitude, location.latitude, location.longitude),
      }))
      .filter((location) => location.distanceMeters <= radiusMeters);

    const pois: LocationPoi[] = [...curatedPois, ...externalPois]
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, 50);

    return {
      center: { latitude, longitude },
      radiusMeters,
      results: pois,
    };
  }

  private buildOverpassQuery(latitude: number, longitude: number, radiusMeters: number) {
    const around = `around:${Math.round(radiusMeters)},${latitude},${longitude}`;

    const bin = [
      `node[amenity=waste_basket](${around});`,
      `node[amenity=waste_disposal](${around});`,
      `node[amenity=recycling](${around});`,
      `node[recycling_type](${around});`,
      `way[amenity=recycling](${around});`,
      `relation[amenity=recycling](${around});`,
    ].join('\n');

    const collectionPoint = [
      `node[amenity=waste_transfer_station](${around});`,
      `way[amenity=waste_transfer_station](${around});`,
      `relation[amenity=waste_transfer_station](${around});`,
      `node[amenity=recycling_centre](${around});`,
      `way[amenity=recycling_centre](${around});`,
      `relation[amenity=recycling_centre](${around});`,
    ].join('\n');

    return `[out:json][timeout:20];(\n${bin}\n${collectionPoint}\n);out center tags;`;
  }

  private toPoi(element: OverpassElement, originLat: number, originLon: number): LocationPoi | null {
    const coords = this.getElementCoordinates(element);
    if (!coords) return null;

    const tags = element.tags || {};
    const category = this.getCategory(tags);
    if (!category) return null;

    const name =
      tags.name ||
      tags.operator ||
      (category === 'collection_point' ? 'Collection point' : 'Bin location');

    const distanceMeters = this.distanceMeters(originLat, originLon, coords.lat, coords.lon);

    const addressParts = [tags['addr:street'], tags['addr:suburb'], tags['addr:city'], tags['addr:state']].filter(Boolean);
    const address = addressParts.length ? addressParts.join(', ') : undefined;

    return {
      id: `${element.type}/${element.id}`,
      osmType: element.type,
      name,
      category,
      latitude: coords.lat,
      longitude: coords.lon,
      distanceMeters,
      address,
      tags,
    };
  }

  private getElementCoordinates(element: OverpassElement) {
    if (typeof element.lat === 'number' && typeof element.lon === 'number') {
      return { lat: element.lat, lon: element.lon };
    }

    if (element.center && typeof element.center.lat === 'number' && typeof element.center.lon === 'number') {
      return { lat: element.center.lat, lon: element.center.lon };
    }

    return null;
  }

  private getCategory(tags: Record<string, string>): LocationCategory | null {
    const amenity = tags.amenity;

    if (amenity === 'waste_transfer_station' || amenity === 'recycling_centre') {
      return 'collection_point';
    }

    if (amenity === 'waste_basket' || amenity === 'waste_disposal' || amenity === 'recycling') {
      return 'bin';
    }

    if (tags.recycling_type) {
      return 'bin';
    }

    return null;
  }

  private distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371000;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(value: number) {
    return value * (Math.PI / 180);
  }
}
