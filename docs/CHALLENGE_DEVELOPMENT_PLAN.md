# Challenge Module - Kế hoạch phát triển chi tiết

## **📋 Tổng quan**

Tài liệu này mô tả kế hoạch phát triển chi tiết cho module Challenge, bao gồm thử thách cá nhân và thử thách tập thể (Club vs Club).

---

## **🏗️ Backend (BE) Development Plan**

### **Phase 1: Database Schema & Core Services (Tuần 1)**

#### **1.1 Database Migrations**

##### **1.1.1 Cập nhật Challenge Entity**
```sql
-- Thêm các fields mới vào bảng challenges
ALTER TABLE challenges ADD COLUMN category VARCHAR(20) DEFAULT 'individual';
ALTER TABLE challenges ADD COLUMN max_team_members INTEGER;
ALTER TABLE challenges ADD COLUMN min_tracklog_distance DECIMAL(8,2);
ALTER TABLE challenges ADD COLUMN max_individual_contribution DECIMAL(8,2);
ALTER TABLE challenges ADD COLUMN max_teams INTEGER;

-- Tạo index cho performance
CREATE INDEX idx_challenges_category ON challenges(category);
CREATE INDEX idx_challenges_club_id ON challenges(club_id);
```

##### **1.1.2 Tạo bảng ChallengeTeam**
```sql
CREATE TABLE challenge_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    club_id UUID NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    total_distance DECIMAL(10,2) DEFAULT 0,
    member_count INTEGER DEFAULT 0,
    final_rank INTEGER,
    final_score DECIMAL(10,2),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    deleted_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(challenge_id, club_id),
    INDEX idx_challenge_teams_challenge_id (challenge_id),
    INDEX idx_challenge_teams_club_id (club_id)
);
```

##### **1.1.3 Tạo bảng ChallengeTeamMember**
```sql
CREATE TABLE challenge_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES challenge_teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    contributed_distance DECIMAL(10,2) DEFAULT 0,
    activity_count INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(team_id, user_id),
    INDEX idx_challenge_team_members_team_id (team_id),
    INDEX idx_challenge_team_members_user_id (user_id)
);
```

##### **1.1.4 Tạo bảng ChallengeInvitation**
```sql
CREATE TABLE challenge_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    invited_club_id UUID NOT NULL,
    invited_by UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    expires_at TIMESTAMP,
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(challenge_id, invited_club_id),
    INDEX idx_challenge_invitations_challenge_id (challenge_id),
    INDEX idx_challenge_invitations_invited_club_id (invited_club_id),
    INDEX idx_challenge_invitations_status (status)
);
```

##### **1.1.5 Tạo bảng ChallengeTeamLeaderboard**
```sql
CREATE TABLE challenge_team_leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    team_id UUID NOT NULL REFERENCES challenge_teams(id) ON DELETE CASCADE,
    total_distance DECIMAL(10,2) NOT NULL,
    member_count INTEGER NOT NULL,
    average_distance DECIMAL(10,2) NOT NULL,
    last_updated_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(challenge_id, rank),
    INDEX idx_challenge_team_leaderboards_challenge_id (challenge_id),
    INDEX idx_challenge_team_leaderboards_team_id (team_id)
);
```

#### **1.2 Entity Classes**

##### **1.2.1 Cập nhật Challenge Entity**
```typescript
// Thêm vào challenge.entity.ts
export enum ChallengeCategory {
  INDIVIDUAL = 'individual',
  TEAM = 'team'
}

// Thêm các fields mới
@Column({
  type: 'enum',
  enum: ChallengeCategory,
  default: ChallengeCategory.INDIVIDUAL
})
category: ChallengeCategory;

@Column({ type: 'int', nullable: true })
maxTeamMembers?: number;

@Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
minTracklogDistance?: number;

@Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
maxIndividualContribution?: number;

@Column({ type: 'int', nullable: true })
maxTeams?: number;
```

