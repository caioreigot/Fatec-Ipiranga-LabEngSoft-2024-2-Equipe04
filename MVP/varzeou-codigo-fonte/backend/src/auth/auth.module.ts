import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './shared/auth.service';
import { JwtStrategy } from './shared/strategies/jwt.strategy';
import { LocalStrategyService } from './shared/strategies/local-strategy.service';
import { PrismaService } from '../services/prisma.service';
import { UserRepository } from '../repositories/user-repository';
import { PrismaUserRepository } from '../repositories/prisma/prisma-user-repository';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from 'src/email/email.module';
import { FirebaseModule } from 'src/firebase/firebase.module';

const jwtRegistered = JwtModule.register({ secret: process.env.JWT_SECRET });

@Module({
  imports: [
    PassportModule,
    jwtRegistered,
    EmailModule,
    FirebaseModule
  ],
  controllers: [],
  providers: [
    PrismaService,
    AuthService,
    LocalStrategyService,
    JwtStrategy,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [
    AuthService
  ],
})
export class AuthModule {}