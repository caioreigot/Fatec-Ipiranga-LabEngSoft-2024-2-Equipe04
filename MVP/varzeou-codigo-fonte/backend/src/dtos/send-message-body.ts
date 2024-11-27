import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class SendMessageBody {
  @IsNotEmpty({ message: 'A mensagem não pode estar vazia.' })
  @Transform(({ value }) => value?.trim())
  text: string;

  @IsNotEmpty({ message: 'O id do usuário alvo não pode estar vazio.' })
  @Transform(({ value }) => value?.trim())
  to: string;
}