##### **1.2.2 Tạo ChallengeTeam Entity**
```typescript
// challenge-team.entity.ts
@Entity('challenge_teams')
export class ChallengeTeam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  challengeId: string;

  @Column({ type: 'uuid' })
  clubId: string;

  @Column({ length: 255 })
  teamName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalDistance: number;

  @Column({ type: 'int', default: 0 })
  memberCount: number;

  @Column({ type: 'int', nullable: true })
  finalRank?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  finalScore?: number;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @Column({ nullable: true })
  deletedBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### **1.3 Core Services**

##### **1.3.1 ChallengeTeamService**
```typescript
// challenge-team.service.ts
@Injectable()
export class ChallengeTeamService {
  constructor(
    @InjectRepository(ChallengeTeam)
    private teamRepository: Repository<ChallengeTeam>,
    @InjectRepository(ChallengeTeamMember)
    private memberRepository: Repository<ChallengeTeamMember>,
  ) {}

  async createTeam(challengeId: string, clubId: string, teamName: string): Promise<ChallengeTeam> {
    // Logic tạo team
  }

  async addMember(teamId: string, userId: string): Promise<ChallengeTeamMember> {
    // Logic thêm thành viên
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    // Logic xóa thành viên
  }

  async updateTeamProgress(teamId: string): Promise<void> {
    // Logic cập nhật tiến độ team
  }

  async getTeamMembers(teamId: string): Promise<ChallengeTeamMember[]> {
    // Logic lấy danh sách thành viên
  }
}
```

##### **1.3.2 ChallengeInvitationService**
```typescript
// challenge-invitation.service.ts
@Injectable()
export class ChallengeInvitationService {
  constructor(
    @InjectRepository(ChallengeInvitation)
    private invitationRepository: Repository<ChallengeInvitation>,
  ) {}

  async sendInvitation(challengeId: string, clubId: string, invitedBy: string): Promise<ChallengeInvitation> {
    // Logic gửi lời mời
  }

  async respondToInvitation(invitationId: string, status: string): Promise<ChallengeInvitation> {
    // Logic phản hồi lời mời
  }

  async getInvitationsByClub(clubId: string): Promise<ChallengeInvitation[]> {
    // Logic lấy lời mời theo club
  }

  async getInvitationsByChallenge(challengeId: string): Promise<ChallengeInvitation[]> {
    // Logic lấy lời mời theo challenge
  }
}
```

##### **1.3.3 ChallengeTeamLeaderboardService**
```typescript
// challenge-team-leaderboard.service.ts
@Injectable()
export class ChallengeTeamLeaderboardService {
  constructor(
    @InjectRepository(ChallengeTeamLeaderboard)
    private leaderboardRepository: Repository<ChallengeTeamLeaderboard>,
    @InjectRepository(ChallengeTeam)
    private teamRepository: Repository<ChallengeTeam>,
  ) {}

  async updateTeamLeaderboard(challengeId: string): Promise<void> {
    // Logic cập nhật bảng xếp hạng team
  }

  async getTeamLeaderboard(challengeId: string, limit: number = 50): Promise<ChallengeTeamLeaderboard[]> {
    // Logic lấy bảng xếp hạng team
  }

