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
import { DriversService } from './drivers.service';
import { CreateDriverDto, UpdateDriverDto, AssignVehicleDto, DriverQueryDto } from './dto/driver.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.DISPATCHER)
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  @Get()
  findAll(@Query() query: DriverQueryDto) {
    const includeInactive = query.includeInactive === 'true';
    return this.driversService.findAll(includeInactive);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.driversService.findById(id);
  }

  @Get('code/:driverCode')
  findByCode(@Param('driverCode') driverCode: string) {
    return this.driversService.findByDriverCode(driverCode);
  }

  @Get(':id/current-vehicle')
  getCurrentVehicle(@Param('id', ParseUUIDPipe) id: string) {
    return this.driversService.getCurrentVehicle(id);
  }

  @Get(':id/performance')
  getPerformanceStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.driversService.getPerformanceStats(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDriverDto: UpdateDriverDto,
  ) {
    return this.driversService.update(id, updateDriverDto);
  }

  @Post(':id/assign-vehicle')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.DISPATCHER)
  assignVehicle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignVehicleDto: AssignVehicleDto,
  ) {
    return this.driversService.assignVehicle(id, assignVehicleDto);
  }

  @Post(':id/unassign-vehicle')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.DISPATCHER)
  unassignVehicle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason?: string,
  ) {
    return this.driversService.unassignVehicle(id, reason);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.driversService.delete(id);
  }
}