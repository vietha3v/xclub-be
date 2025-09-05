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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SocialService, SocialPost, SocialComment, SocialLike, SocialFollow, SocialFeed, SocialStats } from './social.service';

@ApiTags('👥 Tương tác xã hội')
@Controller('social')
@ApiBearerAuth('JWT-auth')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  /**
   * Lấy feed hoạt động
   */
  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy feed hoạt động',
    description: 'Lấy feed hoạt động của bạn bè và người đang follow'
  })
  @ApiQuery({ name: 'cursor', required: false, description: 'Cursor để phân trang' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng bài viết (mặc định 20)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Feed hoạt động',
    schema: {
      type: 'object',
      properties: {
        posts: { type: 'array', items: { type: 'object' } },
        hasMore: { type: 'boolean' },
        nextCursor: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getFeed(
    @Req() req: any,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number
  ): Promise<SocialFeed> {
    return this.socialService.getFeed(req.user.userId, cursor, limit);
  }

  /**
   * Tạo bài viết mới
   */
  @Post('posts')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Tạo bài viết mới',
    description: 'Tạo bài viết mới để chia sẻ với cộng đồng'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Tạo bài viết thành công',
    schema: { type: 'object' }
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async createPost(@Body() postData: any, @Req() req: any): Promise<SocialPost> {
    return this.socialService.createPost(req.user.userId, postData);
  }

  /**
   * Cập nhật bài viết
   */
  @Patch('posts/:postId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Cập nhật bài viết',
    description: 'Cập nhật nội dung bài viết'
  })
  @ApiParam({ name: 'postId', description: 'ID của bài viết' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cập nhật bài viết thành công',
    schema: { type: 'object' }
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật bài viết này' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết' })
  async updatePost(
    @Param('postId') postId: string,
    @Body() updateData: any,
    @Req() req: any
  ): Promise<SocialPost> {
    return this.socialService.updatePost(postId, req.user.userId, updateData);
  }

  /**
   * Xóa bài viết
   */
  @Delete('posts/:postId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Xóa bài viết',
    description: 'Xóa bài viết và tất cả tương tác liên quan'
  })
  @ApiParam({ name: 'postId', description: 'ID của bài viết' })
  @ApiResponse({ 
    status: 200, 
    description: 'Xóa bài viết thành công',
    schema: { type: 'object', properties: { message: { type: 'string' } } }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa bài viết này' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết' })
  async deletePost(@Param('postId') postId: string, @Req() req: any): Promise<{ message: string }> {
    await this.socialService.deletePost(postId, req.user.userId);
    return { message: 'Xóa bài viết thành công' };
  }

  /**
   * Like/Unlike bài viết
   */
  @Post('posts/:postId/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Like/Unlike bài viết',
    description: 'Like hoặc unlike bài viết'
  })
  @ApiParam({ name: 'postId', description: 'ID của bài viết' })
  @ApiResponse({ 
    status: 200, 
    description: 'Like/Unlike thành công',
    schema: {
      type: 'object',
      properties: {
        liked: { type: 'boolean' },
        likes: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết' })
  async toggleLike(
    @Param('postId') postId: string,
    @Body() body: { type?: string },
    @Req() req: any
  ): Promise<{ liked: boolean; likes: number }> {
    return this.socialService.toggleLike(postId, req.user.userId, body.type);
  }

  /**
   * Thêm comment
   */
  @Post('posts/:postId/comments')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Thêm comment',
    description: 'Thêm comment vào bài viết'
  })
  @ApiParam({ name: 'postId', description: 'ID của bài viết' })
  @ApiResponse({ 
    status: 201, 
    description: 'Thêm comment thành công',
    schema: { type: 'object' }
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết' })
  async addComment(
    @Param('postId') postId: string,
    @Body() body: { content: string; parentId?: string },
    @Req() req: any
  ): Promise<SocialComment> {
    return this.socialService.addComment(postId, req.user.userId, body.content, body.parentId);
  }

  /**
   * Cập nhật comment
   */
  @Patch('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Cập nhật comment',
    description: 'Cập nhật nội dung comment'
  })
  @ApiParam({ name: 'commentId', description: 'ID của comment' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cập nhật comment thành công',
    schema: { type: 'object' }
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật comment này' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy comment' })
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() body: { content: string },
    @Req() req: any
  ): Promise<SocialComment> {
    return this.socialService.updateComment(commentId, req.user.userId, body.content);
  }

  /**
   * Xóa comment
   */
  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Xóa comment',
    description: 'Xóa comment và replies liên quan'
  })
  @ApiParam({ name: 'commentId', description: 'ID của comment' })
  @ApiResponse({ 
    status: 200, 
    description: 'Xóa comment thành công',
    schema: { type: 'object', properties: { message: { type: 'string' } } }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa comment này' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy comment' })
  async deleteComment(@Param('commentId') commentId: string, @Req() req: any): Promise<{ message: string }> {
    await this.socialService.deleteComment(commentId, req.user.userId);
    return { message: 'Xóa comment thành công' };
  }

  /**
   * Like/Unlike comment
   */
  @Post('comments/:commentId/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Like/Unlike comment',
    description: 'Like hoặc unlike comment'
  })
  @ApiParam({ name: 'commentId', description: 'ID của comment' })
  @ApiResponse({ 
    status: 200, 
    description: 'Like/Unlike comment thành công',
    schema: {
      type: 'object',
      properties: {
        liked: { type: 'boolean' },
        likes: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy comment' })
  async toggleCommentLike(
    @Param('commentId') commentId: string,
    @Req() req: any
  ): Promise<{ liked: boolean; likes: number }> {
    return this.socialService.toggleCommentLike(commentId, req.user.userId);
  }

  /**
   * Chia sẻ bài viết
   */
  @Post('posts/:postId/share')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Chia sẻ bài viết',
    description: 'Chia sẻ bài viết với message tùy chỉnh'
  })
  @ApiParam({ name: 'postId', description: 'ID của bài viết' })
  @ApiResponse({ 
    status: 201, 
    description: 'Chia sẻ bài viết thành công',
    schema: { type: 'object' }
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết' })
  async sharePost(
    @Param('postId') postId: string,
    @Body() body: { message?: string },
    @Req() req: any
  ): Promise<SocialPost> {
    return this.socialService.sharePost(postId, req.user.userId, body.message);
  }

  /**
   * Follow người dùng
   */
  @Post('users/:userId/follow')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Follow người dùng',
    description: 'Follow người dùng để xem hoạt động của họ'
  })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiResponse({ 
    status: 201, 
    description: 'Follow người dùng thành công',
    schema: { type: 'object' }
  })
  @ApiResponse({ status: 400, description: 'Không thể follow chính mình' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  async followUser(
    @Param('userId') userId: string,
    @Req() req: any
  ): Promise<SocialFollow> {
    return this.socialService.followUser(req.user.userId, userId);
  }

  /**
   * Unfollow người dùng
   */
  @Delete('users/:userId/follow')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Unfollow người dùng',
    description: 'Unfollow người dùng'
  })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiResponse({ 
    status: 200, 
    description: 'Unfollow người dùng thành công',
    schema: { type: 'object', properties: { message: { type: 'string' } } }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  async unfollowUser(@Param('userId') userId: string, @Req() req: any): Promise<{ message: string }> {
    await this.socialService.unfollowUser(req.user.userId, userId);
    return { message: 'Unfollow người dùng thành công' };
  }

  /**
   * Chấp nhận/từ chối follow request
   */
  @Patch('follows/:followId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Chấp nhận/từ chối follow request',
    description: 'Chấp nhận hoặc từ chối follow request'
  })
  @ApiParam({ name: 'followId', description: 'ID của follow request' })
  @ApiResponse({ 
    status: 200, 
    description: 'Xử lý follow request thành công',
    schema: { type: 'object' }
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 403, description: 'Không có quyền xử lý follow request này' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy follow request' })
  async respondToFollowRequest(
    @Param('followId') followId: string,
    @Body() body: { accept: boolean },
    @Req() req: any
  ): Promise<SocialFollow> {
    return this.socialService.respondToFollowRequest(followId, req.user.userId, body.accept);
  }

  /**
   * Lấy danh sách follower
   */
  @Get('users/:userId/followers')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy danh sách follower',
    description: 'Lấy danh sách người theo dõi'
  })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiQuery({ name: 'cursor', required: false, description: 'Cursor để phân trang' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng follower (mặc định 20)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách follower',
    schema: {
      type: 'object',
      properties: {
        followers: { type: 'array', items: { type: 'object' } },
        hasMore: { type: 'boolean' },
        nextCursor: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  async getFollowers(
    @Param('userId') userId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number
  ): Promise<{ followers: SocialFollow[]; hasMore: boolean; nextCursor?: string }> {
    return this.socialService.getFollowers(userId, cursor, limit);
  }

  /**
   * Lấy danh sách following
   */
  @Get('users/:userId/following')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy danh sách following',
    description: 'Lấy danh sách người đang theo dõi'
  })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiQuery({ name: 'cursor', required: false, description: 'Cursor để phân trang' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng following (mặc định 20)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách following',
    schema: {
      type: 'object',
      properties: {
        following: { type: 'array', items: { type: 'object' } },
        hasMore: { type: 'boolean' },
        nextCursor: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  async getFollowing(
    @Param('userId') userId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number
  ): Promise<{ following: SocialFollow[]; hasMore: boolean; nextCursor?: string }> {
    return this.socialService.getFollowing(userId, cursor, limit);
  }

  /**
   * Tìm kiếm người dùng
   */
  @Get('users/search')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Tìm kiếm người dùng',
    description: 'Tìm kiếm người dùng theo tên'
  })
  @ApiQuery({ name: 'q', description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng kết quả (mặc định 20)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kết quả tìm kiếm người dùng',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          avatar: { type: 'string' },
          isFollowing: { type: 'boolean' },
          mutualFriends: { type: 'number' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async searchUsers(
    @Query('q') query: string,
    @Req() req: any,
    @Query('limit') limit?: number
  ): Promise<Array<{ id: string; name: string; avatar?: string; isFollowing: boolean; mutualFriends: number }>> {
    return this.socialService.searchUsers(query, req.user.userId, limit);
  }

  /**
   * Lấy gợi ý kết bạn
   */
  @Get('users/suggestions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy gợi ý kết bạn',
    description: 'Lấy danh sách gợi ý kết bạn dựa trên bạn chung và sở thích'
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng gợi ý (mặc định 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách gợi ý kết bạn',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          avatar: { type: 'string' },
          mutualFriends: { type: 'number' },
          reason: { type: 'string' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getFriendSuggestions(
    @Req() req: any,
    @Query('limit') limit?: number
  ): Promise<Array<{ id: string; name: string; avatar?: string; mutualFriends: number; reason: string }>> {
    return this.socialService.getFriendSuggestions(req.user.userId, limit);
  }

  /**
   * Lấy thống kê xã hội
   */
  @Get('users/:userId/stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy thống kê xã hội',
    description: 'Lấy thống kê về hoạt động xã hội của người dùng'
  })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thống kê xã hội',
    schema: {
      type: 'object',
      properties: {
        totalPosts: { type: 'number' },
        totalLikes: { type: 'number' },
        totalComments: { type: 'number' },
        totalShares: { type: 'number' },
        totalFollowers: { type: 'number' },
        totalFollowing: { type: 'number' },
        postsThisMonth: { type: 'number' },
        likesThisMonth: { type: 'number' },
        commentsThisMonth: { type: 'number' },
        sharesThisMonth: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  async getSocialStats(@Param('userId') userId: string): Promise<SocialStats> {
    return this.socialService.getSocialStats(userId);
  }

  /**
   * Lấy bài viết của người dùng
   */
  @Get('users/:userId/posts')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy bài viết của người dùng',
    description: 'Lấy danh sách bài viết của một người dùng'
  })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiQuery({ name: 'cursor', required: false, description: 'Cursor để phân trang' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng bài viết (mặc định 20)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách bài viết của người dùng',
    schema: {
      type: 'object',
      properties: {
        posts: { type: 'array', items: { type: 'object' } },
        hasMore: { type: 'boolean' },
        nextCursor: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  async getUserPosts(
    @Param('userId') userId: string,
    @Req() req: any,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number
  ): Promise<SocialFeed> {
    return this.socialService.getUserPosts(req.user.userId, userId, cursor, limit);
  }

  /**
   * Lấy comment của bài viết
   */
  @Get('posts/:postId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy comment của bài viết',
    description: 'Lấy danh sách comment của một bài viết'
  })
  @ApiParam({ name: 'postId', description: 'ID của bài viết' })
  @ApiQuery({ name: 'cursor', required: false, description: 'Cursor để phân trang' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng comment (mặc định 20)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách comment của bài viết',
    schema: {
      type: 'object',
      properties: {
        comments: { type: 'array', items: { type: 'object' } },
        hasMore: { type: 'boolean' },
        nextCursor: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết' })
  async getPostComments(
    @Param('postId') postId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number
  ): Promise<{ comments: SocialComment[]; hasMore: boolean; nextCursor?: string }> {
    return this.socialService.getPostComments(postId, cursor, limit);
  }

  /**
   * Lấy like của bài viết
   */
  @Get('posts/:postId/likes')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy like của bài viết',
    description: 'Lấy danh sách like của một bài viết'
  })
  @ApiParam({ name: 'postId', description: 'ID của bài viết' })
  @ApiQuery({ name: 'cursor', required: false, description: 'Cursor để phân trang' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng like (mặc định 20)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách like của bài viết',
    schema: {
      type: 'object',
      properties: {
        likes: { type: 'array', items: { type: 'object' } },
        hasMore: { type: 'boolean' },
        nextCursor: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết' })
  async getPostLikes(
    @Param('postId') postId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number
  ): Promise<{ likes: SocialLike[]; hasMore: boolean; nextCursor?: string }> {
    return this.socialService.getPostLikes(postId, cursor, limit);
  }

  /**
   * Báo cáo bài viết
   */
  @Post('posts/:postId/report')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Báo cáo bài viết',
    description: 'Báo cáo bài viết vi phạm quy định'
  })
  @ApiParam({ name: 'postId', description: 'ID của bài viết' })
  @ApiResponse({ 
    status: 200, 
    description: 'Báo cáo bài viết thành công',
    schema: { type: 'object', properties: { message: { type: 'string' } } }
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết' })
  async reportPost(
    @Param('postId') postId: string,
    @Body() body: { reason: string; description?: string },
    @Req() req: any
  ): Promise<{ message: string }> {
    await this.socialService.reportPost(postId, req.user.userId, body.reason, body.description);
    return { message: 'Báo cáo bài viết thành công' };
  }

  /**
   * Chặn người dùng
   */
  @Post('users/:userId/block')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Chặn người dùng',
    description: 'Chặn người dùng để không thấy hoạt động của họ'
  })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiResponse({ 
    status: 200, 
    description: 'Chặn người dùng thành công',
    schema: { type: 'object', properties: { message: { type: 'string' } } }
  })
  @ApiResponse({ status: 400, description: 'Không thể chặn chính mình' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  async blockUser(@Param('userId') userId: string, @Req() req: any): Promise<{ message: string }> {
    await this.socialService.blockUser(req.user.userId, userId);
    return { message: 'Chặn người dùng thành công' };
  }

  /**
   * Bỏ chặn người dùng
   */
  @Delete('users/:userId/block')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Bỏ chặn người dùng',
    description: 'Bỏ chặn người dùng'
  })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiResponse({ 
    status: 200, 
    description: 'Bỏ chặn người dùng thành công',
    schema: { type: 'object', properties: { message: { type: 'string' } } }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  async unblockUser(@Param('userId') userId: string, @Req() req: any): Promise<{ message: string }> {
    await this.socialService.unblockUser(req.user.userId, userId);
    return { message: 'Bỏ chặn người dùng thành công' };
  }

  /**
   * Lấy danh sách người bị chặn
   */
  @Get('users/blocked')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy danh sách người bị chặn',
    description: 'Lấy danh sách người dùng đã bị chặn'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách người bị chặn',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          avatar: { type: 'string' },
          blockedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getBlockedUsers(@Req() req: any): Promise<Array<{ id: string; name: string; avatar?: string; blockedAt: Date }>> {
    return this.socialService.getBlockedUsers(req.user.userId);
  }
}
