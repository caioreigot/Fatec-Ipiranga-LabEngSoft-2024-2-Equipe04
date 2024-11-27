import { Transform } from 'class-transformer';
import { IsNotEmpty, MinLength } from 'class-validator';

export class CommentBody {
  @IsNotEmpty({ message: 'O texto do comentário não pode estar vazia.' })
  @Transform(({ value }) => value?.trim())
  @MinLength(1, { message: 'O texto do comentário não pode estar vazio.' })
  text: string;

  @IsNotEmpty({ message: 'O id do post não pode estar vazio.' })
  @Transform(({ value }) => value?.trim())
  postId: string;
}