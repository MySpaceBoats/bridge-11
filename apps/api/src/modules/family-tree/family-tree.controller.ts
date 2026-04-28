import {
  Controller, Get, Post, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FamilyTreeService } from './family-tree.service';
import { AddRelationDto } from './dto/tree.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('family-tree')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/tree')
export class FamilyTreeController {
  constructor(private readonly treeService: FamilyTreeService) {}

  @Get()
  getTree(@Param('familyId') familyId: string) {
    return this.treeService.getTree(familyId);
  }

  @Get('relations')
  getRelations(@Param('familyId') familyId: string) {
    return this.treeService.getRelations(familyId);
  }

  @Post('relations')
  addRelation(
    @Param('familyId') familyId: string,
    @Body() dto: AddRelationDto,
  ) {
    return this.treeService.addRelation(familyId, dto);
  }

  @Delete('relations/:relationId')
  removeRelation(
    @Param('familyId') familyId: string,
    @Param('relationId') relationId: string,
  ) {
    return this.treeService.removeRelation(familyId, relationId);
  }
}
