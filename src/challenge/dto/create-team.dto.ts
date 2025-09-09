import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ 
    description: 'Tên team',
    example: 'Team Marathon HCM'
  })
  @IsString()
  @IsNotEmpty()
  teamName: string;
}
