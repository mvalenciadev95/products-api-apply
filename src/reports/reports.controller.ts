import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportFilterDto } from './dto/report-filter.dto';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('deleted-percentage')
  @ApiOperation({ summary: 'Get percentage of deleted products' })
  @ApiResponse({
    status: 200,
    description: 'Percentage of deleted products',
  })
  getDeletedPercentage() {
    return this.reportsService.getDeletedProductsPercentage();
  }

  @Get('non-deleted-with-price')
  @ApiOperation({
    summary:
      'Get percentage of non-deleted products with or without price (with optional date range)',
  })
  @ApiQuery({
    name: 'hasPrice',
    required: true,
    type: Boolean,
    description:
      'Filter by products with price (true) or without price (false)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for date range filter (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for date range filter (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Percentage of non-deleted products',
  })
  getNonDeletedWithPrice(
    @Query('hasPrice', ParseBoolPipe) hasPrice: boolean,
    @Query() filterDto: ReportFilterDto,
  ) {
    return this.reportsService.getNonDeletedProductsWithPricePercentage(
      hasPrice,
      filterDto.startDate,
      filterDto.endDate,
    );
  }

  @Get('category-distribution')
  @ApiOperation({
    summary: 'Get distribution of products by category (custom report)',
  })
  @ApiResponse({
    status: 200,
    description: 'Distribution of products by category',
  })
  getCategoryDistribution() {
    return this.reportsService.getCategoryDistribution();
  }
}
