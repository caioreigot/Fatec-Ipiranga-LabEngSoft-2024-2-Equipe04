import { Transform } from 'class-transformer';
import { IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';

export class UserBody {
  @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
  @MaxLength(20, { message: 'Nome muito grande! Não é preciso colocar o nome completo aqui.' })
  @Transform(({ value }) => value?.trim())
  first_name: string;

  @IsNotEmpty({ message: 'O sobrenome não pode estar vazio.' })
  @Transform(({ value }) => value?.trim())
  last_name: string;

  @Matches(RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/), { message: 'O formato do e-mail não é válido.' })
  @IsNotEmpty({ message: 'O campo e-mail não pode estar vazio.' })
  @Transform(({ value }) => value?.trim())
  email: string;

  @MinLength(6, { message: 'A senha precisa ter no mínimo 6 caracteres.' })
  password: string;
}
