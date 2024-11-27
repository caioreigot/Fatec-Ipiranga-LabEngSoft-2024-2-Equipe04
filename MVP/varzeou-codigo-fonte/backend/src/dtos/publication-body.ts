import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class PublicationBody {
  @IsNotEmpty({ message: 'O texto do post não pode estar vazio.' })
  @Transform(({ value }) => value?.trim())
  text: string;
}
