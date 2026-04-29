import {
  Controller, Get, Post, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto, RespondEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(
    @Param('familyId') familyId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateEventDto,
  ) {
    return this.eventsService.create(familyId, user.id, dto);
  }

  @Get()
  findAll(@Param('familyId') familyId: string) {
    return this.eventsService.findByFamily(familyId);
  }

  @Get('upcoming')
  upcoming(@Param('familyId') familyId: string) {
    return this.eventsService.getUpcoming(familyId);
  }

  @Get(':eventId')
  findOne(@Param('eventId') eventId: string) {
    return this.eventsService.findById(eventId);
  }

  @Post(':eventId/respond')
  respond(
    @Param('eventId') eventId: string,
    @CurrentUser() user: User,
    @Body() dto: RespondEventDto,
  ) {
    return this.eventsService.respond(eventId, user.id, dto);
  }

  @Delete(':eventId')
  delete(@Param('eventId') eventId: string) {
    return this.eventsService.delete(eventId);
  }
}
