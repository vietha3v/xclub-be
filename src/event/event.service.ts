import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Event, EventStatus, EventVisibility } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';
import { ClubPermissionService } from '../club/services/club-permission.service';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { createPaginatedResult, getPaginationParams } from '../common/utils/pagination.util';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    private clubPermissionService: ClubPermissionService,
  ) {}

  /**
   * Tạo sự kiện mới
   */
  async create(createEventDto: CreateEventDto, creatorUserId: string): Promise<Event> {
    // Kiểm tra quyền tạo Event trong CLB
    if (createEventDto.clubId) {
      await this.clubPermissionService.requireCreateActivityPermission(
        createEventDto.clubId, 
        creatorUserId, 
        'event'
      );
    }

    // Tạo mã sự kiện tự động
    const eventCode = await this.generateEventCode();

    const event = this.eventRepository.create({
      ...createEventDto,
      eventCode,
      status: EventStatus.UPCOMING,
      visibility: createEventDto.visibility || EventVisibility.CLUB_ONLY,
      startDate: new Date(createEventDto.startDate),
      endDate: createEventDto.endDate ? new Date(createEventDto.endDate) : undefined,
      registrationStartDate: createEventDto.registrationStartDate ? new Date(createEventDto.registrationStartDate) : undefined,
      registrationEndDate: createEventDto.registrationEndDate ? new Date(createEventDto.registrationEndDate) : undefined,
    });

    return this.eventRepository.save(event);
  }

  /**
   * Tìm tất cả sự kiện
   */
  async findAll(queryDto: QueryEventDto): Promise<PaginatedResult<Event>> {
    const queryBuilder = this.buildQueryBuilder(queryDto);
    const { page, limit, skip } = getPaginationParams(queryDto.page, queryDto.limit);
    
    queryBuilder.skip(skip).take(limit);
    const [events, total] = await queryBuilder.getManyAndCount();
    
    return createPaginatedResult(events, total, page, limit);
  }

  /**
   * Tìm sự kiện theo ID
   */
  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({ 
      where: { id, isDeleted: false },
      relations: ['clubId']
    });
    
    if (!event) {
      throw new NotFoundException(`Sự kiện với ID ${id} không tồn tại`);
    }
    
    return event;
  }

  /**
   * Cập nhật sự kiện
   */
  async update(id: string, updateEventDto: UpdateEventDto, userId: string): Promise<Event> {
    const event = await this.findOne(id);
    
    // Kiểm tra quyền cập nhật
    if (event.createdBy !== userId) {
      throw new BadRequestException('Bạn không có quyền cập nhật sự kiện này');
    }

    // Kiểm tra quyền trong CLB nếu có
    if (event.clubId) {
      await this.clubPermissionService.requireManageActivityPermission(
        event.clubId, 
        userId, 
        'event'
      );
    }

    // Cập nhật dữ liệu
    Object.assign(event, updateEventDto);
    
    // Cập nhật thời gian nếu có
    if (updateEventDto.startDate) {
      event.startDate = new Date(updateEventDto.startDate);
    }
    if (updateEventDto.endDate) {
      event.endDate = new Date(updateEventDto.endDate);
    }
    if (updateEventDto.registrationStartDate) {
      event.registrationStartDate = new Date(updateEventDto.registrationStartDate);
    }
    if (updateEventDto.registrationEndDate) {
      event.registrationEndDate = new Date(updateEventDto.registrationEndDate);
    }

    return this.eventRepository.save(event);
  }

  /**
   * Xóa sự kiện (soft delete)
   */
  async remove(id: string, userId: string): Promise<void> {
    const event = await this.findOne(id);
    
    // Kiểm tra quyền xóa
    if (event.createdBy !== userId) {
      throw new BadRequestException('Bạn không có quyền xóa sự kiện này');
    }

    // Kiểm tra quyền trong CLB nếu có
    if (event.clubId) {
      await this.clubPermissionService.requireManageActivityPermission(
        event.clubId, 
        userId, 
        'event'
      );
    }

    // Soft delete
    event.isDeleted = true;
    event.deletedAt = new Date();
    event.deletedBy = userId;
    
    await this.eventRepository.save(event);
  }

  /**
   * Tạo mã sự kiện tự động
   */
  private async generateEventCode(): Promise<string> {
    const prefix = 'EVT';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    
    const eventCode = `${prefix}${timestamp}${random}`;
    
    // Kiểm tra mã đã tồn tại chưa
    const existingEvent = await this.eventRepository.findOne({
      where: { eventCode, isDeleted: false }
    });
    
    if (existingEvent) {
      return this.generateEventCode(); // Thử lại nếu trùng
    }
    
    return eventCode;
  }

  /**
   * Xây dựng query builder cho tìm kiếm
   */
  private buildQueryBuilder(queryDto: QueryEventDto): SelectQueryBuilder<Event> {
    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .where('event.isDeleted = :isDeleted', { isDeleted: false });

    // Lọc theo CLB
    if (queryDto.clubId) {
      queryBuilder.andWhere('event.clubId = :clubId', { clubId: queryDto.clubId });
    }

    // Lọc theo loại sự kiện
    if (queryDto.type) {
      queryBuilder.andWhere('event.type = :type', { type: queryDto.type });
    }

    // Lọc theo trạng thái
    if (queryDto.status) {
      queryBuilder.andWhere('event.status = :status', { status: queryDto.status });
    }

    // Lọc theo quyền riêng tư
    if (queryDto.visibility) {
      queryBuilder.andWhere('event.visibility = :visibility', { visibility: queryDto.visibility });
    }

    // Lọc theo thời gian
    if (queryDto.startDateTo) {
      queryBuilder.andWhere('event.startDate >= :startDateTo', { startDateTo: new Date(queryDto.startDateTo) });
    }

    if (queryDto.endDateFrom) {
      queryBuilder.andWhere('event.endDate <= :endDateFrom', { endDateFrom: new Date(queryDto.endDateFrom) });
    }

    // Tìm kiếm theo tên
    if (queryDto.search) {
      queryBuilder.andWhere('event.name ILIKE :search', { search: `%${queryDto.search}%` });
    }

    // Sắp xếp
    const orderBy = queryDto.sortBy || 'startDate';
    const orderDirection = queryDto.sortOrder || 'ASC';
    queryBuilder.orderBy(`event.${orderBy}`, orderDirection);

    // Phân trang
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 20;
    const offset = (page - 1) * limit;
    
    queryBuilder.skip(offset).take(limit);

    return queryBuilder;
  }
}
