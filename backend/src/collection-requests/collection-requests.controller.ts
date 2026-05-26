import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { CollectionRequestsService } from './collection-requests.service';
import { CollectionRequestType, CollectionRequestStatus } from './entities/collection-request.entity';

@Controller('collection-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CollectionRequestsController {
  constructor(private readonly service: CollectionRequestsService) {}

  // Resident creates request
  @Post()
  create(
    @Body()
    body: {
      type: CollectionRequestType;
      preferredDate?: string;
      description?: string;
    },
    @Request() req: { user: { userId: string; role: string } },
  ) {
    if (req.user.role !== UserRole.RESIDENT) {
      throw new ForbiddenException('Only residents can create collection requests');
    }

    return this.service.createRequest(req.user.userId, {
      type: body.type,
      preferredDate: body.preferredDate ? new Date(body.preferredDate) : undefined,
      description: body.description,
    });
  }

  // Resident views their requests
  @Get('my-requests')
  getMyRequests(@Request() req: { user: { userId: string; role: string } }) {
    if (req.user.role !== UserRole.RESIDENT) {
      throw new ForbiddenException('Only residents can view their requests');
    }
    return this.service.getMyRequests(req.user.userId);
  }

  // Admin views all requests with optional filtering
  @Get()
  @Roles(UserRole.ADMIN, UserRole.PSP_OPERATOR, UserRole.WARD_OFFICER)
  getAllRequests(@Query('status') status?: CollectionRequestStatus) {
    return this.service.getAllRequests(status);
  }

  // Get statistics
  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.PSP_OPERATOR, UserRole.WARD_OFFICER)
  getStatistics() {
    return this.service.getStatistics();
  }

  // Get single request
  @Get(':id')
  getOne(
    @Param('id') id: string,
    @Request() req: { user: { userId: string; role: string } },
  ) {
    return this.service.getOneForUser(id, req.user.userId, req.user.role);
  }

  // Admin schedules request
  @Patch(':id/schedule')
  @Roles(UserRole.ADMIN, UserRole.PSP_OPERATOR, UserRole.WARD_OFFICER)
  scheduleRequest(
    @Param('id') id: string,
    @Body() body: { routeId: string; scheduledDate: string },
  ) {
    return this.service.scheduleRequest(id, body.routeId, new Date(body.scheduledDate));
  }

  // Admin marks as completed
  @Patch(':id/complete')
  @Roles(UserRole.ADMIN, UserRole.PSP_OPERATOR, UserRole.WARD_OFFICER)
  completeRequest(@Param('id') id: string) {
    return this.service.completeRequest(id);
  }

  // Cancel request
  @Patch(':id/cancel')
  cancelRequest(
    @Param('id') id: string,
    @Request() req: { user: { userId: string; role: string } },
  ) {
    return this.service.cancelRequest(id, req.user.userId, req.user.role);
  }
}
