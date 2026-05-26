import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { CollectionRoutesService } from './collection-routes.service';
import {
  CompleteCollectionRouteDto,
  CreateCollectionRouteDto,
  UpdateCollectionRouteDto,
} from './dto/collection-route.dto';
import { ResidentCollectionConfirmationDto } from './dto/resident-collection.dto';

@Controller('collection-routes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CollectionRoutesController {
  constructor(private readonly collectionRoutesService: CollectionRoutesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PSP_OPERATOR, UserRole.WARD_OFFICER, UserRole.SUPERVISOR, UserRole.DISPATCHER)
  findAll() {
    return this.collectionRoutesService.findAll();
  }

  @Get('mine')
  findMine(@Request() req: { user: { userId: string } }) {
    return this.collectionRoutesService.findForResident(req.user.userId);
  }

  @Get('summary')
  getSummary(@Request() req: { user: { userId: string; role: string } }) {
    return this.collectionRoutesService.getSummary(
      req.user.role === UserRole.RESIDENT ? req.user.userId : undefined,
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PSP_OPERATOR, UserRole.WARD_OFFICER, UserRole.SUPERVISOR, UserRole.DISPATCHER)
  findOne(@Param('id') id: string) {
    return this.collectionRoutesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PSP_OPERATOR, UserRole.WARD_OFFICER, UserRole.SUPERVISOR, UserRole.DISPATCHER)
  create(@Body() body: CreateCollectionRouteDto) {
    return this.collectionRoutesService.create({
      ...body,
      nextCollectionDate: new Date(body.nextCollectionDate),
    });
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PSP_OPERATOR, UserRole.WARD_OFFICER, UserRole.SUPERVISOR, UserRole.DISPATCHER)
  update(@Param('id') id: string, @Body() body: UpdateCollectionRouteDto) {
    return this.collectionRoutesService.update(id, {
      ...body,
      nextCollectionDate: body.nextCollectionDate ? new Date(body.nextCollectionDate) : undefined,
    });
  }

  @Patch(':id/complete')
  @Roles(UserRole.ADMIN, UserRole.PSP_OPERATOR, UserRole.WARD_OFFICER, UserRole.SUPERVISOR, UserRole.DISPATCHER)
  completeRoute(@Param('id') id: string, @Body() body: CompleteCollectionRouteDto) {
    return this.collectionRoutesService.completeRoute(id, body.completedAt, body.notes);
  }

  @Patch(':id/resident-confirm')
  residentConfirm(
    @Param('id') id: string,
    @Body() body: ResidentCollectionConfirmationDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.collectionRoutesService.confirmResidentCollection(
      id,
      req.user.userId,
      body.observedTruckCode,
    );
  }
}
