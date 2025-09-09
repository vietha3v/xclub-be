import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({ 
    description: 'ID người dùng',
    example: 'uuid-cua-user'
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
