import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/services/prisma.service';
import { Utils } from 'src/utils';

@Injectable()
export class AuthService {

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async validate(
    email: string,
    password: string
  ): Promise<{ id: string; email: string; }> {
    try {
      const hash = Utils.hashWithSha256(password);
      const user = await this.prisma.user.findFirstOrThrow({
        where: { email: email, password_hash: hash }
      });
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...rest } = user;
      return { ...rest };
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
        throw error;
      }

      if (error.code === 'P2025') {
        throw new HttpException(
          'E-mail ou senha errados, não foi possível logar.',
          HttpStatus.UNAUTHORIZED
        );
      }

      throw error;
    }
  }

  async buildAndSendToken(fullname: string, email: string) {
    const payload = { fullname, email };
    const options = { expiresIn: '12h' };

    return {
      access_token: this.jwtService.sign(payload, options)
    };
  }
}