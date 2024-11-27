import { Transform } from 'class-transformer';
import { IsNotEmpty, Matches, MinLength } from 'class-validator';

export class LoginBody {
  @Matches(RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/), { message: 'O formato do e-mail não é válido.' })
  @IsNotEmpty({ message: 'O campo e-mail não pode estar vazio.' })
  @Transform(({ value }) => value?.trim())
  email: string;

  @MinLength(6, { message: 'A senha precisa ter no mínimo 6 caracteres.' })
  password: string;
}
