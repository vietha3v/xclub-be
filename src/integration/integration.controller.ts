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
  Req,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { IntegrationService } from './integration.service';
import { Integration, IntegrationType, IntegrationProvider } from './entities/integration.entity';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@ApiTags('🔗 Quản lý tích hợp')
@Controller('integrations')
@ApiBearerAuth('JWT-auth')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  /**
   * Lấy URL OAuth để kết nối với Strava
   */
  @Get('strava/authorize')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Lấy URL OAuth Strava',
    description: 'Lấy URL để người dùng kết nối với Strava'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'URL OAuth thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        authUrl: { type: 'string' },
        state: { type: 'string' }
      }
    }
  })
  async getStravaAuthUrl(@Request() req: any): Promise<{ success: boolean; authUrl: string; state: string }> {
    const userId = req.user.userId;
    return this.integrationService.getStravaAuthUrl(userId);
  }

  /**
   * Xử lý callback từ Strava OAuth
   */
  @Post('strava/callback')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xử lý callback OAuth Strava',
    description: 'Xử lý callback từ Strava sau khi người dùng authorize'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Kết nối thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        integration: { type: 'object' }
      }
    }
  })
  async handleStravaCallback(
    @Body() body: { code: string; state: string },
    @Request() req: any
  ): Promise<{ success: boolean; message: string; integration?: any }> {
    const userId = req.user.userId;
    return this.integrationService.handleStravaCallback(body.code, body.state, userId);
  }

  /**
   * Kiểm tra trạng thái kết nối Strava
   */
  @Get('strava/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Kiểm tra trạng thái kết nối Strava',
    description: 'Kiểm tra xem người dùng đã kết nối với Strava chưa'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trạng thái kết nối',
    schema: {
      type: 'object',
      properties: {
        connected: { type: 'boolean' },
        integration: { type: 'object' },
        tokenExpiry: { type: 'string' },
        error: { type: 'string' }
      }
    }
  })
  async getStravaStatus(@Request() req: any): Promise<{ connected: boolean; integration?: any; tokenExpiry?: Date; error?: string }> {
    const userId = req.user.userId;
    return this.integrationService.getStravaStatus(userId);
  }

  /**
   * Ngắt kết nối Strava
   */
  @Delete('strava/disconnect')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ngắt kết nối Strava',
    description: 'Ngắt kết nối tích hợp Strava của người dùng'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ngắt kết nối thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  async disconnectStrava(@Request() req: any): Promise<{ success: boolean; message: string }> {
    const userId = req.user.userId;
    return this.integrationService.disconnectStrava(userId);
  }
}