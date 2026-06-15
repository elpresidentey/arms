import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto, ScheduleMaintenanceDto } from './dto/vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.DISPATCHER)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  findAll(@Query('includeRetired') includeRetired?: string) {
    return this.vehiclesService.findAll(includeRetired === 'true');
  }

  @Get('fleet-summary')
  getFleetSummary() {
    return this.vehiclesService.getFleetSummary();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.findById(id);
  }

  @Get('code/:vehicleCode')
  findByCode(@Param('vehicleCode') vehicleCode: string) {
    return this.vehiclesService.findByVehicleCode(vehicleCode);
  }

  @Get(':id/current-driver')
  getCurrentDriver(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.getCurrentDriver(id);
  }

  @Get(':id/performance')
  getPerformanceStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.getPerformanceStats(id);
  }

  @Get(':id/maintenance')
  getMaintenanceHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.getMaintenanceHistory(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Patch(':id/location')
  updateLocation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() locationData: { 
      location: string; 
      latitude?: number; 
      longitude?: number; 
    },
  ) {
    return this.vehiclesService.updateLocation(
      id,
      locationData.location,
      locationData.latitude,
      locationData.longitude,
    );
  }

  @Post(':id/maintenance')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  scheduleMaintenance(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() maintenanceDto: ScheduleMaintenanceDto,
  ) {
    return this.vehiclesService.scheduleMaintenance(id, maintenanceDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.delete(id);
  }
}