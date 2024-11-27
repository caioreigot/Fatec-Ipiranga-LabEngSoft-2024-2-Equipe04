import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class PostLikeBody {
  @IsNotEmpty({ message: 'O e-mail não pode estar vazio.' })
  @Transform(({ value }) => value?.trim())
  reaction: string;

  @IsNotEmpty({ message: 'O id do post não pode estar vazio.' })
  @Transform(({ value }) => value?.trim())
  postId: string;
}
