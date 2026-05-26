import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { CreateServiceRequestDto, UpdateServiceRequestDto } from './dto/service-request.dto';
import { ServiceRequestsService } from './service-requests.service';
import { ServiceRequest } from './entities/service-request.entity';

@Controller('service-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceRequestsController {
  constructor(private readonly serviceRequestsService: ServiceRequestsService) {}

  @Get()
  findAll(@Request() req: { user: { userId: string; role: string } }) {
    if (req.user.role === 'resident') {
      return this.serviceRequestsService.findMine(req.user.userId);
    }

    return this.serviceRequestsService.findAll();
  }

  @Get('mine')
  findMine(@Request() req: { user: { userId: string; role: string } }) {
    if (req.user.role !== UserRole.RESIDENT) {
      throw new ForbiddenException('Only resident accounts can view personal refuse service requests');
    }

    return this.serviceRequestsService.findMine(req.user.userId);
  }

  @Get('summary')
  getSummary(@Request() req: { user: { userId: string; role: string } }) {
    return this.serviceRequestsService.getSummary(req.user.role === 'resident' ? req.user.userId : undefined);
  }

  @Post()
  create(@Body() body: CreateServiceRequestDto, @Request() req: { user: { userId: string; role: string } }) {
    if (req.user.role !== UserRole.RESIDENT) {
      throw new ForbiddenException('Only resident accounts can submit refuse service requests');
    }

    return this.serviceRequestsService.create({
      ...body,
      residentId: req.user.userId,
      preferredDate: body.preferredDate ? new Date(body.preferredDate) : undefined,
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateServiceRequestDto,
    @Request() req: { user: { userId: string; role: string } },
  ) {
    // Check if user is a resident
    if (req.user.role === UserRole.RESIDENT) {
      // Verify the resident owns this service request
      const request = await this.serviceRequestsService.findOne(id);
      if (request.residentId !== req.user.userId) {
        throw new ForbiddenException('You can only update your own service requests');
      }

      // Residents can only update certain fields
      const allowedFields: Partial<ServiceRequest> = {};
      
      // Allow status change only to CANCELLED
      if (body.status && body.status !== 'cancelled') {
        throw new ForbiddenException('Residents can only cancel their service requests');
      }
      if (body.status) allowedFields.status = body.status;
      
      // Allow updating description and preferredDate
      if (body.description !== undefined) allowedFields.description = body.description;
      if (body.preferredDate !== undefined) {
        allowedFields.preferredDate = new Date(body.preferredDate);
      }

      // Reject any other fields
      if (body.priority || body.assignedToId || body.scheduledFor || body.resolutionNotes) {
        throw new ForbiddenException('Residents cannot update administrative fields');
      }

      return this.serviceRequestsService.update(id, allowedFields);
    }

    // Staff members (admin, ward_officer, supervisor, dispatcher) can update all fields
    const staffRoles = [UserRole.ADMIN, UserRole.WARD_OFFICER, UserRole.SUPERVISOR, UserRole.DISPATCHER];
    if (!staffRoles.includes(req.user.role as UserRole)) {
      throw new ForbiddenException('You are not authorized to update service requests');
    }

    return this.serviceRequestsService.update(id, {
      ...body,
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : undefined,
      preferredDate: body.preferredDate ? new Date(body.preferredDate) : undefined,
    });
  }
}
