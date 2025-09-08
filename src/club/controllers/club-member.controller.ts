import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  HttpStatus,
  HttpCode,
  Logger,
  ParseUUIDPipe,
  ParseIntPipe,
  Req
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ClubMemberService } from '../services/club-member.service';
import { 
  AddMemberDto, 
  UpdateMemberRoleDto, 
  UpdateMemberStatusDto, 
  TransferAdminDto, 
  RemoveMemberDto,
  MemberResponseDto 
} from '../dto/manage-member.dto';
import { MemberRole, MemberStatus } from '../entities/club-member.entity';
import { NotFoundException } from '@nestjs/common';

@ApiTags('Club - Member Management')
@Controller('clubs/:clubId/members')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClubMemberController {
  private readonly logger = new Logger(ClubMemberController.name);

  constructor(private readonly clubMemberService: ClubMemberService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Thêm thành viên mới vào câu lạc bộ',
    description: 'Chỉ admin mới có thể thêm thành viên mới'
  })
  @ApiParam({ name: 'clubId', description: 'ID câu lạc bộ' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Thêm thành viên thành công',
    type: MemberResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ hoặc thành viên đã tồn tại'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền admin'
  })
  async addMember(
    @Param('clubId', ParseUUIDPipe) clubId: string,
    @Body() addMemberDto: AddMemberDto,
    @Req() req: ExpressRequest & { user: { userId: string } }
  ): Promise<MemberResponseDto> {
    return this.clubMemberService.addMember(clubId, addMemberDto, req.user.userId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lấy danh sách thành viên câu lạc bộ',
    description: 'Thành viên có thể xem danh sách, admin/moderator xem chi tiết'
  })
  @ApiParam({ name: 'clubId', description: 'ID câu lạc bộ' })
  @ApiQuery({ name: 'page', required: false, description: 'Trang hiện tại', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng item mỗi trang', type: Number })
  @ApiQuery({ name: 'role', required: false, enum: MemberRole, description: 'Lọc theo vai trò' })
  @ApiQuery({ name: 'status', required: false, enum: MemberStatus, description: 'Lọc theo trạng thái' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sắp xếp theo: week hoặc month', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách thành viên thành công',
    schema: {
      type: 'object',
      properties: {
        members: {
          type: 'array',
          items: { $ref: '#/components/schemas/MemberResponseDto' }
        },
        total: { type: 'number' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không phải thành viên câu lạc bộ'
  })
  async getMembers(
    @Param('clubId', ParseUUIDPipe) clubId: string,
    @Req() req: ExpressRequest & { user: { userId: string } },
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query('role') role?: MemberRole,
    @Query('status') status?: MemberStatus,
    @Query('sortBy') sortBy?: string
  ): Promise<{ members: MemberResponseDto[]; total: number }> {
    return this.clubMemberService.getMembers(clubId, req.user.userId, page, limit, role, status, sortBy);
  }

  @Put(':userId/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cập nhật vai trò của thành viên',
    description: 'Chỉ admin mới có thể thay đổi vai trò thành viên'
  })
  @ApiParam({ name: 'clubId', description: 'ID câu lạc bộ' })
  @ApiParam({ name: 'userId', description: 'ID thành viên cần cập nhật' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật vai trò thành công',
    type: MemberResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Không thể thay đổi vai trò của chính mình'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền admin'
  })
  async updateMemberRole(
    @Param('clubId', ParseUUIDPipe) clubId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateRoleDto: UpdateMemberRoleDto,
    @Req() req: ExpressRequest & { user: { userId: string } }
  ): Promise<MemberResponseDto> {
    return this.clubMemberService.updateMemberRole(clubId, userId, updateRoleDto, req.user.userId);
  }

  @Put(':userId/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cập nhật trạng thái của thành viên',
    description: 'Chỉ admin mới có thể thay đổi trạng thái thành viên'
  })
  @ApiParam({ name: 'clubId', description: 'ID câu lạc bộ' })
  @ApiParam({ name: 'userId', description: 'ID thành viên cần cập nhật' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật trạng thái thành công',
    type: MemberResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Không thể thay đổi trạng thái của chính mình'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền admin'
  })
  async updateMemberStatus(
    @Param('clubId', ParseUUIDPipe) clubId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateStatusDto: UpdateMemberStatusDto,
    @Req() req: ExpressRequest & { user: { userId: string } }
  ): Promise<MemberResponseDto> {
    return this.clubMemberService.updateMemberStatus(clubId, userId, updateStatusDto, req.user.userId);
  }

  @Post('transfer-admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Chuyển giao quyền admin',
    description: 'Admin hiện tại chuyển giao quyền admin cho thành viên khác'
  })
  @ApiParam({ name: 'clubId', description: 'ID câu lạc bộ' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chuyển giao quyền admin thành công',
    type: MemberResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Không thể chuyển giao khi chỉ còn 1 admin duy nhất'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền admin'
  })
  async transferAdmin(
    @Param('clubId', ParseUUIDPipe) clubId: string,
    @Body() transferAdminDto: TransferAdminDto,
    @Req() req: ExpressRequest & { user: { userId: string } }
  ): Promise<MemberResponseDto> {
    return this.clubMemberService.transferAdmin(clubId, transferAdminDto, req.user.userId);
  }

  @Put(':userId/remove-admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gỡ quyền admin',
    description: 'Admin chính gỡ quyền admin của thành viên khác (chuyển về member)'
  })
  @ApiParam({ name: 'clubId', description: 'ID câu lạc bộ' })
  @ApiParam({ name: 'userId', description: 'ID thành viên cần gỡ quyền admin' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gỡ quyền admin thành công',
    type: MemberResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Không thể gỡ quyền admin của chính mình hoặc admin cuối cùng'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền admin'
  })
  async removeAdminRole(
    @Param('clubId', ParseUUIDPipe) clubId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req: ExpressRequest & { user: { userId: string } }
  ): Promise<MemberResponseDto> {
    return this.clubMemberService.removeAdminRole(clubId, userId, req.user.userId);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa thành viên khỏi câu lạc bộ',
    description: 'Chỉ admin mới có thể xóa thành viên'
  })
  @ApiParam({ name: 'clubId', description: 'ID câu lạc bộ' })
  @ApiParam({ name: 'userId', description: 'ID thành viên cần xóa' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Xóa thành viên thành công'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Không thể xóa chính mình hoặc admin cuối cùng'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền admin'
  })
  async removeMember(
    @Param('clubId', ParseUUIDPipe) clubId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() removeMemberDto: RemoveMemberDto,
    @Req() req: ExpressRequest & { user: { userId: string } }
  ): Promise<void> {
    return this.clubMemberService.removeMember(clubId, userId, removeMemberDto, req.user.userId);
  }

  @Get('my-role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lấy vai trò của mình trong câu lạc bộ',
    description: 'Thành viên xem vai trò và quyền của mình'
  })
  @ApiParam({ name: 'clubId', description: 'ID câu lạc bộ' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy vai trò thành công',
    type: MemberResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không phải thành viên câu lạc bộ'
  })
  async getMyRole(
    @Param('clubId', ParseUUIDPipe) clubId: string,
    @Req() req: ExpressRequest & { user: { userId: string } }
  ): Promise<MemberResponseDto> {
    const { members } = await this.clubMemberService.getMembers(clubId, req.user.userId, 1, 1);
    const myMember = members.find(m => m.userId === req.user.userId);
    
    if (!myMember) {
      throw new NotFoundException('Bạn không phải thành viên của câu lạc bộ này');
    }
    
    return myMember;
  }
}
