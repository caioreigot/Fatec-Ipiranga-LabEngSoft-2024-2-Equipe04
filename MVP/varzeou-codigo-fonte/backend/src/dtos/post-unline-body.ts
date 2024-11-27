import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class PostUnlikeBody {
  @IsNotEmpty({ message: 'O id do post não pode estar vazio.' })
  @Transform(({ value }) => value?.trim())
  postId: string;
}
