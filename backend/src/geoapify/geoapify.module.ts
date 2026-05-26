import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GeoapifyService } from './geoapify.service';
import { GeoapifyController } from './geoapify.controller';

@Module({
  imports: [HttpModule],
  providers: [GeoapifyService],
  controllers: [GeoapifyController],
  exports: [GeoapifyService],
})
export class GeoapifyModule {}
