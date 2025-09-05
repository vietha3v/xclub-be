import { Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Integration, IntegrationProvider, IntegrationType, IntegrationStatus } from './entities/integration.entity';
import { UserIntegration, UserIntegrationSyncStatus } from './entities/user-integration.entity';
import { UserService } from '../user/user.service';
import { ClubService } from '../club/club.service';
import { ActivityService } from '../activity/activity.service';
import * as crypto from 'crypto';

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);
  private readonly stravaClientId: string | undefined;
  private readonly stravaClientSecret: string | undefined;
  private readonly stravaRedirectUri: string | undefined;

  constructor(
    @InjectRepository(Integration)
    private readonly integrationRepository: Repository<Integration>,
    @InjectRepository(UserIntegration)
    private readonly userIntegrationRepository: Repository<UserIntegration>,
    private readonly userService: UserService,
    private readonly clubService: ClubService,
    private readonly activityService: ActivityService,
    private readonly configService: ConfigService,
  ) {
    this.stravaClientId = this.configService.get<string>('STRAVA_CLIENT_ID');
    this.stravaClientSecret = this.configService.get<string>('STRAVA_CLIENT_SECRET');
    this.stravaRedirectUri = this.configService.get<string>('STRAVA_REDIRECT_URI');
    
    // Log để debug
    this.logger.log(`Strava config: CLIENT_ID=${!!this.stravaClientId}, CLIENT_SECRET=${!!this.stravaClientSecret}, REDIRECT_URI=${this.stravaRedirectUri}`);
  }

  /**
   * Lấy URL OAuth để kết nối với Strava
   */
  async getStravaAuthUrl(userId: string): Promise<{ success: boolean; authUrl: string; state: string }> {
    try {

      const state = crypto.randomBytes(32).toString('hex');
      const stateWithUserId = `${state}:${userId}`;

      const strava = require('strava-v3');
      strava.config({
        client_id: this.stravaClientId,
        client_secret: this.stravaClientSecret,
        redirect_uri: this.stravaRedirectUri,
      });

      const authUrl = strava.oauth.getRequestAccessURL({
        scope: 'read,activity:read_all',
        state: stateWithUserId
      });

      return {
        success: true,
        authUrl,
        state: stateWithUserId
      };
    } catch (error) {
      this.logger.error(`Lỗi tạo OAuth URL: ${error.message}`);
      throw new InternalServerErrorException('Không thể tạo URL OAuth');
    }
  }

  /**
   * Xử lý callback từ Strava OAuth
   */
  async handleStravaCallback(code: string, state: string, userId: string): Promise<{ success: boolean; message: string; integration?: any }> {
    try {
      const [stateParam, stateUserId] = state.split(':');
      if (stateUserId !== userId) {
        throw new BadRequestException('Invalid state parameter');
      }

      const strava = require('strava-v3');
      const tokenResponse = await strava.oauth.getToken(code);

      let integration = await this.integrationRepository.findOne({
        where: { provider: IntegrationProvider.STRAVA }
      });

      if (!integration) {
        integration = await this.createStravaIntegration();
      }

      this.logger.log(`Integration ID: ${integration.id}, UserId: ${userId}`);

      let userIntegration = await this.userIntegrationRepository.findOne({
        where: {
          userId,
          integration: { provider: IntegrationProvider.STRAVA }
        },
        relations: ['integration']
      });

      if (userIntegration) {
        userIntegration.accessToken = tokenResponse.access_token;
        userIntegration.refreshToken = tokenResponse.refresh_token;
        userIntegration.tokenExpiry = new Date(Date.now() + tokenResponse.expires_in * 1000);
        userIntegration.syncStatus = UserIntegrationSyncStatus.ACTIVE;
        userIntegration.lastSyncedAt = new Date();
      } else {
        userIntegration = this.userIntegrationRepository.create({
          userId,
          integrationId: integration.id,
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          tokenExpiry: new Date(Date.now() + tokenResponse.expires_in * 1000),
          syncStatus: UserIntegrationSyncStatus.ACTIVE,
          lastSyncedAt: new Date(),
          settings: {
            scope: 'read,activity:read_all',
            connectedAt: new Date()
          }
        });
      }

      await this.userIntegrationRepository.save(userIntegration);

      return {
        success: true,
        message: 'Kết nối Strava thành công',
        integration: {
          id: userIntegration.id,
          provider: 'strava',
          status: userIntegration.syncStatus,
          connectedAt: userIntegration.lastSyncedAt
        }
      };
    } catch (error) {
      this.logger.error(`Lỗi xử lý OAuth callback: ${error.message}`);
      throw new InternalServerErrorException(`Lỗi kết nối Strava: ${error.message}`);
    }
  }

  /**
   * Tạo integration cho Strava
   */
  private async createStravaIntegration(): Promise<Integration> {
    const integration = this.integrationRepository.create({
      integrationCode: 'strava',
      name: 'Strava',
      description: 'Tích hợp với Strava để đồng bộ hoạt động chạy bộ',
      provider: IntegrationProvider.STRAVA,
      type: IntegrationType.FITNESS_PLATFORM,
      status: IntegrationStatus.ACTIVE,
      createdBy: 'system', // Set createdBy để tránh lỗi null constraint
      configuration: {
        clientId: this.stravaClientId,
        redirectUri: this.stravaRedirectUri,
        scope: 'read,activity:read_all'
      },
      settings: {
        autoSync: true,
        syncInterval: 3600,
        maxActivities: 1000
      }
    });

    return await this.integrationRepository.save(integration);
  }

  /**
   * Kiểm tra trạng thái kết nối Strava
   */
  async getStravaStatus(userId: string): Promise<{ connected: boolean; integration?: any; tokenExpiry?: Date; error?: string }> {
    try {
      const userIntegration = await this.userIntegrationRepository.findOne({
        where: {
          userId,
          integration: { provider: IntegrationProvider.STRAVA }
        },
        relations: ['integration']
      });

      if (!userIntegration) {
        return {
          connected: false,
          error: 'Chưa kết nối với Strava'
        };
      }

      const isExpired = userIntegration.tokenExpiry && userIntegration.tokenExpiry < new Date();

      return {
        connected: !isExpired,
        integration: {
          id: userIntegration.id,
          provider: 'strava',
          status: userIntegration.syncStatus,
          connectedAt: userIntegration.lastSyncedAt
        },
        tokenExpiry: userIntegration.tokenExpiry,
        error: isExpired ? 'Token đã hết hạn' : undefined
      };
    } catch (error) {
      this.logger.error(`Lỗi kiểm tra trạng thái Strava: ${error.message}`);
      return {
        connected: false,
        error: 'Lỗi kiểm tra trạng thái kết nối'
      };
    }
  }

  /**
   * Ngắt kết nối Strava
   */
  async disconnectStrava(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`Ngắt kết nối Strava cho user: ${userId}`);

      // Tìm user integration
      const userIntegration = await this.userIntegrationRepository.findOne({
        where: {
          userId,
          integration: { provider: IntegrationProvider.STRAVA }
        },
        relations: ['integration']
      });

      if (!userIntegration) {
        throw new BadRequestException('Người dùng chưa kết nối với Strava');
      }

      // Xóa user integration record
      await this.userIntegrationRepository.remove(userIntegration);

      this.logger.log(`Đã ngắt kết nối Strava cho user: ${userId}`);

      return {
        success: true,
        message: 'Đã ngắt kết nối Strava thành công'
      };
    } catch (error) {
      this.logger.error(`Lỗi ngắt kết nối Strava: ${error.message}`);
      throw new InternalServerErrorException(`Lỗi ngắt kết nối Strava: ${error.message}`);
    }
  }
}