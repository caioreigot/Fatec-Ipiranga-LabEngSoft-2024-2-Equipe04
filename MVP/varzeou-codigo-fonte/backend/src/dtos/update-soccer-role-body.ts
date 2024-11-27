import { Transform } from 'class-transformer';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateSoccerRoleBody {
  @IsNotEmpty({ message: 'A função não pode estar vazia.' })
  @MaxLength(40, { message: 'O nome de função é muito grande.' })
  @Transform(({ value }) => value?.trim())
  role: string;
}
