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
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ServiceSchedulesService } from './service-schedules.service';
import { CreateServiceScheduleDto } from './dto/create-service-schedule.dto';
import { UpdateServiceScheduleDto } from './dto/update-service-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('service-schedules')
export class ServiceSchedulesController {
  constructor(private readonly schedulesService: ServiceSchedulesService) {}

  /**
   * Create a new service schedule (staff only)
   * POST /service-schedules
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WARD_OFFICER, UserRole.SUPERVISOR, UserRole.DISPATCHER)
  async create(
    @Body() createScheduleDto: CreateServiceScheduleDto,
    @Request() req,
  ) {
    return this.schedulesService.create(createScheduleDto, req.user.id);
  }

  /**
   * Get all schedules (staff only)
   * GET /service-schedules
   * Query params: status, ward, serviceType
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WARD_OFFICER, UserRole.SUPERVISOR, UserRole.DISPATCHER, UserRole.PSP_OPERATOR)
  async findAll(
    @Query('status') status?: 'draft' | 'published' | 'archived' | 'suspended',
    @Query('ward') ward?: string,
    @Query('serviceType') serviceType?: string,
  ) {
    return this.schedulesService.findAll(status, ward, serviceType);
  }

  /**
   * Get published schedules (public - all users)
   * GET /service-schedules/published
   * Query params: ward, serviceType
   */
  @Get('published')
  async findPublished(
    @Query('ward') ward?: string,
    @Query('serviceType') serviceType?: string,
  ) {
    return this.schedulesService.findPublished(ward, serviceType);
  }

  /**
   * Get schedule statistics (staff only)
   * GET /service-schedules/stats
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WARD_OFFICER, UserRole.SUPERVISOR)
  async getStatistics() {
    return this.schedulesService.getStatistics();
  }

  /**
   * Get schedules by ward (public)
   * GET /service-schedules/ward/:ward
   */
  @Get('ward/:ward')
  async findByWard(
    @Param('ward') ward: string,
    @Query('published') published?: boolean,
  ) {
    return this.schedulesService.findByWard(ward, published === true);
  }

  /**
   * Get schedules by service type (public)
   * GET /service-schedules/type/:serviceType
   */
  @Get('type/:serviceType')
  async findByServiceType(
    @Param('serviceType') serviceType: string,
    @Query('published') published?: boolean,
  ) {
    return this.schedulesService.findByServiceType(serviceType, published === true);
  }

  /**
   * Get a single schedule by ID
   * GET /service-schedules/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(id);
  }

  /**
   * Update a service schedule (staff only)
   * PATCH /service-schedules/:id
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WARD_OFFICER, UserRole.SUPERVISOR)
  async update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateServiceScheduleDto,
  ) {
    return this.schedulesService.update(id, updateScheduleDto);
  }

  /**
   * Publish a schedule (make it visible to residents)
   * PATCH /service-schedules/:id/publish
   */
  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WARD_OFFICER, UserRole.SUPERVISOR)
  async publish(@Param('id') id: string, @Request() req) {
    return this.schedulesService.publish(id, req.user.id);
  }

  /**
   * Archive a schedule
   * PATCH /service-schedules/:id/archive
   */
  @Patch(':id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WARD_OFFICER, UserRole.SUPERVISOR)
  async archive(@Param('id') id: string) {
    return this.schedulesService.archive(id);
  }

  /**
   * Suspend a schedule (temporarily unavailable)
   * PATCH /service-schedules/:id/suspend
   */
  @Patch(':id/suspend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WARD_OFFICER, UserRole.SUPERVISOR)
  async suspend(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.schedulesService.suspend(id, reason);
  }

  /**
   * Delete a schedule (only draft schedules)
   * DELETE /service-schedules/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WARD_OFFICER, UserRole.SUPERVISOR)
  async remove(@Param('id') id: string) {
    await this.schedulesService.remove(id);
  }
}
