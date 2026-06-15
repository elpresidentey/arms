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
import { RouteExecutionsService } from './route-executions.service';
import { 
  CreateRouteExecutionDto, 
  UpdateRouteExecutionDto, 
  StartRouteDto, 
  CompleteRouteDto,
  ReportIssueDto 
} from './dto/route-execution.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ExecutionStatus } from './entities/route-execution.entity';

@Controller('route-executions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RouteExecutionsController {
  constructor(private readonly routeExecutionsService: RouteExecutionsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.DISPATCHER)
  create(@Body() createDto: CreateRouteExecutionDto) {
    return this.routeExecutionsService.create(createDto);
  }

  @Get()
  findAll(
    @Query('driverId') driverId?: string,
    @Query('vehicleId') vehicleId?: string,
    @Query('routeId') routeId?: string,
    @Query('status') status?: ExecutionStatus,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filters: any = {};
    
    if (driverId) filters.driverId = driverId;
    if (vehicleId) filters.vehicleId = vehicleId;
    if (routeId) filters.routeId = routeId;
    if (status) filters.status = status;
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);

    return this.routeExecutionsService.findAll(filters);
  }

  @Get('today')
  getTodaysExecutions() {
    return this.routeExecutionsService.getTodaysExecutions();
  }

  @Get('performance')
  getPerformanceMetrics(
    @Query('driverId') driverId?: string,
    @Query('vehicleId') vehicleId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filters: any = {};
    
    if (driverId) filters.driverId = driverId;
    if (vehicleId) filters.vehicleId = vehicleId;
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);

    return this.routeExecutionsService.getPerformanceMetrics(filters);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.routeExecutionsService.findById(id);
  }

  @Post(':id/start')
  @Roles(UserRole.PSP_OPERATOR, UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.DISPATCHER)
  startRoute(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() startData: StartRouteDto,
  ) {
    return this.routeExecutionsService.startRoute(id, startData);
  }

  @Post(':id/complete')
  @Roles(UserRole.PSP_OPERATOR, UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.DISPATCHER)
  completeRoute(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() completionData: CompleteRouteDto,
  ) {
    return this.routeExecutionsService.completeRoute(id, completionData);
  }

  @Post(':id/report-issue')
  @Roles(UserRole.PSP_OPERATOR, UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.DISPATCHER)
  reportIssue(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() issueData: ReportIssueDto,
  ) {
    return this.routeExecutionsService.reportIssue(id, issueData.issue, issueData.delayMinutes);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.DISPATCHER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateRouteExecutionDto,
  ) {
    return this.routeExecutionsService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.routeExecutionsService.delete(id);
  }
}