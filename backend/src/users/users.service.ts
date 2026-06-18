import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { GeoapifyService } from '../geoapify/geoapify.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private geoapifyService: GeoapifyService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      order: { createdAt: 'DESC' },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt'],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAdminByRole(): Promise<User | null> {
    return this.usersRepository.findOne({ where: { role: UserRole.ADMIN } });
  }

  async create(data: Partial<User>): Promise<User> {
    let latitude = data.latitude ?? null;
    let longitude = data.longitude ?? null;
    const ward = data.ward?.trim() || 'Unassigned';
    
    if ((latitude === null || longitude === null) && data.address) {
      try {
        const fullAddress = `${data.address}, ${data.houseNumber}, ${data.street}, ${ward}`;
        const geocodingResult = await this.geoapifyService.geocode(fullAddress);
        latitude = geocodingResult.lat;
        longitude = geocodingResult.lon;
      } catch (error) {
        // Continue without coordinates if geocoding fails
        console.warn('Geocoding failed:', error.message);
      }
    }

    const user = this.usersRepository.create({
      ...data,
      ward,
      latitude,
      longitude,
      role: data.role || UserRole.RESIDENT,
      isActive: data.isActive ?? true,
    });
    return this.usersRepository.save(user);
  }

  async updateProfile(
    userId: string,
    updateData: { street?: string; ward?: string; houseNumber?: string; landmark?: string; propertyType?: string },
  ): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Update the user with new data
    Object.assign(user, updateData);
    
    // Update coordinates if address changed
    if (updateData.street || updateData.houseNumber || updateData.ward) {
      try {
        const fullAddress = `${user.address}, ${updateData.houseNumber || user.houseNumber}, ${updateData.street || user.street}, ${updateData.ward || user.ward}`;
        const geocodingResult = await this.geoapifyService.geocode(fullAddress);
        user.latitude = geocodingResult.lat;
        user.longitude = geocodingResult.lon;
      } catch (error) {
        // Continue without coordinates if geocoding fails
        console.warn('Geocoding failed:', error.message);
      }
    }

    return this.usersRepository.save(user);
  }

  async updateBankDetails(
    userId: string,
    bankData: {
      bankCode: string;
      accountNumber: string;
      accountName: string;
      paystackRecipientCode?: string;
    },
  ): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Update bank details
    user.bankCode = bankData.bankCode;
    user.accountNumber = bankData.accountNumber;
    user.accountName = bankData.accountName;
    user.paystackRecipientCode = bankData.paystackRecipientCode || user.paystackRecipientCode;
    user.isBankVerified = !!bankData.paystackRecipientCode;

    return this.usersRepository.save(user);
  }

  async verifyBankDetails(
    userId: string,
    accountNumber: string,
    bankCode: string,
    paystackRecipientCode: string,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.accountNumber = accountNumber;
    user.bankCode = bankCode;
    user.paystackRecipientCode = paystackRecipientCode;
    user.isBankVerified = true;

    return this.usersRepository.save(user);
  }
}