  async getTeamRank(challengeId: string, teamId: string): Promise<ChallengeTeamLeaderboard | null> {
    // Logic lấy xếp hạng team
  }
}
```

### **Phase 2: API Endpoints (Tuần 2)**

#### **2.1 Team Management APIs**

##### **2.1.1 ChallengeTeamController**
```typescript
// challenge-team.controller.ts
@ApiTags('🏆 Quản lý team thử thách')
@Controller('challenges/:challengeId/teams')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChallengeTeamController {
  constructor(private readonly challengeTeamService: ChallengeTeamService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo team tham gia thử thách' })
  async createTeam(
    @Param('challengeId') challengeId: string,
    @Body() createTeamDto: CreateTeamDto,
    @Req() req
  ): Promise<ChallengeTeam> {
    return this.challengeTeamService.createTeam(
      challengeId,
      req.user.clubId,
      createTeamDto.teamName
    );
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách teams tham gia thử thách' })
  async getTeams(@Param('challengeId') challengeId: string): Promise<ChallengeTeam[]> {
    return this.challengeTeamService.getTeamsByChallenge(challengeId);
  }

  @Post(':teamId/members')
  @ApiOperation({ summary: 'Thêm thành viên vào team' })
  async addMember(
    @Param('challengeId') challengeId: string,
    @Param('teamId') teamId: string,
    @Body() addMemberDto: AddMemberDto,
    @Req() req
  ): Promise<ChallengeTeamMember> {
    return this.challengeTeamService.addMember(teamId, addMemberDto.userId);
  }

  @Delete(':teamId/members/:userId')
  @ApiOperation({ summary: 'Xóa thành viên khỏi team' })
  async removeMember(
    @Param('challengeId') challengeId: string,
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
    @Req() req
  ): Promise<void> {
    return this.challengeTeamService.removeMember(teamId, userId);
  }
}
```

#### **2.2 Invitation APIs**

##### **2.2.1 ChallengeInvitationController**
```typescript
// challenge-invitation.controller.ts
@ApiTags('📧 Quản lý lời mời thử thách')
@Controller('challenges/:challengeId/invitations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChallengeInvitationController {
  constructor(private readonly challengeInvitationService: ChallengeInvitationService) {}

  @Post()
  @ApiOperation({ summary: 'Gửi lời mời tham gia thử thách' })
  async sendInvitation(
    @Param('challengeId') challengeId: string,
    @Body() sendInvitationDto: SendInvitationDto,
    @Req() req
  ): Promise<ChallengeInvitation> {
    return this.challengeInvitationService.sendInvitation(
      challengeId,
      sendInvitationDto.clubId,
      req.user.userId
    );
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách lời mời của thử thách' })
  async getInvitations(@Param('challengeId') challengeId: string): Promise<ChallengeInvitation[]> {
    return this.challengeInvitationService.getInvitationsByChallenge(challengeId);
  }

  @Patch(':invitationId')
  @ApiOperation({ summary: 'Phản hồi lời mời tham gia' })
  async respondToInvitation(
    @Param('challengeId') challengeId: string,
    @Param('invitationId') invitationId: string,
    @Body() respondDto: RespondInvitationDto,
    @Req() req
  ): Promise<ChallengeInvitation> {
    return this.challengeInvitationService.respondToInvitation(
      invitationId,
      respondDto.status
    );
  }
}
```

#### **2.3 Leaderboard APIs**

##### **2.3.1 ChallengeLeaderboardController (Cập nhật)**
```typescript
// challenge-leaderboard.controller.ts
@ApiTags('🏆 Bảng xếp hạng thử thách')
@Controller('challenges/:challengeId/leaderboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChallengeLeaderboardController {
  constructor(
    private readonly challengeLeaderboardService: ChallengeLeaderboardService,
    private readonly challengeTeamLeaderboardService: ChallengeTeamLeaderboardService,
  ) {}

  @Get('individual')
  @ApiOperation({ summary: 'Lấy bảng xếp hạng cá nhân' })
  async getIndividualLeaderboard(
    @Param('challengeId') challengeId: string,
    @Query('limit') limit: number = 50
  ): Promise<ChallengeLeaderboard[]> {
    return this.challengeLeaderboardService.getLeaderboard(challengeId, limit);
  }

  @Get('teams')
  @ApiOperation({ summary: 'Lấy bảng xếp hạng teams' })
  async getTeamLeaderboard(
    @Param('challengeId') challengeId: string,
    @Query('limit') limit: number = 50
  ): Promise<ChallengeTeamLeaderboard[]> {
    return this.challengeTeamLeaderboardService.getTeamLeaderboard(challengeId, limit);
  }

  @Get('combined')
  @ApiOperation({ summary: 'Lấy bảng xếp hạng kết hợp' })
  async getCombinedLeaderboard(
    @Param('challengeId') challengeId: string,
    @Query('limit') limit: number = 50
  ): Promise<{
    individual: ChallengeLeaderboard[];
    teams: ChallengeTeamLeaderboard[];
  }> {
    const [individual, teams] = await Promise.all([
      this.challengeLeaderboardService.getLeaderboard(challengeId, limit),
      this.challengeTeamLeaderboardService.getTeamLeaderboard(challengeId, limit),
    ]);

    return { individual, teams };
  }
}
```

### **Phase 3: Integration & Testing (Tuần 3)**

#### **3.1 Activity Integration**
- Tích hợp với ActivityService để cập nhật tiến độ
- Validation ngưỡng tối thiểu/tối đa
- Real-time updates cho leaderboard

#### **3.2 WebSocket Integration**
- Real-time leaderboard updates
- Team progress notifications
- Invitation notifications

#### **3.3 Testing**
- Unit tests cho tất cả services
- Integration tests cho API endpoints
- E2E tests cho workflows

---

## **🎨 Frontend (FE) Development Plan**

### **Phase 1: Core Components (Tuần 1)**

#### **1.1 Challenge Types & Filters**

##### **1.1.1 ChallengeCategoryFilter**
```typescript
// components/challenges/ChallengeCategoryFilter.tsx
interface ChallengeCategoryFilterProps {
  selectedCategory: ChallengeCategory;
  onCategoryChange: (category: ChallengeCategory) => void;
}

export default function ChallengeCategoryFilter({ 
  selectedCategory, 
  onCategoryChange 
}: ChallengeCategoryFilterProps) {
  return (
    <div className="flex gap-2 mb-6">
      <button
        className={`btn ${selectedCategory === 'individual' ? 'btn-primary' : 'btn-outline'}`}
        onClick={() => onCategoryChange('individual')}
      >
        🏃‍♂️ Cá nhân
      </button>
      <button
        className={`btn ${selectedCategory === 'team' ? 'btn-primary' : 'btn-outline'}`}
        onClick={() => onCategoryChange('team')}
      >
        👥 Tập thể
      </button>
    </div>
  );
}
```

##### **1.1.2 IndividualChallengeCard**
```typescript
// components/challenges/IndividualChallengeCard.tsx
interface IndividualChallengeCardProps {
  challenge: Challenge;
  onJoin: (challengeId: string) => void;
  onView: (challengeId: string) => void;
}

export default function IndividualChallengeCard({ 
  challenge, 
  onJoin, 
  onView 
}: IndividualChallengeCardProps) {
  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl">🏃‍♂️</div>
          <div className="badge badge-primary">
            {challenge.status === 'active' ? 'Đang diễn ra' : 'Đã công bố'}
          </div>
        </div>

        <h3 className="card-title text-lg mb-3">{challenge.name}</h3>
        <p className="text-base-content/70 text-sm mb-4">{challenge.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span>📅 {new Date(challenge.startDate).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>🎯 {challenge.targetValue} {challenge.targetUnit}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>👥 {challenge.participantCount} người tham gia</span>
          </div>
        </div>

        <div className="card-actions justify-between">
          <button 
            className="btn btn-primary btn-sm flex-1"
            onClick={() => onJoin(challenge.id)}
          >
            Tham gia
          </button>
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => onView(challenge.id)}
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
```

##### **1.1.3 TeamChallengeCard**
```typescript
// components/challenges/TeamChallengeCard.tsx
interface TeamChallengeCardProps {
  challenge: Challenge;
  onView: (challengeId: string) => void;
  onJoin: (challengeId: string) => void;
}

export default function TeamChallengeCard({ 
  challenge, 
  onView, 
  onJoin 
}: TeamChallengeCardProps) {
  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl">👥</div>
          <div className="badge badge-secondary">
            {challenge.status === 'active' ? 'Đang diễn ra' : 'Đã công bố'}
          </div>
        </div>

        <h3 className="card-title text-lg mb-3">{challenge.name}</h3>
        <p className="text-base-content/70 text-sm mb-4">{challenge.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span>📅 {new Date(challenge.startDate).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>🎯 {challenge.targetValue} {challenge.targetUnit}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>👥 {challenge.participantCount} teams tham gia</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>👤 Tối đa {challenge.maxTeamMembers} thành viên/team</span>
          </div>
        </div>

        <div className="card-actions justify-between">
          <button 
            className="btn btn-secondary btn-sm flex-1"
            onClick={() => onJoin(challenge.id)}
          >
            Tạo team
          </button>
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => onView(challenge.id)}
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### **1.2 Team Management Components**

##### **1.2.1 TeamInvitationCard**
```typescript
// components/challenges/TeamInvitationCard.tsx
interface TeamInvitationCardProps {
  invitation: ChallengeInvitation;
  onAccept: (invitationId: string) => void;
  onDecline: (invitationId: string) => void;
}

export default function TeamInvitationCard({ 
  invitation, 
  onAccept, 
  onDecline 
}: TeamInvitationCardProps) {
  return (
    <div className="card bg-base-100 shadow-lg border-l-4 border-primary">
      <div className="card-body">
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl">📧</div>
          <div className="badge badge-warning">Lời mời mới</div>
        </div>

        <h3 className="card-title text-lg mb-3">
          Lời mời tham gia thử thách
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span>🏆 {invitation.challenge.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>📅 {new Date(invitation.challenge.startDate).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>⏰ Hết hạn: {new Date(invitation.expiresAt).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>

        <div className="card-actions justify-between">
          <button 
            className="btn btn-primary btn-sm flex-1"
            onClick={() => onAccept(invitation.id)}
          >
            Chấp nhận
          </button>
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => onDecline(invitation.id)}
          >
            Từ chối
          </button>
        </div>
      </div>
    </div>
  );
}
```

##### **1.2.2 TeamMemberList**
```typescript
// components/challenges/TeamMemberList.tsx
interface TeamMemberListProps {
  team: ChallengeTeam;
  members: ChallengeTeamMember[];
  onRemoveMember: (memberId: string) => void;
  canManage: boolean;
}

export default function TeamMemberList({ 
  team, 
  members, 
  onRemoveMember, 
  canManage 
}: TeamMemberListProps) {
  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h3 className="card-title text-lg mb-4">
          👥 Thành viên team: {team.teamName}
        </h3>

        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="avatar placeholder">
                  <div className="bg-neutral text-neutral-content rounded-full w-10">
                    <span className="text-xs">{member.user.name.charAt(0)}</span>
                  </div>
                </div>
                <div>
                  <div className="font-medium">{member.user.name}</div>
                  <div className="text-sm text-base-content/70">
                    {member.contributedDistance}km • {member.activityCount} hoạt động
                  </div>
                </div>
              </div>
              
              {canManage && (
                <button 
                  className="btn btn-ghost btn-sm text-error"
                  onClick={() => onRemoveMember(member.id)}
                >
                  Xóa
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-primary/10 rounded-lg">
          <div className="text-sm font-medium text-primary">
            📊 Tổng tiến độ: {team.totalDistance}km
          </div>
        </div>
      </div>
    </div>
  );
}
```

### **Phase 2: Leaderboard & Detail Pages (Tuần 2)**

#### **2.1 Leaderboard Components**

##### **2.1.1 IndividualLeaderboard**
```typescript
// components/challenges/IndividualLeaderboard.tsx
interface IndividualLeaderboardProps {
  challengeId: string;
  leaderboard: ChallengeLeaderboard[];
  currentUserId?: string;
}

export default function IndividualLeaderboard({ 
  challengeId, 
  leaderboard, 
  currentUserId 
}: IndividualLeaderboardProps) {
  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h3 className="card-title text-lg mb-4">
          🏆 Bảng xếp hạng cá nhân
        </h3>

        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
            <div 
              key={entry.id} 
              className={`flex items-center justify-between p-3 rounded-lg ${
                entry.userId === currentUserId ? 'bg-primary/10 border border-primary' : 'bg-base-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-orange-600 text-white' :
                  'bg-base-300 text-base-content'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium">{entry.user.name}</div>
                  <div className="text-sm text-base-content/70">
                    {entry.progress}km • {entry.streak} ngày liên tiếp
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-primary">{entry.score} điểm</div>
                {entry.completionTime && (
                  <div className="text-sm text-base-content/70">
                    {Math.floor(entry.completionTime / 3600)}h {Math.floor((entry.completionTime % 3600) / 60)}m
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

##### **2.1.2 TeamLeaderboard**
```typescript
// components/challenges/TeamLeaderboard.tsx
interface TeamLeaderboardProps {
  challengeId: string;
  leaderboard: ChallengeTeamLeaderboard[];
  currentClubId?: string;
}

export default function TeamLeaderboard({ 
  challengeId, 
  leaderboard, 
  currentClubId 
}: TeamLeaderboardProps) {
  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h3 className="card-title text-lg mb-4">
          🏆 Bảng xếp hạng teams
        </h3>

        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
            <div 
              key={entry.id} 
              className={`flex items-center justify-between p-3 rounded-lg ${
                entry.team.clubId === currentClubId ? 'bg-secondary/10 border border-secondary' : 'bg-base-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-orange-600 text-white' :
                  'bg-base-300 text-base-content'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium">{entry.team.teamName}</div>
                  <div className="text-sm text-base-content/70">
                    {entry.team.club.name} • {entry.memberCount} thành viên
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-secondary">{entry.totalDistance}km</div>
                <div className="text-sm text-base-content/70">
                  TB: {entry.averageDistance.toFixed(1)}km/người
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### **Phase 3: Admin & Integration (Tuần 3)**

#### **3.1 Admin Components**

##### **3.1.1 ChallengeAdminDashboard**
```typescript
// components/admin/ChallengeAdminDashboard.tsx
export default function ChallengeAdminDashboard() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState<ChallengeStats | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Quản trị thử thách</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat bg-base-100 shadow-lg rounded-lg">
            <div className="stat-figure text-primary">
              <div className="text-3xl">🏆</div>
            </div>
            <div className="stat-title">Tổng thử thách</div>
            <div className="stat-value text-primary">{stats?.totalChallenges || 0}</div>
          </div>
          
          <div className="stat bg-base-100 shadow-lg rounded-lg">
            <div className="stat-figure text-secondary">
              <div className="text-3xl">🏃‍♂️</div>
            </div>
            <div className="stat-title">Thử thách cá nhân</div>
            <div className="stat-value text-secondary">{stats?.individualChallenges || 0}</div>
          </div>
          
          <div className="stat bg-base-100 shadow-lg rounded-lg">
            <div className="stat-figure text-accent">
              <div className="text-3xl">👥</div>
            </div>
            <div className="stat-title">Thử thách tập thể</div>
            <div className="stat-value text-accent">{stats?.teamChallenges || 0}</div>
          </div>
          
          <div className="stat bg-base-100 shadow-lg rounded-lg">
            <div className="stat-figure text-info">
              <div className="text-3xl">👤</div>
            </div>
            <div className="stat-title">Tổng người tham gia</div>
            <div className="stat-value text-info">{stats?.totalParticipants || 0}</div>
          </div>
        </div>
      </div>

      {/* Challenge Management */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="flex justify-between items-center mb-6">
            <h2 className="card-title">Danh sách thử thách</h2>
            <button className="btn btn-primary">
              ➕ Tạo thử thách mới
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Tên thử thách</th>
                  <th>Loại</th>
                  <th>Trạng thái</th>
                  <th>Người tham gia</th>
                  <th>Thời gian</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {challenges.map((challenge) => (
                  <tr key={challenge.id}>
                    <td>
                      <div>
                        <div className="font-bold">{challenge.name}</div>
                        <div className="text-sm opacity-50">{challenge.challengeCode}</div>
                      </div>
                    </td>
                    <td>
                      <div className={`badge ${
                        challenge.category === 'individual' ? 'badge-primary' : 'badge-secondary'
                      }`}>
                        {challenge.category === 'individual' ? 'Cá nhân' : 'Tập thể'}
                      </div>
                    </td>
                    <td>
                      <div className={`badge ${
                        challenge.status === 'active' ? 'badge-success' :
                        challenge.status === 'published' ? 'badge-info' :
                        'badge-warning'
                      }`}>
                        {challenge.status === 'active' ? 'Đang diễn ra' :
                         challenge.status === 'published' ? 'Đã công bố' :
                         'Nháp'}
                      </div>
                    </td>
                    <td>{challenge.participantCount}</td>
                    <td>
                      <div className="text-sm">
                        <div>{new Date(challenge.startDate).toLocaleDateString('vi-VN')}</div>
                        <div className="opacity-50">đến {new Date(challenge.endDate).toLocaleDateString('vi-VN')}</div>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-sm">✏️</button>
                        <button className="btn btn-ghost btn-sm">👁️</button>
                        <button className="btn btn-ghost btn-sm text-error">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### **3.2 Clubs Admin Integration**

##### **3.2.1 ClubChallengeSection**
```typescript
// components/clubs/ClubChallengeSection.tsx
interface ClubChallengeSectionProps {
  clubId: string;
  club: Club;
}

export default function ClubChallengeSection({ clubId, club }: ClubChallengeSectionProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [invitations, setInvitations] = useState<ChallengeInvitation[]>([]);
  const [teams, setTeams] = useState<ChallengeTeam[]>([]);

  return (
    <div className="space-y-6">
      {/* Challenge Invitations */}
      {invitations.length > 0 && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              📧 Lời mời tham gia thử thách
            </h3>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <TeamInvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  onAccept={(id) => handleAcceptInvitation(id)}
                  onDecline={(id) => handleDeclineInvitation(id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Club's Teams */}
      {teams.length > 0 && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              👥 Teams của {club.name}
            </h3>
            <div className="space-y-4">
              {teams.map((team) => (
                <div key={team.id} className="p-4 bg-base-200 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold">{team.teamName}</h4>
                      <p className="text-sm text-base-content/70">
                        {team.memberCount} thành viên • {team.totalDistance}km
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-base-content/70">Xếp hạng</div>
                      <div className="font-bold text-lg">
                        {team.finalRank ? `#${team.finalRank}` : 'Chưa xếp hạng'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="btn btn-primary btn-sm">
                      👁️ Xem chi tiết
                    </button>
                    <button className="btn btn-outline btn-sm">
                      👥 Quản lý thành viên
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create New Team */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-lg mb-4">
            ➕ Tạo team mới
          </h3>
          <button className="btn btn-primary">
            Tạo team tham gia thử thách
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## **📊 Testing Strategy**

### **Backend Testing**
- **Unit Tests**: Tất cả services và controllers
- **Integration Tests**: API endpoints và database operations
- **E2E Tests**: Complete workflows

### **Frontend Testing**
- **Component Tests**: React components với React Testing Library
- **Integration Tests**: API integration và state management
- **E2E Tests**: User workflows với Playwright

---

## **🚀 Deployment Plan**

### **Phase 1: Backend Deployment**
1. Database migrations
2. API deployment
3. Health checks

### **Phase 2: Frontend Deployment**
1. Build optimization
2. CDN deployment
3. Feature flags

### **Phase 3: Monitoring**
1. Performance monitoring
2. Error tracking
3. User analytics

---

**Tài liệu này cung cấp kế hoạch phát triển chi tiết cho module Challenge, bao gồm cả Backend và Frontend, với timeline 6 tuần.**
